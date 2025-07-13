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

  const { points, isValid } = useMemo(() => {
    const startNode = nodes.find(n => n.id === startNodeId);
    const endNode = nodes.find(n => n.id === endNodeId);

    if (!startNode || !endNode) {
      return { points: [], isValid: false };
    }

    const startVec = new THREE.Vector3(...startNode.position);
    const endVec = new THREE.Vector3(...endNode.position);

    return {
      points: [startVec, endVec],
      isValid: true
    };
  }, [nodes, startNodeId, endNodeId]);

  const materialProps = materials[material] || materials.default;

  if (!isValid || points.length === 0) {
    return null;
  }

  return (
    <Line
      points={points}
      color={materialProps.color}
      lineWidth={1} // Keep it simple for now
    />
  );
}
