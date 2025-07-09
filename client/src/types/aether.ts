export interface AetherNode {
  id: string;
  position: [number, number, number];
  material: string;
  scale?: number;
  created: number;
}

export interface AetherConnector {
  id: string;
  startNodeId: string;
  endNodeId: string;
  material: string;
  thickness: number;
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
