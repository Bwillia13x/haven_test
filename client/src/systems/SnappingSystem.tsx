import React, { useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useAetherStore } from '@/stores/useAetherStore';

export interface SnapSettings {
  enabled: boolean;
  gridSnap: boolean;
  objectSnap: boolean;
  angleSnap: boolean;
  gridSize: number;
  angleIncrement: number; // in degrees
  snapDistance: number; // maximum distance for snapping
  showSnapIndicators: boolean;
}

export interface SnapResult {
  position: THREE.Vector3;
  snapped: boolean;
  snapType: 'grid' | 'object' | 'angle' | 'none';
  snapTarget?: THREE.Vector3;
  snapAxis?: 'x' | 'y' | 'z';
}

export class SnappingSystem {
  private settings: SnapSettings;
  private nodes: any[];
  private snapIndicators: THREE.Object3D[] = [];

  constructor(settings: SnapSettings, nodes: any[]) {
    this.settings = settings;
    this.nodes = nodes;
  }

  // Main snapping function
  snapPosition(position: THREE.Vector3, excludeNodeId?: string): SnapResult {
    if (!this.settings.enabled) {
      return {
        position: position.clone(),
        snapped: false,
        snapType: 'none'
      };
    }

    let bestSnap: SnapResult = {
      position: position.clone(),
      snapped: false,
      snapType: 'none'
    };

    let minDistance = this.settings.snapDistance;

    // Grid snapping
    if (this.settings.gridSnap) {
      const gridSnap = this.snapToGrid(position);
      const distance = position.distanceTo(gridSnap.position);
      
      if (distance < minDistance) {
        bestSnap = gridSnap;
        minDistance = distance;
      }
    }

    // Object snapping
    if (this.settings.objectSnap) {
      const objectSnap = this.snapToObjects(position, excludeNodeId);
      const distance = position.distanceTo(objectSnap.position);
      
      if (objectSnap.snapped && distance < minDistance) {
        bestSnap = objectSnap;
        minDistance = distance;
      }
    }

    return bestSnap;
  }

  // Snap to grid
  private snapToGrid(position: THREE.Vector3): SnapResult {
    const gridSize = this.settings.gridSize;
    const snappedPosition = new THREE.Vector3(
      Math.round(position.x / gridSize) * gridSize,
      Math.round(position.y / gridSize) * gridSize,
      Math.round(position.z / gridSize) * gridSize
    );

    const distance = position.distanceTo(snappedPosition);
    const snapped = distance < this.settings.snapDistance;

    return {
      position: snapped ? snappedPosition : position.clone(),
      snapped,
      snapType: 'grid',
      snapTarget: snappedPosition
    };
  }

  // Snap to other objects
  private snapToObjects(position: THREE.Vector3, excludeNodeId?: string): SnapResult {
    let bestSnap: SnapResult = {
      position: position.clone(),
      snapped: false,
      snapType: 'object'
    };

    let minDistance = this.settings.snapDistance;

    for (const node of this.nodes) {
      if (node.id === excludeNodeId) continue;

      const nodePosition = new THREE.Vector3(...node.properties.position);
      
      // Snap to node center
      const centerDistance = position.distanceTo(nodePosition);
      if (centerDistance < minDistance) {
        bestSnap = {
          position: nodePosition.clone(),
          snapped: true,
          snapType: 'object',
          snapTarget: nodePosition
        };
        minDistance = centerDistance;
      }

      // Snap to node bounds (vertices, edges, faces)
      const boundsSnap = this.snapToBounds(position, node);
      if (boundsSnap.snapped) {
        const boundsDistance = position.distanceTo(boundsSnap.position);
        if (boundsDistance < minDistance) {
          bestSnap = boundsSnap;
          minDistance = boundsDistance;
        }
      }
    }

    return bestSnap;
  }

  // Snap to object bounds (vertices, edges, faces)
  private snapToBounds(position: THREE.Vector3, node: any): SnapResult {
    const nodePos = new THREE.Vector3(...node.properties.position);
    const nodeScale = new THREE.Vector3(...node.properties.scale);
    
    // Get geometry bounds based on node type
    let bounds: THREE.Vector3[] = [];
    
    switch (node.geometry) {
      case 'cube':
        bounds = this.getCubeBounds(nodePos, nodeScale);
        break;
      case 'sphere':
        bounds = this.getSphereBounds(nodePos, nodeScale);
        break;
      case 'cylinder':
        bounds = this.getCylinderBounds(nodePos, nodeScale);
        break;
      default:
        bounds = [nodePos]; // Fallback to center
    }

    let bestSnap: SnapResult = {
      position: position.clone(),
      snapped: false,
      snapType: 'object'
    };

    let minDistance = this.settings.snapDistance;

    for (const bound of bounds) {
      const distance = position.distanceTo(bound);
      if (distance < minDistance) {
        bestSnap = {
          position: bound.clone(),
          snapped: true,
          snapType: 'object',
          snapTarget: bound
        };
        minDistance = distance;
      }
    }

    return bestSnap;
  }

  // Get cube vertex positions
  private getCubeBounds(center: THREE.Vector3, scale: THREE.Vector3): THREE.Vector3[] {
    const bounds: THREE.Vector3[] = [];
    const halfScale = scale.clone().multiplyScalar(0.5);

    // 8 vertices of the cube
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          bounds.push(new THREE.Vector3(
            center.x + x * halfScale.x,
            center.y + y * halfScale.y,
            center.z + z * halfScale.z
          ));
        }
      }
    }

    // Face centers
    bounds.push(
      new THREE.Vector3(center.x + halfScale.x, center.y, center.z), // +X face
      new THREE.Vector3(center.x - halfScale.x, center.y, center.z), // -X face
      new THREE.Vector3(center.x, center.y + halfScale.y, center.z), // +Y face
      new THREE.Vector3(center.x, center.y - halfScale.y, center.z), // -Y face
      new THREE.Vector3(center.x, center.y, center.z + halfScale.z), // +Z face
      new THREE.Vector3(center.x, center.y, center.z - halfScale.z)  // -Z face
    );

    return bounds;
  }

  // Get sphere surface points
  private getSphereBounds(center: THREE.Vector3, scale: THREE.Vector3): THREE.Vector3[] {
    const bounds: THREE.Vector3[] = [];
    const radius = Math.max(scale.x, scale.y, scale.z) * 0.5;

    // Cardinal points on sphere surface
    bounds.push(
      new THREE.Vector3(center.x + radius, center.y, center.z), // +X
      new THREE.Vector3(center.x - radius, center.y, center.z), // -X
      new THREE.Vector3(center.x, center.y + radius, center.z), // +Y
      new THREE.Vector3(center.x, center.y - radius, center.z), // -Y
      new THREE.Vector3(center.x, center.y, center.z + radius), // +Z
      new THREE.Vector3(center.x, center.y, center.z - radius)  // -Z
    );

    return bounds;
  }

  // Get cylinder bounds
  private getCylinderBounds(center: THREE.Vector3, scale: THREE.Vector3): THREE.Vector3[] {
    const bounds: THREE.Vector3[] = [];
    const radius = Math.max(scale.x, scale.z) * 0.5;
    const height = scale.y;

    // Top and bottom centers
    bounds.push(
      new THREE.Vector3(center.x, center.y + height * 0.5, center.z),
      new THREE.Vector3(center.x, center.y - height * 0.5, center.z)
    );

    // Edge points on top and bottom circles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      
      bounds.push(
        new THREE.Vector3(x, center.y + height * 0.5, z),
        new THREE.Vector3(x, center.y - height * 0.5, z)
      );
    }

    return bounds;
  }

  // Snap rotation to angle increments
  snapRotation(rotation: THREE.Euler): THREE.Euler {
    if (!this.settings.enabled || !this.settings.angleSnap) {
      return rotation.clone();
    }

    const increment = (this.settings.angleIncrement * Math.PI) / 180; // Convert to radians
    
    return new THREE.Euler(
      Math.round(rotation.x / increment) * increment,
      Math.round(rotation.y / increment) * increment,
      Math.round(rotation.z / increment) * increment,
      rotation.order
    );
  }

  // Update settings
  updateSettings(newSettings: Partial<SnapSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Update nodes list
  updateNodes(nodes: any[]) {
    this.nodes = nodes;
  }
}

// React hook for using the snapping system
export function useSnapping() {
  const { nodes, snapToGrid, gridSize } = useAetherStore();

  const snapSettings: SnapSettings = useMemo(() => ({
    enabled: snapToGrid,
    gridSnap: snapToGrid,
    objectSnap: true,
    angleSnap: true,
    gridSize: gridSize,
    angleIncrement: 15, // 15 degree increments
    snapDistance: 0.5,
    showSnapIndicators: true
  }), [snapToGrid, gridSize]);

  const snappingSystem = useMemo(() => {
    return new SnappingSystem(snapSettings, nodes);
  }, [snapSettings, nodes]);

  const snapPosition = useCallback((position: THREE.Vector3, excludeNodeId?: string) => {
    return snappingSystem.snapPosition(position, excludeNodeId);
  }, [snappingSystem]);

  const snapRotation = useCallback((rotation: THREE.Euler) => {
    return snappingSystem.snapRotation(rotation);
  }, [snappingSystem]);

  return {
    snapPosition,
    snapRotation,
    settings: snapSettings,
    updateSettings: (newSettings: Partial<SnapSettings>) => {
      snappingSystem.updateSettings(newSettings);
    }
  };
}

// Snap indicator component for visual feedback
export function SnapIndicators({ snapResult }: { snapResult?: SnapResult }) {
  if (!snapResult?.snapped || !snapResult.snapTarget) {
    return null;
  }

  const color = snapResult.snapType === 'grid' ? '#ffff00' : '#ff8800';

  return (
    <group position={snapResult.snapTarget.toArray()}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.08, 0.12, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
