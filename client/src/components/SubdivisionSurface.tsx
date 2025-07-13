import { useMemo } from "react";
import * as THREE from "three";
import { useAetherStore } from "../stores/useAetherStore";

// Catmull-Clark subdivision algorithm (simplified)
const subdivideGeometry = (geometry: THREE.BufferGeometry, iterations: number = 1): THREE.BufferGeometry => {
  let currentGeometry = geometry.clone();
  
  for (let i = 0; i < iterations; i++) {
    currentGeometry = performSubdivisionStep(currentGeometry);
  }
  
  return currentGeometry;
};

const performSubdivisionStep = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
  const positions = geometry.getAttribute('position');
  const indices = geometry.getIndex();
  
  if (!positions || !indices) {
    return geometry;
  }
  
  const vertices: THREE.Vector3[] = [];
  const faces: number[][] = [];
  
  // Extract vertices
  for (let i = 0; i < positions.count; i++) {
    vertices.push(new THREE.Vector3(
      positions.getX(i),
      positions.getY(i),
      positions.getZ(i)
    ));
  }
  
  // Extract faces (assuming triangles)
  for (let i = 0; i < indices.count; i += 3) {
    faces.push([
      indices.getX(i),
      indices.getX(i + 1),
      indices.getX(i + 2)
    ]);
  }
  
  // Simplified subdivision: add midpoints and smooth
  const newVertices: THREE.Vector3[] = [...vertices];
  const newFaces: number[][] = [];
  
  // For each face, create 4 new faces
  faces.forEach(face => {
    const [a, b, c] = face;
    
    // Calculate midpoints
    const midAB = vertices[a].clone().add(vertices[b]).multiplyScalar(0.5);
    const midBC = vertices[b].clone().add(vertices[c]).multiplyScalar(0.5);
    const midCA = vertices[c].clone().add(vertices[a]).multiplyScalar(0.5);
    
    // Add midpoints as new vertices
    const midABIndex = newVertices.length;
    newVertices.push(midAB);
    
    const midBCIndex = newVertices.length;
    newVertices.push(midBC);
    
    const midCAIndex = newVertices.length;
    newVertices.push(midCA);
    
    // Create 4 new triangular faces
    newFaces.push([a, midABIndex, midCAIndex]);
    newFaces.push([midABIndex, b, midBCIndex]);
    newFaces.push([midCAIndex, midBCIndex, c]);
    newFaces.push([midABIndex, midBCIndex, midCAIndex]);
  });
  
  // Apply smoothing (simplified Laplacian smoothing)
  const smoothedVertices = newVertices.map((vertex, index) => {
    if (index < vertices.length) {
      // Original vertices - apply smoothing based on neighbors
      const neighbors: THREE.Vector3[] = [];
      
      newFaces.forEach(face => {
        if (face.includes(index)) {
          face.forEach(vertexIndex => {
            if (vertexIndex !== index && vertexIndex < vertices.length) {
              neighbors.push(newVertices[vertexIndex]);
            }
          });
        }
      });
      
      if (neighbors.length > 0) {
        const avgNeighbor = neighbors.reduce((sum, neighbor) => sum.add(neighbor), new THREE.Vector3()).divideScalar(neighbors.length);
        return vertex.clone().lerp(avgNeighbor, 0.1); // Gentle smoothing
      }
    }
    return vertex.clone();
  });
  
  // Create new geometry
  const newGeometry = new THREE.BufferGeometry();
  
  // Set positions
  const newPositions = new Float32Array(smoothedVertices.length * 3);
  smoothedVertices.forEach((vertex, index) => {
    newPositions[index * 3] = vertex.x;
    newPositions[index * 3 + 1] = vertex.y;
    newPositions[index * 3 + 2] = vertex.z;
  });
  
  newGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  
  // Set indices
  const newIndices: number[] = [];
  newFaces.forEach(face => {
    newIndices.push(...face);
  });
  
  newGeometry.setIndex(newIndices);
  newGeometry.computeVertexNormals();
  
  return newGeometry;
};

// Loop subdivision (alternative algorithm)
const loopSubdivision = (geometry: THREE.BufferGeometry, iterations: number = 1): THREE.BufferGeometry => {
  let currentGeometry = geometry.clone();
  
  for (let i = 0; i < iterations; i++) {
    currentGeometry = performLoopSubdivisionStep(currentGeometry);
  }
  
  return currentGeometry;
};

const performLoopSubdivisionStep = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
  // Simplified Loop subdivision
  // In a full implementation, this would handle edge cases and boundary conditions
  return performSubdivisionStep(geometry); // Use Catmull-Clark for now
};

interface SubdivisionSurfaceProps {
  nodeIds: string[];
  subdivisionType: 'catmull-clark' | 'loop' | 'doo-sabin';
  iterations: number;
  material?: string;
  opacity?: number;
  wireframe?: boolean;
  showControlMesh?: boolean;
}

export function SubdivisionSurface({ 
  nodeIds, 
  subdivisionType, 
  iterations,
  material = 'default',
  opacity = 0.8,
  wireframe = false,
  showControlMesh = false
}: SubdivisionSurfaceProps) {
  const { nodes, materials } = useAetherStore();
  
  const { controlGeometry, subdivisionGeometry, isValid } = useMemo(() => {
    // Get the nodes for subdivision
    const controlNodes = nodes.filter(node => nodeIds.includes(node.id));
    
    if (controlNodes.length < 4) {
      return { controlGeometry: null, subdivisionGeometry: null, isValid: false };
    }
    
    // Create control mesh from nodes
    const points = controlNodes.map(node => 
      new THREE.Vector3(...(node.properties?.position || node.position))
    );
    
    // Create a basic control mesh (simplified triangulation)
    const controlGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    
    controlGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create simple triangulation
    const indices: number[] = [];
    for (let i = 0; i < points.length - 2; i++) {
      indices.push(0, i + 1, i + 2);
    }
    
    controlGeometry.setIndex(indices);
    controlGeometry.computeVertexNormals();
    
    // Apply subdivision
    let subdivisionGeometry: THREE.BufferGeometry;
    
    switch (subdivisionType) {
      case 'catmull-clark':
        subdivisionGeometry = subdivideGeometry(controlGeometry, iterations);
        break;
      case 'loop':
        subdivisionGeometry = loopSubdivision(controlGeometry, iterations);
        break;
      case 'doo-sabin':
        // Simplified - use Catmull-Clark for now
        subdivisionGeometry = subdivideGeometry(controlGeometry, iterations);
        break;
      default:
        subdivisionGeometry = subdivideGeometry(controlGeometry, iterations);
    }
    
    return { controlGeometry, subdivisionGeometry, isValid: true };
  }, [nodes, nodeIds, subdivisionType, iterations]);
  
  const materialProps = materials[material] || materials.default;
  
  if (!isValid || !subdivisionGeometry) {
    return null;
  }
  
  return (
    <group>
      {/* Subdivision surface */}
      <mesh geometry={subdivisionGeometry}>
        <meshStandardMaterial
          color={materialProps.color}
          transparent={opacity < 1}
          opacity={opacity}
          wireframe={wireframe}
          side={THREE.DoubleSide}
          metalness={materialProps.metalness || 0}
          roughness={materialProps.roughness || 0.3}
        />
      </mesh>
      
      {/* Control mesh (optional) */}
      {showControlMesh && controlGeometry && (
        <mesh geometry={controlGeometry}>
          <meshBasicMaterial
            color="#ff6b6b"
            wireframe={true}
            transparent={true}
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

// Subdivision surface utilities for the store
export const subdivisionSurfaceUtils = {
  // Generate subdivision surface from selected nodes
  generateSubdivisionSurface: (
    nodeIds: string[], 
    subdivisionType: 'catmull-clark' | 'loop' | 'doo-sabin' = 'catmull-clark',
    iterations: number = 1
  ) => {
    return {
      id: `subdivision_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nodeIds,
      subdivisionType,
      iterations,
      material: 'default',
      opacity: 0.8,
      wireframe: false,
      showControlMesh: false,
      created: Date.now()
    };
  }
};
