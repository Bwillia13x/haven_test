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
    setConnectionMode
  } = useAetherStore();

  const isSelected = selectedNodes.includes(id);
  const materialProps = materials[isSelected ? 'selected' : material] || materials.default;

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    
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
    firstNodeForConnection, addConnector, setFirstNodeForConnection, setConnectionMode
  ]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const worldPos = e.point;
    const newPosition = worldPos.clone().sub(dragOffset);
    const snappedPosition = snapPosition([newPosition.x, newPosition.y, newPosition.z]);
    
    setNodePosition(id, snappedPosition);
  }, [isDragging, dragOffset, id, setNodePosition, snapPosition]);

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
