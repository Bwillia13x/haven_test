import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useAetherStore } from '../stores/useAetherStore';
import * as THREE from 'three';

interface ViewPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

const VIEW_PRESETS: ViewPreset[] = [
  {
    name: 'Front',
    position: [0, 0, 15],
    target: [0, 0, 0]
  },
  {
    name: 'Back',
    position: [0, 0, -15],
    target: [0, 0, 0]
  },
  {
    name: 'Top',
    position: [0, 15, 0],
    target: [0, 0, 0]
  },
  {
    name: 'Bottom',
    position: [0, -15, 0],
    target: [0, 0, 0]
  },
  {
    name: 'Right',
    position: [15, 0, 0],
    target: [0, 0, 0]
  },
  {
    name: 'Left',
    position: [-15, 0, 0],
    target: [0, 0, 0]
  },
  {
    name: 'Isometric',
    position: [10, 10, 10],
    target: [0, 0, 0]
  },
  {
    name: 'Home',
    position: [10, 10, 10],
    target: [0, 0, 0]
  }
];

export function CameraController() {
  const { camera, controls } = useThree();
  const { selectedNodes, nodes, addNotification, addCameraBookmark } = useAetherStore();
  const isAnimating = useRef(false);

  const animateCamera = (
    targetPosition: [number, number, number], 
    targetLookAt: [number, number, number],
    duration = 1000
  ) => {
    if (isAnimating.current) return;
    
    isAnimating.current = true;
    
    const startPosition = camera.position.clone();
    const startLookAt = controls?.target ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
    
    const endPosition = new THREE.Vector3(...targetPosition);
    const endLookAt = new THREE.Vector3(...targetLookAt);
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);
      
      // Interpolate position
      camera.position.lerpVectors(startPosition, endPosition, easedProgress);
      
      // Interpolate look-at target
      if (controls) {
        const currentTarget = new THREE.Vector3().lerpVectors(startLookAt, endLookAt, easedProgress);
        controls.target.copy(currentTarget);
        controls.update();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
      }
    };
    
    animate();
  };

  const handleFocusSelected = () => {
    if (selectedNodes.length === 0) {
      addNotification('No nodes selected to focus on', 'warning');
      return;
    }

    // Calculate bounding box of selected nodes
    const selectedNodeObjects = nodes.filter(node => selectedNodes.includes(node.id));
    
    if (selectedNodeObjects.length === 0) return;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    selectedNodeObjects.forEach(node => {
      const [x, y, z] = node.position;
      const scale = node.scale || 1;
      
      minX = Math.min(minX, x - scale);
      minY = Math.min(minY, y - scale);
      minZ = Math.min(minZ, z - scale);
      maxX = Math.max(maxX, x + scale);
      maxY = Math.max(maxY, y + scale);
      maxZ = Math.max(maxZ, z + scale);
    });

    const center: [number, number, number] = [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    ];

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const distance = size * 2.5;

    const offset = new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(distance);
    const cameraPosition: [number, number, number] = [
      center[0] + offset.x,
      center[1] + offset.y,
      center[2] + offset.z
    ];

    animateCamera(cameraPosition, center);
    addNotification(`Focused on ${selectedNodes.length} selected node(s)`, 'success');
  };

  const handleFrameAll = () => {
    if (nodes.length === 0) {
      addNotification('No nodes to frame', 'warning');
      return;
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    nodes.forEach(node => {
      const [x, y, z] = node.position;
      const scale = node.scale || 1;
      
      minX = Math.min(minX, x - scale);
      minY = Math.min(minY, y - scale);
      minZ = Math.min(minZ, z - scale);
      maxX = Math.max(maxX, x + scale);
      maxY = Math.max(maxY, y + scale);
      maxZ = Math.max(maxZ, z + scale);
    });

    const center: [number, number, number] = [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    ];

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const distance = size * 2;

    const offset = new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(distance);
    const cameraPosition: [number, number, number] = [
      center[0] + offset.x,
      center[1] + offset.y,
      center[2] + offset.z
    ];

    animateCamera(cameraPosition, center);
    addNotification(`Framed all ${nodes.length} nodes`, 'success');
  };

  const handleViewPreset = (preset: ViewPreset) => {
    animateCamera(preset.position, preset.target);
    addNotification(`Switched to ${preset.name} view`, 'success');
  };

  // Listen for camera control events
  useEffect(() => {
    const handleCameraEvents = (e: CustomEvent) => {
      switch (e.type) {
        case 'camera-focus-selected':
          if (selectedNodes.length > 0) {
            handleFocusSelected();
          } else {
            handleFrameAll();
          }
          break;
        case 'camera-frame-all':
          handleFrameAll();
          break;
        case 'camera-home-view':
          const homePreset = VIEW_PRESETS.find(p => p.name === 'Home') || VIEW_PRESETS[VIEW_PRESETS.length - 1];
          handleViewPreset(homePreset);
          break;
        case 'camera-view-preset':
          const presetName = e.detail?.preset;
          const preset = VIEW_PRESETS.find(p => p.name === presetName);
          if (preset) {
            handleViewPreset(preset);
          }
          break;
        case 'camera-load-bookmark':
          const bookmark = e.detail?.bookmark;
          if (bookmark) {
            animateCamera(bookmark.position, bookmark.target);
            addNotification(`Loaded bookmark: ${bookmark.name}`, 'success');
          }
          break;
        case 'camera-save-bookmark':
          const bookmarkName = e.detail?.name;
          if (bookmarkName && camera && controls) {
            const position: [number, number, number] = [
              camera.position.x,
              camera.position.y,
              camera.position.z
            ];

            const target: [number, number, number] = controls?.target ? [
              controls.target.x,
              controls.target.y,
              controls.target.z
            ] : [0, 0, 0];

            addCameraBookmark(bookmarkName, position, target);
          }
          break;
      }
    };

    window.addEventListener('camera-focus-selected', handleCameraEvents as EventListener);
    window.addEventListener('camera-frame-all', handleCameraEvents as EventListener);
    window.addEventListener('camera-home-view', handleCameraEvents as EventListener);
    window.addEventListener('camera-view-preset', handleCameraEvents as EventListener);
    window.addEventListener('camera-load-bookmark', handleCameraEvents as EventListener);
    window.addEventListener('camera-save-bookmark', handleCameraEvents as EventListener);

    return () => {
      window.removeEventListener('camera-focus-selected', handleCameraEvents as EventListener);
      window.removeEventListener('camera-frame-all', handleCameraEvents as EventListener);
      window.removeEventListener('camera-home-view', handleCameraEvents as EventListener);
      window.removeEventListener('camera-view-preset', handleCameraEvents as EventListener);
      window.removeEventListener('camera-load-bookmark', handleCameraEvents as EventListener);
      window.removeEventListener('camera-save-bookmark', handleCameraEvents as EventListener);
    };
  }, [selectedNodes.length, nodes.length]);

  return null; // This component doesn't render anything
}