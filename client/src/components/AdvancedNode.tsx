import { useRef, useState, useCallback, useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Sphere, Box, Cylinder, Cone, Plane, Torus } from "@react-three/drei";
import * as THREE from "three";
import { useAetherStore } from "../stores/useAetherStore";
import { NodeGeometry, NodeProperties } from "../types/aether";

interface AdvancedNodeProps {
  id: string;
  geometry: NodeGeometry;
  properties: NodeProperties;
  material?: string;
}

export function AdvancedNode({ id, geometry, properties, material = 'default' }: AdvancedNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3>(new THREE.Vector3());
  
  const {
    selectedNodes,
    selectNode,
    setNodePosition,
    setNodeProperties,
    snapPosition,
    materials,
    multiSelect,
    connectionMode,
    movementMode,
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
  const materialProps = materials[material] || materials.default;

  // Get geometry-specific parameters with defaults
  const geometryParams = useMemo(() => {
    const defaults = {
      radius: 0.15,
      height: 0.3,
      width: 0.3,
      depth: 0.3,
      segments: 16,
      rings: 8
    };

    return {
      radius: properties.radius ?? defaults.radius,
      height: properties.height ?? defaults.height,
      width: properties.width ?? defaults.width,
      depth: properties.depth ?? defaults.depth,
      segments: properties.segments ?? defaults.segments,
      rings: properties.rings ?? defaults.rings
    };
  }, [properties]);

  // Handle pointer events
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    // Right click for context menu
    if (e.button === 2) {
      const screenPos = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
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
            const newPos = [properties.position[0] + 1, properties.position[1], properties.position[2]] as [number, number, number];
            addNode(newPos, material, false);
          },
          icon: () => <span>📋</span>,
          shortcut: 'Ctrl+D'
        },
        { type: 'separator' },
        {
          label: 'Change Geometry',
          icon: () => <span>🔷</span>,
          disabled: true
        },
        {
          label: '  → Sphere',
          action: () => setNodeGeometry(id, 'sphere'),
          icon: () => <span>⚪</span>
        },
        {
          label: '  → Cube',
          action: () => setNodeGeometry(id, 'cube'),
          icon: () => <span>⬜</span>
        },
        {
          label: '  → Cylinder',
          action: () => setNodeGeometry(id, 'cylinder'),
          icon: () => <span>🔵</span>
        },
        {
          label: '  → Cone',
          action: () => setNodeGeometry(id, 'cone'),
          icon: () => <span>🔺</span>
        }
      ];

      showContextMenu(screenPos, contextItems);
      selectNode(id, false);
      return;
    }

    // Check if we should enable movement (movement mode OR shift key pressed)
    const shouldEnableMovement = movementMode || e.shiftKey;
    
    if (connectionMode && !shouldEnableMovement) {
      if (!firstNodeForConnection) {
        setFirstNodeForConnection(id);
      } else if (firstNodeForConnection !== id) {
        addConnector(firstNodeForConnection, id);
        setFirstNodeForConnection(null);
        setConnectionMode(false);
      }
      return;
    }

    // Enable dragging if movement mode is on OR shift key is pressed
    if (shouldEnableMovement) {
      setIsDragging(true);
      const worldPos = e.point;
      const currentPos = new THREE.Vector3(...properties.position);
      setDragOffset(worldPos.clone().sub(currentPos));
      
      selectNode(id, multiSelect || e.ctrlKey || e.metaKey);
    } else if (!connectionMode) {
      // Just select the node if not in connection mode and not moving
      selectNode(id, multiSelect || e.ctrlKey || e.metaKey);
    }
  }, [
    id, properties, selectNode, multiSelect, connectionMode, movementMode,
    firstNodeForConnection, addConnector, setFirstNodeForConnection, setConnectionMode,
    materials, material, deleteNodes, addNode, setNodeMaterial, showContextMenu, addNotification
  ]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const worldPos = e.point;
    const newPosition = worldPos.clone().sub(dragOffset);
    const snappedPosition = snapPosition([newPosition.x, newPosition.y, newPosition.z]);
    
    // If multiple nodes are selected, move them all together
    if (selectedNodes.length > 1 && selectedNodes.includes(id)) {
      const currentPosition = new THREE.Vector3(...properties.position);
      const deltaPosition = new THREE.Vector3(...snappedPosition).sub(currentPosition);
      
      // Move all selected nodes by the same delta
      selectedNodes.forEach(nodeId => {
        if (nodeId !== id) {
          const node = useAetherStore.getState().nodes.find(n => n.id === nodeId);
          if (node) {
            const newPos = new THREE.Vector3(...node.properties.position).add(deltaPosition);
            const snappedNewPos = snapPosition([newPos.x, newPos.y, newPos.z]);
            setNodePosition(nodeId, snappedNewPos);
          }
        }
      });
    }
    
    setNodePosition(id, snappedPosition);
  }, [isDragging, dragOffset, id, setNodePosition, snapPosition, selectedNodes, properties.position]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Placeholder for setNodeGeometry - will be implemented in store
  const setNodeGeometry = useCallback((nodeId: string, newGeometry: NodeGeometry) => {
    // This will be implemented in the store
    addNotification(`Geometry change to ${newGeometry} not yet implemented`, 'info');
  }, [addNotification]);

  // Render the appropriate geometry
  const renderGeometry = () => {
    const commonProps = {
      ref: meshRef,
      position: properties.position,
      rotation: properties.rotation,
      scale: properties.scale,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onContextMenu: (e: any) => e.nativeEvent.preventDefault(),
      castShadow: properties.castShadow ?? true,
      receiveShadow: properties.receiveShadow ?? true,
      visible: properties.visible ?? true
    };

    const materialComponent = (
      <meshStandardMaterial
        color={properties.color || materialProps.color}
        transparent={(properties.opacity ?? materialProps.opacity) < 1}
        opacity={properties.opacity ?? materialProps.opacity}
        metalness={properties.metalness ?? materialProps.metalness}
        roughness={properties.roughness ?? materialProps.roughness}
        emissive={isSelected ? new THREE.Color(0x444444) : new THREE.Color(properties.emissive || 0x000000)}
        wireframe={properties.wireframe ?? false}
      />
    );

    switch (geometry) {
      case 'sphere':
        return (
          <Sphere {...commonProps} args={[geometryParams.radius, geometryParams.segments, geometryParams.rings]}>
            {materialComponent}
          </Sphere>
        );
      
      case 'cube':
        return (
          <Box {...commonProps} args={[geometryParams.width, geometryParams.height, geometryParams.depth]}>
            {materialComponent}
          </Box>
        );
      
      case 'cylinder':
        return (
          <Cylinder {...commonProps} args={[geometryParams.radius, geometryParams.radius, geometryParams.height, geometryParams.segments]}>
            {materialComponent}
          </Cylinder>
        );
      
      case 'cone':
        return (
          <Cone {...commonProps} args={[geometryParams.radius, geometryParams.height, geometryParams.segments]}>
            {materialComponent}
          </Cone>
        );
      
      case 'plane':
        return (
          <Plane {...commonProps} args={[geometryParams.width, geometryParams.height]}>
            {materialComponent}
          </Plane>
        );
      
      case 'torus':
        return (
          <Torus {...commonProps} args={[geometryParams.radius, geometryParams.radius * 0.3, geometryParams.rings, geometryParams.segments]}>
            {materialComponent}
          </Torus>
        );
      
      default:
        // Fallback to sphere for unknown geometries
        return (
          <Sphere {...commonProps} args={[geometryParams.radius, geometryParams.segments, geometryParams.rings]}>
            {materialComponent}
          </Sphere>
        );
    }
  };

  return renderGeometry();
}
