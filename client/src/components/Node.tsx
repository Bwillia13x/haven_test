import { useRef, useCallback, useState } from "react";
import { Sphere } from "@react-three/drei";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useAetherStore } from "../stores/useAetherStore";

interface NodeProps {
  id: string;
  position: [number, number, number];
  material?: string;
  scale?: number;
}

export function Node({ id, position, material = 'default', scale = 1 }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3>(new THREE.Vector3());
  
  const {
    selectedNodes,
    selectNode,
    setNodePosition,
    snapPosition,
    materials,
    multiSelect,
    connectionMode,
    firstNodeForConnection,
    addConnector,
    setFirstNodeForConnection,
    setConnectionMode,
    deleteNodes,
    addNode,
    setNodeMaterial,
    showContextMenu,
    addNotification
  } = useAetherStore();

  const isSelected = selectedNodes.includes(id);
  
  // Force re-render when material changes by accessing the node's material from store
  const currentNode = useAetherStore(state => state.nodes.find(n => n.id === id));
  const actualMaterial = currentNode?.material || material;
  const materialProps = materials[isSelected ? 'selected' : actualMaterial] || materials.default;

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    
    // Handle right-click for context menu
    if (e.nativeEvent.button === 2) {
      const screenPos = {
        x: e.nativeEvent.clientX,
        y: e.nativeEvent.clientY
      };
      
      // Show context menu for this node
      const contextItems = [
        {
          label: 'Delete Node',
          action: () => deleteNodes([id]),
          icon: () => <span>🗑️</span>,
          shortcut: 'Del'
        },
        {
          label: 'Duplicate Node',
          action: () => {
            const newPos = [position[0] + 1, position[1], position[2]] as [number, number, number];
            addNode(newPos, actualMaterial, false);
          },
          icon: () => <span>📋</span>,
          shortcut: 'Ctrl+D'
        },
        { type: 'separator' },
        {
          label: 'Change Material',
          icon: () => <span>🎨</span>,
          disabled: true
        },
        {
          label: '  → Default',
          action: () => setNodeMaterial(id, 'default'),
          icon: () => <span style={{color: materials.default.color}}>●</span>
        },
        {
          label: '  → Metallic',
          action: () => setNodeMaterial(id, 'metallic'),
          icon: () => <span style={{color: materials.metallic.color}}>●</span>
        },
        {
          label: '  → Glass',
          action: () => setNodeMaterial(id, 'glass'),
          icon: () => <span style={{color: materials.glass.color}}>●</span>
        },
        {
          label: '  → Neon',
          action: () => setNodeMaterial(id, 'neon'),
          icon: () => <span style={{color: materials.neon.color}}>●</span>
        },
        { type: 'separator' },
        {
          label: 'Focus Camera',
          action: () => {
            // This will be implemented when we add camera controls
            addNotification('Camera focus coming soon', 'info');
          },
          icon: () => <span>🎯</span>,
          shortcut: 'F'
        }
      ];
      
      showContextMenu(screenPos, contextItems);
      selectNode(id, false); // Select the node when right-clicking
      return;
    }
    
    if (connectionMode) {
      if (!firstNodeForConnection) {
        setFirstNodeForConnection(id);
      } else if (firstNodeForConnection !== id) {
        addConnector(firstNodeForConnection, id);
        setFirstNodeForConnection(null);
        setConnectionMode(false);
      }
      return;
    }

    setIsDragging(true);
    const worldPos = e.point;
    const currentPos = new THREE.Vector3(...position);
    setDragOffset(worldPos.clone().sub(currentPos));
    
    selectNode(id, multiSelect || e.ctrlKey || e.metaKey);
  }, [
    id, position, selectNode, multiSelect, connectionMode,
    firstNodeForConnection, addConnector, setFirstNodeForConnection, setConnectionMode,
    materials, actualMaterial, materialProps, deleteNodes, addNode, setNodeMaterial, showContextMenu, addNotification
  ]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const worldPos = e.point;
    const newPosition = worldPos.clone().sub(dragOffset);
    const snappedPosition = snapPosition([newPosition.x, newPosition.y, newPosition.z]);
    
    // If multiple nodes are selected, move them all together
    if (selectedNodes.length > 1 && selectedNodes.includes(id)) {
      const currentPosition = new THREE.Vector3(...position);
      const deltaPosition = new THREE.Vector3(...snappedPosition).sub(currentPosition);
      
      // Move all selected nodes by the same delta
      selectedNodes.forEach(nodeId => {
        if (nodeId !== id) {
          const node = useAetherStore.getState().nodes.find(n => n.id === nodeId);
          if (node) {
            const newPos = new THREE.Vector3(...node.position).add(deltaPosition);
            const snappedNewPos = snapPosition([newPos.x, newPos.y, newPos.z]);
            setNodePosition(nodeId, snappedNewPos);
          }
        }
      });
    }
    
    setNodePosition(id, snappedPosition);
  }, [isDragging, dragOffset, id, setNodePosition, snapPosition, selectedNodes, position]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Animate scale for newly created nodes
  useFrame(() => {
    if (meshRef.current && scale < 1) {
      const newScale = Math.min(1, scale + 0.05);
      meshRef.current.scale.setScalar(newScale);
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.15, 16, 16]}
      position={position}
      scale={[scale, scale, scale]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
    >
      <meshStandardMaterial
        color={materialProps.color}
        transparent={materialProps.opacity < 1}
        opacity={materialProps.opacity}
        metalness={materialProps.metalness}
        roughness={materialProps.roughness}
        emissive={isSelected ? new THREE.Color(0x444444) : new THREE.Color(0x000000)}
      />
    </Sphere>
  );
}
