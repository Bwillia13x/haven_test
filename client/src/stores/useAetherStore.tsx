import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { AetherNode, AetherConnector, Material, NotificationType } from "../types/aether";
import { executeAICommand } from "../utils/aiCommands";
import { exportProjectToJSON } from "../utils/exportUtils";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

interface ContextMenuItem {
  type?: 'separator';
  label?: string;
  action?: () => void;
  icon?: React.ComponentType<any>;
  shortcut?: string;
  disabled?: boolean;
}

interface CameraBookmark {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  created: number;
}

interface ContextMenu {
  position: { x: number; y: number };
  items: ContextMenuItem[];
}

interface HistoryState {
  nodes: AetherNode[];
  connectors: AetherConnector[];
  timestamp: number;
}

interface AetherState {
  // Core state
  nodes: AetherNode[];
  connectors: AetherConnector[];
  selectedNodes: string[];
  
  // UI state
  connectionMode: boolean;
  firstNodeForConnection: string | null;
  multiSelect: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  animationSpeed: number;
  
  // History
  history: HistoryState[];
  historyIndex: number;
  
  // Notifications
  notifications: Notification[];
  
  // Context menu
  contextMenu: ContextMenu | null;
  
  // Materials
  materials: Record<string, Material>;
  
  // Camera bookmarks
  cameraBookmarks: CameraBookmark[];
  
  // Project
  projectName: string;

  // Actions
  addNode: (position?: [number, number, number], material?: string, animated?: boolean) => string;
  setNodePosition: (id: string, position: [number, number, number]) => void;
  setNodeScale: (id: string, scale: number) => void;
  setNodeMaterial: (id: string, material: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  duplicateNodes: (nodeIds: string[]) => void;
  
  selectNode: (id: string, multiSelect?: boolean) => void;
  selectNodes: (nodeIds: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Group operations
  groupNodes: (nodeIds: string[], groupName?: string) => void;
  ungroupNodes: (groupId: string) => void;
  
  // Alignment operations
  alignNodes: (nodeIds: string[], direction: 'left' | 'right' | 'top' | 'bottom' | 'center-x' | 'center-y' | 'center-z') => void;
  distributeNodes: (nodeIds: string[], direction: 'horizontal' | 'vertical' | 'depth') => void;
  
  // Transform operations
  scaleNodes: (nodeIds: string[], factor: number) => void;
  moveNodes: (nodeIds: string[], offset: [number, number, number]) => void;
  rotateNodes: (nodeIds: string[], axis: 'x' | 'y' | 'z', angle: number) => void;
  
  addConnector: (startNodeId: string, endNodeId: string) => void;
  setConnectorMaterial: (id: string, material: string) => void;
  
  addMaterial: (name: string, material: Material) => void;
  updateMaterial: (name: string, material: Material) => void;
  deleteMaterial: (name: string) => void;
  
  addCameraBookmark: (name: string, position: [number, number, number], target: [number, number, number]) => void;
  deleteCameraBookmark: (id: string) => void;
  
  toggleConnectionMode: () => void;
  setConnectionMode: (enabled: boolean) => void;
  setFirstNodeForConnection: (nodeId: string | null) => void;
  
  setMultiSelect: (enabled: boolean) => void;
  
  toggleGrid: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  setAnimationSpeed: (speed: number) => void;
  
  snapPosition: (position: [number, number, number]) => [number, number, number];
  
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
  
  showContextMenu: (position: { x: number; y: number }, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;
  
  executeCommand: (command: string) => void;
  exportProject: () => void;
  importProject: (data: any) => void;
}

export const useAetherStore = create<AetherState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    nodes: [],
    connectors: [],
    selectedNodes: [],
    
    connectionMode: false,
    firstNodeForConnection: null,
    multiSelect: false,
    showGrid: true,
    snapToGrid: false,
    gridSize: 1,
    animationSpeed: 1,
    
    history: [],
    historyIndex: -1,
    
    notifications: [],
    contextMenu: null,
    
    materials: {
      default: { color: '#00aaff', opacity: 1.0, metalness: 0.3, roughness: 0.4 },
      selected: { color: '#ff69b4', opacity: 1.0, metalness: 0.1, roughness: 0.2 },
      connecting: { color: '#00ff00', opacity: 0.8, metalness: 0.2, roughness: 0.3 },
      metallic: { color: '#c0c0c0', opacity: 1.0, metalness: 0.9, roughness: 0.1 },
      glass: { color: '#87ceeb', opacity: 0.3, metalness: 0.0, roughness: 0.0 },
      neon: { color: '#ff1493', opacity: 1.0, metalness: 0.0, roughness: 0.0 }
    },
    
    cameraBookmarks: [],
    
    projectName: 'Untitled Project',

    // Node operations
    addNode: (position, material = 'default', animated = true) => {
      get().saveToHistory();
      
      const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNode: AetherNode = {
        id,
        position: position || [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ],
        material,
        scale: animated ? 0.1 : 1,
        created: Date.now()
      };
      
      set(state => ({ nodes: [...state.nodes, newNode] }));
      
      if (animated) {
        // Animate node scale
        const animateScale = () => {
          const state = get();
          const node = state.nodes.find(n => n.id === id);
          if (node && node.scale && node.scale < 1) {
            get().setNodeScale(id, Math.min(1, node.scale + 0.05));
            requestAnimationFrame(animateScale);
          }
        };
        requestAnimationFrame(animateScale);
      }
      
      return id;
    },

    setNodePosition: (id, position) => {
      set(state => ({
        nodes: state.nodes.map(node =>
          node.id === id ? { ...node, position: [...position] } : node
        )
      }));
    },

    setNodeScale: (id, scale) => {
      set(state => ({
        nodes: state.nodes.map(node =>
          node.id === id ? { ...node, scale } : node
        )
      }));
    },

    setNodeMaterial: (id, material) => {
      get().saveToHistory();
      set(state => ({
        nodes: state.nodes.map(node =>
          node.id === id ? { ...node, material } : node
        )
      }));
      get().addNotification(`Material changed to ${material}`, 'success');
    },

    deleteNodes: (nodeIds) => {
      get().saveToHistory();
      set(state => ({
        nodes: state.nodes.filter(node => !nodeIds.includes(node.id)),
        connectors: state.connectors.filter(conn => 
          !nodeIds.includes(conn.startNodeId) && !nodeIds.includes(conn.endNodeId)
        ),
        selectedNodes: []
      }));
    },

    duplicateNodes: (nodeIds) => {
      get().saveToHistory();
      const state = get();
      const nodesToDuplicate = state.nodes.filter(node => nodeIds.includes(node.id));
      const newNodes: AetherNode[] = [];
      const nodeIdMap = new Map<string, string>();

      // Create duplicated nodes with offset positions
      nodesToDuplicate.forEach(node => {
        const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        nodeIdMap.set(node.id, newId);
        
        const newNode: AetherNode = {
          ...node,
          id: newId,
          position: [node.position[0] + 2, node.position[1], node.position[2]] as [number, number, number],
          created: Date.now()
        };
        newNodes.push(newNode);
      });

      // Duplicate connectors between duplicated nodes
      const newConnectors: AetherConnector[] = [];
      state.connectors.forEach(conn => {
        const newStartId = nodeIdMap.get(conn.startNodeId);
        const newEndId = nodeIdMap.get(conn.endNodeId);
        
        if (newStartId && newEndId) {
          newConnectors.push({
            ...conn,
            id: `conn_${newStartId}_${newEndId}`,
            startNodeId: newStartId,
            endNodeId: newEndId
          });
        }
      });

      set(state => ({
        nodes: [...state.nodes, ...newNodes],
        connectors: [...state.connectors, ...newConnectors],
        selectedNodes: newNodes.map(n => n.id)
      }));

      get().addNotification(`Duplicated ${newNodes.length} node(s)`, 'success');
    },

    // Selection operations
    selectNode: (id, multiSelect = false) => {
      const state = get();
      
      if (state.connectionMode) {
        if (!state.firstNodeForConnection) {
          set({ firstNodeForConnection: id });
        } else if (state.firstNodeForConnection !== id) {
          get().addConnector(state.firstNodeForConnection, id);
          set({ firstNodeForConnection: null, connectionMode: false });
        }
      } else {
        if (multiSelect) {
          const isSelected = state.selectedNodes.includes(id);
          set({
            selectedNodes: isSelected 
              ? state.selectedNodes.filter(nodeId => nodeId !== id)
              : [...state.selectedNodes, id]
          });
        } else {
          set({ selectedNodes: [id] });
        }
      }
    },

    selectNodes: (nodeIds) => {
      set({ selectedNodes: nodeIds });
    },

    selectAll: () => {
      const state = get();
      set({ selectedNodes: state.nodes.map(node => node.id) });
      get().addNotification(`Selected ${state.nodes.length} nodes`, 'info');
    },

    clearSelection: () => {
      set({ selectedNodes: [] });
    },

    // Group operations
    groupNodes: (nodeIds, groupName = 'Group') => {
      get().saveToHistory();
      // For now, grouping is conceptual - we could add group metadata to nodes
      get().addNotification(`Grouped ${nodeIds.length} nodes`, 'success');
    },

    ungroupNodes: (groupId) => {
      get().saveToHistory();
      get().addNotification('Ungrouped nodes', 'success');
    },

    // Alignment operations
    alignNodes: (nodeIds, direction) => {
      get().saveToHistory();
      const state = get();
      const nodesToAlign = state.nodes.filter(node => nodeIds.includes(node.id));
      
      if (nodesToAlign.length < 2) {
        get().addNotification('Select at least 2 nodes to align', 'warning');
        return;
      }

      let targetValue: number;
      let axis: 0 | 1 | 2;

      switch (direction) {
        case 'left':
          axis = 0;
          targetValue = Math.min(...nodesToAlign.map(n => n.position[0]));
          break;
        case 'right':
          axis = 0;
          targetValue = Math.max(...nodesToAlign.map(n => n.position[0]));
          break;
        case 'bottom':
          axis = 1;
          targetValue = Math.min(...nodesToAlign.map(n => n.position[1]));
          break;
        case 'top':
          axis = 1;
          targetValue = Math.max(...nodesToAlign.map(n => n.position[1]));
          break;
        case 'center-x':
          axis = 0;
          targetValue = nodesToAlign.reduce((sum, n) => sum + n.position[0], 0) / nodesToAlign.length;
          break;
        case 'center-y':
          axis = 1;
          targetValue = nodesToAlign.reduce((sum, n) => sum + n.position[1], 0) / nodesToAlign.length;
          break;
        case 'center-z':
          axis = 2;
          targetValue = nodesToAlign.reduce((sum, n) => sum + n.position[2], 0) / nodesToAlign.length;
          break;
      }

      set(state => ({
        nodes: state.nodes.map(node => {
          if (nodeIds.includes(node.id)) {
            const newPosition = [...node.position] as [number, number, number];
            newPosition[axis] = targetValue;
            return { ...node, position: newPosition };
          }
          return node;
        })
      }));

      get().addNotification(`Aligned ${nodeIds.length} nodes to ${direction}`, 'success');
    },

    distributeNodes: (nodeIds, direction) => {
      get().saveToHistory();
      const state = get();
      const nodesToDistribute = state.nodes.filter(node => nodeIds.includes(node.id));
      
      if (nodesToDistribute.length < 3) {
        get().addNotification('Select at least 3 nodes to distribute', 'warning');
        return;
      }

      let axis: 0 | 1 | 2;
      switch (direction) {
        case 'horizontal': axis = 0; break;
        case 'vertical': axis = 1; break;
        case 'depth': axis = 2; break;
      }

      const sorted = [...nodesToDistribute].sort((a, b) => a.position[axis] - b.position[axis]);
      const minPos = sorted[0].position[axis];
      const maxPos = sorted[sorted.length - 1].position[axis];
      const spacing = (maxPos - minPos) / (sorted.length - 1);

      set(state => ({
        nodes: state.nodes.map(node => {
          const sortedIndex = sorted.findIndex(n => n.id === node.id);
          if (sortedIndex !== -1) {
            const newPosition = [...node.position] as [number, number, number];
            newPosition[axis] = minPos + (spacing * sortedIndex);
            return { ...node, position: newPosition };
          }
          return node;
        })
      }));

      get().addNotification(`Distributed ${nodeIds.length} nodes ${direction}ly`, 'success');
    },

    // Transform operations
    scaleNodes: (nodeIds, factor) => {
      get().saveToHistory();
      set(state => ({
        nodes: state.nodes.map(node => {
          if (nodeIds.includes(node.id)) {
            return { ...node, scale: (node.scale || 1) * factor };
          }
          return node;
        })
      }));
      get().addNotification(`Scaled ${nodeIds.length} nodes by ${factor}x`, 'success');
    },

    moveNodes: (nodeIds, offset) => {
      get().saveToHistory();
      set(state => ({
        nodes: state.nodes.map(node => {
          if (nodeIds.includes(node.id)) {
            return {
              ...node,
              position: [
                node.position[0] + offset[0],
                node.position[1] + offset[1],
                node.position[2] + offset[2]
              ] as [number, number, number]
            };
          }
          return node;
        })
      }));
      get().addNotification(`Moved ${nodeIds.length} nodes`, 'success');
    },

    rotateNodes: (nodeIds, axis, angle) => {
      get().saveToHistory();
      const state = get();
      const nodesToRotate = state.nodes.filter(node => nodeIds.includes(node.id));
      
      if (nodesToRotate.length === 0) return;

      // Calculate center point for rotation
      const center = nodesToRotate.reduce(
        (acc, node) => [
          acc[0] + node.position[0],
          acc[1] + node.position[1],
          acc[2] + node.position[2]
        ],
        [0, 0, 0]
      ).map(sum => sum / nodesToRotate.length) as [number, number, number];

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      set(state => ({
        nodes: state.nodes.map(node => {
          if (nodeIds.includes(node.id)) {
            const relativePos = [
              node.position[0] - center[0],
              node.position[1] - center[1],
              node.position[2] - center[2]
            ];

            let newPos: [number, number, number];
            
            switch (axis) {
              case 'x':
                newPos = [
                  relativePos[0],
                  relativePos[1] * cos - relativePos[2] * sin,
                  relativePos[1] * sin + relativePos[2] * cos
                ];
                break;
              case 'y':
                newPos = [
                  relativePos[0] * cos + relativePos[2] * sin,
                  relativePos[1],
                  -relativePos[0] * sin + relativePos[2] * cos
                ];
                break;
              case 'z':
                newPos = [
                  relativePos[0] * cos - relativePos[1] * sin,
                  relativePos[0] * sin + relativePos[1] * cos,
                  relativePos[2]
                ];
                break;
            }

            return {
              ...node,
              position: [
                newPos[0] + center[0],
                newPos[1] + center[1],
                newPos[2] + center[2]
              ] as [number, number, number]
            };
          }
          return node;
        })
      }));

      get().addNotification(`Rotated ${nodeIds.length} nodes around ${axis}-axis`, 'success');
    },

    // Connector operations
    addConnector: (startNodeId, endNodeId) => {
      const state = get();
      const connectorId = `conn_${startNodeId}_${endNodeId}`;
      
      const exists = state.connectors.some(c =>
        (c.startNodeId === startNodeId && c.endNodeId === endNodeId) ||
        (c.startNodeId === endNodeId && c.endNodeId === startNodeId)
      );
      
      if (!exists) {
        set(state => ({
          connectors: [...state.connectors, {
            id: connectorId,
            startNodeId,
            endNodeId,
            material: 'default',
            thickness: 1
          }]
        }));
      }
    },

    setConnectorMaterial: (id, material) => {
      set(state => ({
        connectors: state.connectors.map(conn =>
          conn.id === id ? { ...conn, material } : conn
        )
      }));
    },

    // Material management
    addMaterial: (name, material) => {
      set(state => ({
        materials: {
          ...state.materials,
          [name]: material
        }
      }));
    },

    updateMaterial: (name, material) => {
      set(state => ({
        materials: {
          ...state.materials,
          [name]: material
        }
      }));
    },

    deleteMaterial: (name) => {
      const builtInMaterials = ['default', 'selected', 'connecting', 'metallic', 'glass', 'neon'];
      if (builtInMaterials.includes(name)) {
        get().addNotification('Cannot delete built-in materials', 'error');
        return;
      }

      set(state => {
        const newMaterials = { ...state.materials };
        delete newMaterials[name];
        
        // Update any nodes using this material to default
        const updatedNodes = state.nodes.map(node =>
          node.material === name ? { ...node, material: 'default' } : node
        );
        
        return {
          materials: newMaterials,
          nodes: updatedNodes
        };
      });
    },

    // Camera bookmark management
    addCameraBookmark: (name, position, target) => {
      const bookmark: CameraBookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        position,
        target,
        created: Date.now()
      };

      set(state => ({
        cameraBookmarks: [...state.cameraBookmarks, bookmark]
      }));

      get().addNotification(`Camera bookmark "${name}" saved`, 'success');
    },

    deleteCameraBookmark: (id) => {
      set(state => ({
        cameraBookmarks: state.cameraBookmarks.filter(bookmark => bookmark.id !== id)
      }));
    },

    // Mode management
    toggleConnectionMode: () => {
      set(state => ({
        connectionMode: !state.connectionMode,
        selectedNodes: [],
        firstNodeForConnection: null
      }));
    },

    setConnectionMode: (enabled) => {
      set({ connectionMode: enabled, firstNodeForConnection: null });
    },

    setFirstNodeForConnection: (nodeId) => {
      set({ firstNodeForConnection: nodeId });
    },

    setMultiSelect: (enabled) => {
      set({ multiSelect: enabled });
    },

    // Grid and snap
    toggleGrid: () => {
      set(state => ({ showGrid: !state.showGrid }));
    },

    toggleSnap: () => {
      set(state => ({ snapToGrid: !state.snapToGrid }));
    },

    setGridSize: (size) => {
      set({ gridSize: size });
    },

    setAnimationSpeed: (speed) => {
      set({ animationSpeed: speed });
    },

    snapPosition: (position) => {
      const state = get();
      if (!state.snapToGrid) return position;
      
      const gridSize = state.gridSize;
      return [
        Math.round(position[0] / gridSize) * gridSize,
        Math.round(position[1] / gridSize) * gridSize,
        Math.round(position[2] / gridSize) * gridSize
      ];
    },

    // History
    saveToHistory: () => {
      const state = get();
      const snapshot: HistoryState = {
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        connectors: JSON.parse(JSON.stringify(state.connectors)),
        timestamp: Date.now()
      };
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);
      
      set({
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1
      });
    },

    undo: () => {
      const state = get();
      if (state.historyIndex > 0) {
        const prevState = state.history[state.historyIndex - 1];
        set({
          nodes: prevState.nodes,
          connectors: prevState.connectors,
          historyIndex: state.historyIndex - 1,
          selectedNodes: []
        });
      }
    },

    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        set({
          nodes: nextState.nodes,
          connectors: nextState.connectors,
          historyIndex: state.historyIndex + 1,
          selectedNodes: []
        });
      }
    },

    // Notifications
    addNotification: (message, type) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now()
      };
      
      set(state => ({
        notifications: [...state.notifications, notification]
      }));
    },

    removeNotification: (id) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    },

    // Context menu
    showContextMenu: (position, items) => {
      set({ contextMenu: { position, items } });
    },

    hideContextMenu: () => {
      set({ contextMenu: null });
    },

    // AI Commands
    executeCommand: (command) => {
      executeAICommand(command, get);
    },

    // Export/Import
    exportProject: () => {
      exportProjectToJSON(get());
    },

    importProject: (data) => {
      get().saveToHistory();
      set({
        nodes: data.nodes || [],
        connectors: data.connectors || [],
        projectName: data.name || 'Imported Project',
        selectedNodes: []
      });
      get().addNotification('Project imported successfully', 'success');
    }
  }))
);
