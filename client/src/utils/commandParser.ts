import { AetherNode } from "../types/aether";

export function executeCommand(commandString: string, get: () => any) {
  const cmd = commandString.trim().toLowerCase();
  
  try {
    get().saveToHistory();
    
    // Clear command
    if (cmd === 'clear') {
      get().set({ nodes: [], connectors: [], selectedNodes: [] });
      get().addNotification('Scene cleared', 'success');
      return;
    }
    
    // Create single node
    if (cmd.startsWith('create node at ')) {
      const coords = cmd.substring(15).split(',').map(x => parseFloat(x.trim()));
      if (coords.length === 3 && coords.every(x => !isNaN(x))) {
        get().addNode(coords as [number, number, number]);
        get().addNotification(`Node created at (${coords.join(', ')})`, 'success');
      } else {
        get().addNotification('Invalid coordinates', 'error');
      }
      return;
    }
    
    // Create cube
    if (cmd.startsWith('create cube size ')) {
      const match = cmd.match(/create cube size (\d+)\s*(?:spacing\s+(\d+(?:\.\d+)?))?/);
      if (match) {
        const size = parseInt(match[1]);
        const spacing = parseFloat(match[2] || '2');
        
        const nodes: string[] = [];
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
              const position: [number, number, number] = [
                (x - (size - 1) / 2) * spacing,
                (y - (size - 1) / 2) * spacing,
                (z - (size - 1) / 2) * spacing
              ];
              nodes.push(get().addNode(position, 'default', false));
            }
          }
        }
        
        // Connect adjacent nodes
        const currentNodes = get().nodes;
        nodes.forEach(nodeId => {
          const node = currentNodes.find((n: AetherNode) => n.id === nodeId);
          if (!node) return;
          
          nodes.forEach(otherNodeId => {
            if (nodeId === otherNodeId) return;
            const otherNode = currentNodes.find((n: AetherNode) => n.id === otherNodeId);
            if (!otherNode) return;
            
            const distance = Math.sqrt(
              Math.pow(node.position[0] - otherNode.position[0], 2) +
              Math.pow(node.position[1] - otherNode.position[1], 2) +
              Math.pow(node.position[2] - otherNode.position[2], 2)
            );
            
            if (distance <= spacing * 1.1) {
              get().addConnector(nodeId, otherNodeId);
            }
          });
        });
        
        get().addNotification(`Created ${size}×${size}×${size} cube`, 'success');
      }
      return;
    }
    
    // Create sphere
    if (cmd.startsWith('create sphere radius ')) {
      const match = cmd.match(/create sphere radius (\d+(?:\.\d+)?)\s*segments\s+(\d+)/);
      if (match) {
        const radius = parseFloat(match[1]);
        const segments = parseInt(match[2]);
        
        for (let i = 0; i < segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const phi = Math.acos(1 - 2 * Math.random());
          
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          
          get().addNode([x, y, z], 'default', false);
        }
        
        get().addNotification(`Created sphere with ${segments} nodes`, 'success');
      }
      return;
    }
    
    // Create spiral
    if (cmd.startsWith('create spiral turns ')) {
      const match = cmd.match(/create spiral turns (\d+)\s*radius\s+(\d+(?:\.\d+)?)\s*height\s+(\d+(?:\.\d+)?)\s*(?:segments\s+(\d+))?/);
      if (match) {
        const turns = parseInt(match[1]);
        const radius = parseFloat(match[2]);
        const height = parseFloat(match[3]);
        const segments = parseInt(match[4] || '50');
        
        const nodes: string[] = [];
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const angle = t * turns * Math.PI * 2;
          const x = radius * Math.cos(angle);
          const y = (t - 0.5) * height;
          const z = radius * Math.sin(angle);
          
          const nodeId = get().addNode([x, y, z], 'default', false);
          nodes.push(nodeId);
          
          if (i > 0) {
            get().addConnector(nodes[i-1], nodeId);
          }
        }
        
        get().addNotification(`Created spiral with ${segments} nodes`, 'success');
      }
      return;
    }
    
    // Connect all within distance
    if (cmd.startsWith('connect all distance ')) {
      const distance = parseFloat(cmd.substring(21));
      if (!isNaN(distance)) {
        const nodes = get().nodes;
        let connections = 0;
        
        nodes.forEach((nodeA: AetherNode) => {
          nodes.forEach((nodeB: AetherNode) => {
            if (nodeA.id === nodeB.id) return;
            
            const dist = Math.sqrt(
              Math.pow(nodeA.position[0] - nodeB.position[0], 2) +
              Math.pow(nodeA.position[1] - nodeB.position[1], 2) +
              Math.pow(nodeA.position[2] - nodeB.position[2], 2)
            );
            
            if (dist <= distance) {
              get().addConnector(nodeA.id, nodeB.id);
              connections++;
            }
          });
        });
        
        get().addNotification(`Created ${connections} connections`, 'success');
      }
      return;
    }
    
    // Select all nodes
    if (cmd === 'select all') {
      const allNodeIds = get().nodes.map((n: AetherNode) => n.id);
      get().selectNodes(allNodeIds);
      get().addNotification(`Selected ${allNodeIds.length} nodes`, 'success');
      return;
    }
    
    // Delete selected nodes
    if (cmd === 'delete selected') {
      const selectedNodes = get().selectedNodes;
      if (selectedNodes.length > 0) {
        get().deleteNodes(selectedNodes);
        get().addNotification(`Deleted ${selectedNodes.length} nodes`, 'success');
      } else {
        get().addNotification('No nodes selected', 'warning');
      }
      return;
    }
    
    // Unknown command
    get().addNotification('Unknown command', 'error');
    
  } catch (error) {
    get().addNotification('Command execution failed', 'error');
  }
}
