import { ProjectData } from "../types/aether";

export function exportProjectToJSON(state: any) {
  const data: ProjectData = {
    name: state.projectName,
    version: '2.0',
    nodes: state.nodes,
    connectors: state.connectors,
    materials: state.materials,
    settings: {
      gridSize: state.gridSize,
      showGrid: state.showGrid,
      snapToGrid: state.snapToGrid
    },
    exported: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.projectName}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  state.addNotification('Project exported successfully', 'success');
}

export function exportToSTL(nodes: any[], connectors: any[]) {
  // STL export functionality would be implemented here
  console.log('STL export not yet implemented');
}

export function exportToOBJ(nodes: any[], connectors: any[]) {
  // OBJ export functionality would be implemented here
  console.log('OBJ export not yet implemented');
}
