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
  
  // Project
  projectName: string;

  // Actions
  addNode: (position?: [number, number, number], material?: string, animated?: boolean) => string;
  setNodePosition: (id: string, position: [number, number, number]) => void;
  setNodeScale: (id: string, scale: number) => void;
  setNodeMaterial: (id: string, material: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  
  selectNode: (id: string, multiSelect?: boolean) => void;
  selectNodes: (nodeIds: string[]) => void;
  clearSelection: () => void;
  
  addConnector: (startNodeId: string, endNodeId: string) => void;
  setConnectorMaterial: (id: string, material: string) => void;
  
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

    clearSelection: () => {
      set({ selectedNodes: [] });
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
