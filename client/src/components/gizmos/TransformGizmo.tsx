import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAetherStore } from '@/stores/useAetherStore';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type TransformSpace = 'world' | 'local';

interface TransformGizmoProps {
  nodeId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  mode: TransformMode;
  space: TransformSpace;
  size?: number;
  onTransform?: (nodeId: string, transform: any) => void;
}

const GIZMO_COLORS = {
  x: '#ff4444',
  y: '#44ff44', 
  z: '#4444ff',
  center: '#ffff44',
  hover: '#ffffff',
  selected: '#ff8800'
};

export function TransformGizmo({ 
  nodeId, 
  position, 
  rotation, 
  scale, 
  mode, 
  space, 
  size = 1,
  onTransform 
}: TransformGizmoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAxis, setDragAxis] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<THREE.Vector3>(new THREE.Vector3());
  const [initialTransform, setInitialTransform] = useState<any>(null);
  
  const { camera, raycaster, pointer } = useThree();
  const { setNodePosition, setNodeRotation, setNodeScale } = useAetherStore();

  // Update gizmo position and orientation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...position);
      
      if (space === 'local') {
        groupRef.current.rotation.set(...rotation);
      } else {
        groupRef.current.rotation.set(0, 0, 0);
      }
      
      // Scale gizmo based on camera distance for consistent size
      const distance = camera.position.distanceTo(new THREE.Vector3(...position));
      const scaleFactor = Math.max(0.1, distance * 0.1) * size;
      groupRef.current.scale.setScalar(scaleFactor);
    }
  }, [position, rotation, space, camera, size]);

  // Handle pointer events
  const handlePointerDown = useCallback((axis: string, event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    setDragAxis(axis);
    
    const worldPosition = new THREE.Vector3(...position);
    setDragStart(worldPosition.clone());
    setInitialTransform({ position: [...position], rotation: [...rotation], scale: [...scale] });
  }, [position, rotation, scale]);

  const handlePointerMove = useCallback((event: any) => {
    if (!isDragging || !dragAxis || !initialTransform) return;

    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera({ x, y }, camera);
    
    // Calculate movement based on transform mode and axis
    let delta = new THREE.Vector3();
    
    if (mode === 'translate') {
      // Create a plane perpendicular to the camera for translation
      const plane = new THREE.Plane();
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      plane.setFromNormalAndCoplanarPoint(cameraDirection, dragStart);
      
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      if (intersection) {
        delta = intersection.sub(dragStart);
        
        // Constrain to axis
        if (dragAxis === 'x') delta.set(delta.x, 0, 0);
        else if (dragAxis === 'y') delta.set(0, delta.y, 0);
        else if (dragAxis === 'z') delta.set(0, 0, delta.z);
        
        const newPosition: [number, number, number] = [
          initialTransform.position[0] + delta.x,
          initialTransform.position[1] + delta.y,
          initialTransform.position[2] + delta.z
        ];
        
        setNodePosition(nodeId, newPosition);
        onTransform?.(nodeId, { position: newPosition });
      }
    } else if (mode === 'rotate') {
      // Calculate rotation based on mouse movement
      const rotationSpeed = 0.01;
      const deltaRotation = (event.movementX || 0) * rotationSpeed;
      
      let newRotation = [...initialTransform.rotation] as [number, number, number];
      
      if (dragAxis === 'x') newRotation[0] += deltaRotation;
      else if (dragAxis === 'y') newRotation[1] += deltaRotation;
      else if (dragAxis === 'z') newRotation[2] += deltaRotation;
      
      setNodeRotation(nodeId, newRotation);
      onTransform?.(nodeId, { rotation: newRotation });
    } else if (mode === 'scale') {
      // Calculate scale based on mouse movement
      const scaleSpeed = 0.01;
      const deltaScale = (event.movementY || 0) * -scaleSpeed;
      
      let newScale = [...initialTransform.scale] as [number, number, number];
      
      if (dragAxis === 'center') {
        // Uniform scaling
        const scaleFactor = 1 + deltaScale;
        newScale = [
          initialTransform.scale[0] * scaleFactor,
          initialTransform.scale[1] * scaleFactor,
          initialTransform.scale[2] * scaleFactor
        ];
      } else {
        // Axis-specific scaling
        if (dragAxis === 'x') newScale[0] = Math.max(0.1, initialTransform.scale[0] + deltaScale);
        else if (dragAxis === 'y') newScale[1] = Math.max(0.1, initialTransform.scale[1] + deltaScale);
        else if (dragAxis === 'z') newScale[2] = Math.max(0.1, initialTransform.scale[2] + deltaScale);
      }
      
      setNodeScale(nodeId, newScale);
      onTransform?.(nodeId, { scale: newScale });
    }
  }, [isDragging, dragAxis, initialTransform, camera, raycaster, dragStart, nodeId, mode, setNodePosition, setNodeRotation, setNodeScale, onTransform]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragAxis(null);
    setInitialTransform(null);
  }, []);

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Render translation gizmo
  const renderTranslationGizmo = () => (
    <>
      {/* X Axis - Red */}
      <group>
        <mesh
          onPointerDown={(e) => handlePointerDown('x', e)}
          onPointerEnter={() => setHoveredAxis('x')}
          onPointerLeave={() => setHoveredAxis(null)}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color={hoveredAxis === 'x' ? GIZMO_COLORS.hover : GIZMO_COLORS.x} />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <coneGeometry args={[0.05, 0.2, 8]} />
          <meshBasicMaterial color={hoveredAxis === 'x' ? GIZMO_COLORS.hover : GIZMO_COLORS.x} />
        </mesh>
      </group>

      {/* Y Axis - Green */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh
          onPointerDown={(e) => handlePointerDown('y', e)}
          onPointerEnter={() => setHoveredAxis('y')}
          onPointerLeave={() => setHoveredAxis(null)}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color={hoveredAxis === 'y' ? GIZMO_COLORS.hover : GIZMO_COLORS.y} />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <coneGeometry args={[0.05, 0.2, 8]} />
          <meshBasicMaterial color={hoveredAxis === 'y' ? GIZMO_COLORS.hover : GIZMO_COLORS.y} />
        </mesh>
      </group>

      {/* Z Axis - Blue */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh
          onPointerDown={(e) => handlePointerDown('z', e)}
          onPointerEnter={() => setHoveredAxis('z')}
          onPointerLeave={() => setHoveredAxis(null)}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color={hoveredAxis === 'z' ? GIZMO_COLORS.hover : GIZMO_COLORS.z} />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <coneGeometry args={[0.05, 0.2, 8]} />
          <meshBasicMaterial color={hoveredAxis === 'z' ? GIZMO_COLORS.hover : GIZMO_COLORS.z} />
        </mesh>
      </group>

      {/* Center Handle */}
      <mesh
        onPointerDown={(e) => handlePointerDown('center', e)}
        onPointerEnter={() => setHoveredAxis('center')}
        onPointerLeave={() => setHoveredAxis(null)}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={hoveredAxis === 'center' ? GIZMO_COLORS.hover : GIZMO_COLORS.center} />
      </mesh>
    </>
  );

  // Render rotation gizmo
  const renderRotationGizmo = () => (
    <>
      {/* X Rotation Ring - Red */}
      <mesh
        onPointerDown={(e) => handlePointerDown('x', e)}
        onPointerEnter={() => setHoveredAxis('x')}
        onPointerLeave={() => setHoveredAxis(null)}
        rotation={[0, Math.PI / 2, 0]}
      >
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshBasicMaterial color={hoveredAxis === 'x' ? GIZMO_COLORS.hover : GIZMO_COLORS.x} />
      </mesh>

      {/* Y Rotation Ring - Green */}
      <mesh
        onPointerDown={(e) => handlePointerDown('y', e)}
        onPointerEnter={() => setHoveredAxis('y')}
        onPointerLeave={() => setHoveredAxis(null)}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshBasicMaterial color={hoveredAxis === 'y' ? GIZMO_COLORS.hover : GIZMO_COLORS.y} />
      </mesh>

      {/* Z Rotation Ring - Blue */}
      <mesh
        onPointerDown={(e) => handlePointerDown('z', e)}
        onPointerEnter={() => setHoveredAxis('z')}
        onPointerLeave={() => setHoveredAxis(null)}
      >
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshBasicMaterial color={hoveredAxis === 'z' ? GIZMO_COLORS.hover : GIZMO_COLORS.z} />
      </mesh>
    </>
  );

  // Render scale gizmo
  const renderScaleGizmo = () => (
    <>
      {/* X Scale Handle - Red */}
      <group>
        <mesh position={[0.8, 0, 0]}
          onPointerDown={(e) => handlePointerDown('x', e)}
          onPointerEnter={() => setHoveredAxis('x')}
          onPointerLeave={() => setHoveredAxis(null)}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={hoveredAxis === 'x' ? GIZMO_COLORS.hover : GIZMO_COLORS.x} />
        </mesh>
        <mesh position={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
          <meshBasicMaterial color={GIZMO_COLORS.x} />
        </mesh>
      </group>

      {/* Y Scale Handle - Green */}
      <group>
        <mesh position={[0, 0.8, 0]}
          onPointerDown={(e) => handlePointerDown('y', e)}
          onPointerEnter={() => setHoveredAxis('y')}
          onPointerLeave={() => setHoveredAxis(null)}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={hoveredAxis === 'y' ? GIZMO_COLORS.hover : GIZMO_COLORS.y} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
          <meshBasicMaterial color={GIZMO_COLORS.y} />
        </mesh>
      </group>

      {/* Z Scale Handle - Blue */}
      <group>
        <mesh position={[0, 0, 0.8]}
          onPointerDown={(e) => handlePointerDown('z', e)}
          onPointerEnter={() => setHoveredAxis('z')}
          onPointerLeave={() => setHoveredAxis(null)}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={hoveredAxis === 'z' ? GIZMO_COLORS.hover : GIZMO_COLORS.z} />
        </mesh>
        <mesh position={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
          <meshBasicMaterial color={GIZMO_COLORS.z} />
        </mesh>
      </group>

      {/* Center Uniform Scale Handle */}
      <mesh
        onPointerDown={(e) => handlePointerDown('center', e)}
        onPointerEnter={() => setHoveredAxis('center')}
        onPointerLeave={() => setHoveredAxis(null)}
      >
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshBasicMaterial color={hoveredAxis === 'center' ? GIZMO_COLORS.hover : GIZMO_COLORS.center} />
      </mesh>
    </>
  );

  return (
    <group ref={groupRef}>
      {mode === 'translate' && renderTranslationGizmo()}
      {mode === 'rotate' && renderRotationGizmo()}
      {mode === 'scale' && renderScaleGizmo()}
      
      {/* Transform Info Display */}
      {isDragging && (
        <Html position={[0, 1.5, 0]} center>
          <div className="glass-panel px-2 py-1 rounded text-xs text-on-surface">
            {mode === 'translate' && `Position: ${position.map(v => v.toFixed(2)).join(', ')}`}
            {mode === 'rotate' && `Rotation: ${rotation.map(v => (v * 180 / Math.PI).toFixed(1)).join('°, ')}°`}
            {mode === 'scale' && `Scale: ${scale.map(v => v.toFixed(2)).join(', ')}`}
          </div>
        </Html>
      )}
    </group>
  );
}
