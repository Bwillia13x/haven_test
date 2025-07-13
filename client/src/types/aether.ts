export type NodeGeometry = 'sphere' | 'cube' | 'cylinder' | 'cone' | 'plane' | 'torus' | 'custom';

export interface NodeProperties {
  // Basic transform properties
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];

  // Geometry-specific parameters
  radius?: number;
  height?: number;
  width?: number;
  depth?: number;
  segments?: number;
  rings?: number;

  // Visual properties
  color?: string;
  opacity?: number;
  metalness?: number;
  roughness?: number;
  emissive?: string;

  // Advanced properties
  wireframe?: boolean;
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface AetherNode {
  id: string;
  geometry: NodeGeometry;
  properties: NodeProperties;
  material: string;
  created: number;

  // Legacy support for backward compatibility
  position: [number, number, number];
  scale?: number;
}

export type ConnectorType = 'straight' | 'bezier' | 'spline' | 'arc' | 'spring';
export type ConnectorStyle = 'solid' | 'dashed' | 'dotted' | 'animated';

export interface ConnectorProperties {
  thickness: number;
  style: ConnectorStyle;
  color?: string;
  opacity?: number;
  animated?: boolean;
  dashSize?: number;
  gapSize?: number;

  // Curve-specific properties
  controlPoints?: [number, number, number][];
  tension?: number;
  segments?: number;

  // Physics properties
  stiffness?: number;
  damping?: number;
  restLength?: number;

  // Smart routing properties
  autoRoute?: boolean;
  collisionAvoidance?: boolean;
  routingStyle?: 'manhattan' | 'smooth' | 'direct';
  avoidanceRadius?: number;
}

export interface AetherConnector {
  id: string;
  type: ConnectorType;
  startNodeId: string;
  endNodeId: string;
  material: string;
  properties: ConnectorProperties;

  // Legacy support
  thickness: number;
}

export type SurfaceType = 'triangulation' | 'quad' | 'convexHull' | 'grid';

export interface AetherSurface {
  id: string;
  nodeIds: string[];
  surfaceType: SurfaceType;
  material: string;
  opacity: number;
  wireframe: boolean;
  doubleSided: boolean;
  created: number;

  // Special surface types
  isLoft?: boolean;
  chain1?: string[];
  chain2?: string[];

  // Subdivision surface properties
  isSubdivision?: boolean;
  subdivisionType?: 'catmull-clark' | 'loop' | 'doo-sabin';
  subdivisionIterations?: number;
  showControlMesh?: boolean;
}

export interface Material {
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ProjectData {
  name: string;
  version: string;
  nodes: AetherNode[];
  connectors: AetherConnector[];
  materials: Record<string, Material>;
  settings: {
    gridSize: number;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  exported: string;
}
