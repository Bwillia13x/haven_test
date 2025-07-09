import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useAetherStore } from "../stores/useAetherStore";

interface ConnectorProps {
  startNodeId: string;
  endNodeId: string;
  material?: string;
  thickness?: number;
}

export function Connector({ startNodeId, endNodeId, material = 'default', thickness = 1 }: ConnectorProps) {
  const { nodes, materials } = useAetherStore();
  
  const points = useMemo(() => {
    const startNode = nodes.find(n => n.id === startNodeId);
    const endNode = nodes.find(n => n.id === endNodeId);
    
    if (!startNode || !endNode) return [];
    
    return [
      new THREE.Vector3(...startNode.position),
      new THREE.Vector3(...endNode.position)
    ];
  }, [nodes, startNodeId, endNodeId]);

  const materialProps = materials[material] || materials.default;

  if (points.length === 0) return null;

  return (
    <Line
      points={points}
      color={materialProps.color}
      lineWidth={thickness}
    />
  );
}
