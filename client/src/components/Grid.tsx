import { useMemo } from "react";
import * as THREE from "three";
import { useAetherStore } from "../stores/useAetherStore";

export function Grid() {
  const { gridSize } = useAetherStore();
  
  const gridHelper = useMemo(() => {
    const helper = new THREE.GridHelper(20, 20 / gridSize, 0x444444, 0x222222);
    return helper;
  }, [gridSize]);

  return <primitive object={gridHelper} />;
}
