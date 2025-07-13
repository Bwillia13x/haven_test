import { useMemo } from "react";
import * as THREE from "three";
import { useAetherStore } from "../stores/useAetherStore";

// Triangulation algorithms
const delaunayTriangulation = (points: THREE.Vector3[]): number[] => {
  // Simplified Delaunay triangulation for 3D points
  // This is a basic implementation - in production, you'd use a proper library like d3-delaunay
  const indices: number[] = [];
  
  if (points.length < 3) return indices;
  
  // For simplicity, create triangles from consecutive points
  // This is not true Delaunay but provides a basic mesh
  for (let i = 0; i < points.length - 2; i++) {
    indices.push(i, i + 1, i + 2);
  }
  
  return indices;
};

const generateQuadMesh = (points: THREE.Vector3[], width: number, height: number): number[] => {
  const indices: number[] = [];
  
  // Generate quad mesh indices
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const i = y * width + x;
      const i1 = i;
      const i2 = i + 1;
      const i3 = i + width;
      const i4 = i + width + 1;
      
      // Create two triangles for each quad
      indices.push(i1, i2, i3);
      indices.push(i2, i4, i3);
    }
  }
  
  return indices;
};

const generateConvexHull = (points: THREE.Vector3[]): number[] => {
  // Simplified convex hull for surface generation
  // This creates a basic hull by connecting points
  const indices: number[] = [];
  
  if (points.length < 4) return indices;
  
  // Find the bottom-most point
  let bottomIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[bottomIndex].y) {
      bottomIndex = i;
    }
  }
  
  // Create triangular faces from the bottom point to other points
  for (let i = 0; i < points.length - 1; i++) {
    if (i !== bottomIndex) {
      const next = (i + 1) % points.length;
      if (next !== bottomIndex) {
        indices.push(bottomIndex, i, next);
      }
    }
  }
  
  return indices;
};

interface SurfaceGeneratorProps {
  nodeIds: string[];
  surfaceType: 'triangulation' | 'quad' | 'convexHull' | 'grid';
  material?: string;
  opacity?: number;
  wireframe?: boolean;
  doubleSided?: boolean;
}

export function SurfaceGenerator({ 
  nodeIds, 
  surfaceType, 
  material = 'default',
  opacity = 0.7,
  wireframe = false,
  doubleSided = true
}: SurfaceGeneratorProps) {
  const { nodes, materials } = useAetherStore();
  
  const { geometry, isValid } = useMemo(() => {
    // Get the nodes for surface generation
    const surfaceNodes = nodes.filter(node => nodeIds.includes(node.id));
    
    if (surfaceNodes.length < 3) {
      return { geometry: null, isValid: false };
    }
    
    // Extract positions
    const points = surfaceNodes.map(node => 
      new THREE.Vector3(...(node.properties?.position || node.position))
    );
    
    let indices: number[] = [];
    
    switch (surfaceType) {
      case 'triangulation':
        indices = delaunayTriangulation(points);
        break;
        
      case 'quad':
        // For quad mesh, assume points are arranged in a grid
        const gridSize = Math.ceil(Math.sqrt(points.length));
        indices = generateQuadMesh(points, gridSize, gridSize);
        break;
        
      case 'convexHull':
        indices = generateConvexHull(points);
        break;
        
      case 'grid':
        // Generate a regular grid surface
        const gridWidth = Math.ceil(Math.sqrt(points.length));
        const gridHeight = Math.ceil(points.length / gridWidth);
        indices = generateQuadMesh(points, gridWidth, gridHeight);
        break;
        
      default:
        indices = delaunayTriangulation(points);
    }
    
    if (indices.length === 0) {
      return { geometry: null, isValid: false };
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Set positions
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    
    // Compute normals for proper lighting
    geometry.computeVertexNormals();
    
    return { geometry, isValid: true };
  }, [nodes, nodeIds, surfaceType]);
  
  const materialProps = materials[material] || materials.default;
  
  if (!isValid || !geometry) {
    return null;
  }
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={materialProps.color}
        transparent={opacity < 1}
        opacity={opacity}
        wireframe={wireframe}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
        metalness={materialProps.metalness || 0}
        roughness={materialProps.roughness || 0.5}
      />
    </mesh>
  );
}

// Surface generation utilities for the store
export const surfaceGenerationUtils = {
  // Generate surface from selected nodes
  generateSurfaceFromNodes: (
    nodeIds: string[], 
    surfaceType: 'triangulation' | 'quad' | 'convexHull' | 'grid' = 'triangulation'
  ) => {
    return {
      id: `surface_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nodeIds,
      surfaceType,
      material: 'default',
      opacity: 0.7,
      wireframe: false,
      doubleSided: true,
      created: Date.now()
    };
  },
  
  // Generate surface from node network (connected nodes)
  generateSurfaceFromNetwork: (
    startNodeId: string,
    nodes: any[],
    connectors: any[],
    maxDepth: number = 3
  ) => {
    const visited = new Set<string>();
    const networkNodes: string[] = [];
    
    const traverse = (nodeId: string, depth: number) => {
      if (depth > maxDepth || visited.has(nodeId)) return;
      
      visited.add(nodeId);
      networkNodes.push(nodeId);
      
      // Find connected nodes
      const connections = connectors.filter(c => 
        c.startNodeId === nodeId || c.endNodeId === nodeId
      );
      
      connections.forEach(connection => {
        const nextNodeId = connection.startNodeId === nodeId 
          ? connection.endNodeId 
          : connection.startNodeId;
        traverse(nextNodeId, depth + 1);
      });
    };
    
    traverse(startNodeId, 0);
    
    return surfaceGenerationUtils.generateSurfaceFromNodes(networkNodes);
  },
  
  // Generate surface between two node chains
  generateLoftSurface: (
    chain1NodeIds: string[],
    chain2NodeIds: string[]
  ) => {
    // Combine both chains for lofting
    const allNodeIds = [...chain1NodeIds, ...chain2NodeIds];
    
    return {
      id: `loft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nodeIds: allNodeIds,
      surfaceType: 'quad' as const,
      material: 'default',
      opacity: 0.7,
      wireframe: false,
      doubleSided: true,
      created: Date.now(),
      isLoft: true,
      chain1: chain1NodeIds,
      chain2: chain2NodeIds
    };
  }
};
