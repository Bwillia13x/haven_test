import { executeCommand } from './commandParser';

describe('executeCommand', () => {
  let mockStore: any;

  beforeEach(() => {
    mockStore = {
      addNode: jest.fn().mockReturnValue('node_123'),
      addConnector: jest.fn(),
      addNotification: jest.fn(),
      nodes: [],
      connectors: [],
      saveToHistory: jest.fn(),
      selectNodes: jest.fn(),
      deleteNodes: jest.fn(),
      selectedNodes: [],
      set: jest.fn()
    };
  });

  describe('Grid Commands', () => {
    it('should create a cube when given a cube command', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create cube size 2', mockGet);

      expect(mockStore.saveToHistory).toHaveBeenCalled();
      expect(mockStore.addNode).toHaveBeenCalled();
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Created 2×2×2 cube',
        'success'
      );
    });

    it('should handle unknown commands', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create grid width invalid height 3 depth 1', mockGet);

      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Unknown command',
        'error'
      );
    });
  });

  describe('Node Commands', () => {
    it('should create a single node at specified coordinates', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create node at 1, 2, 3', mockGet);

      expect(mockStore.addNode).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Node created at (1, 2, 3)',
        'success'
      );
    });

    it('should handle invalid coordinates', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create node at invalid, coords', mockGet);

      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Invalid coordinates',
        'error'
      );
    });
  });

  describe('Cube Commands', () => {
    it('should create a cube with specified size', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create cube size 2', mockGet);

      expect(mockStore.addNode).toHaveBeenCalledTimes(8); // 2x2x2 = 8 nodes
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Created 2×2×2 cube',
        'success'
      );
    });

    it('should create a cube with custom spacing', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create cube size 2 spacing 3', mockGet);

      expect(mockStore.addNode).toHaveBeenCalledTimes(8);
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Created 2×2×2 cube',
        'success'
      );
    });
  });

  describe('Sphere Commands', () => {
    it('should create a sphere with specified parameters', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create sphere radius 5 segments 10', mockGet);

      expect(mockStore.addNode).toHaveBeenCalledTimes(10);
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Created sphere with 10 nodes',
        'success'
      );
    });
  });

  describe('Spiral Commands', () => {
    it('should create a spiral with specified parameters', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('create spiral turns 2 radius 3 height 4 segments 20', mockGet);

      expect(mockStore.addNode).toHaveBeenCalledTimes(20);
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Created spiral with 20 nodes',
        'success'
      );
    });
  });

  describe('Connection Commands', () => {
    it('should connect all nodes within distance', () => {
      mockStore.nodes = [
        { id: 'node1', position: [0, 0, 0] },
        { id: 'node2', position: [1, 0, 0] },
        { id: 'node3', position: [10, 0, 0] }
      ];

      const mockGet = jest.fn(() => mockStore);
      executeCommand('connect all distance 2', mockGet);

      expect(mockStore.addConnector).toHaveBeenCalled();
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.stringContaining('Created'),
        'success'
      );
    });
  });

  describe('Selection Commands', () => {
    it('should select all nodes', () => {
      mockStore.nodes = [
        { id: 'node1' },
        { id: 'node2' },
        { id: 'node3' }
      ];

      const mockGet = jest.fn(() => mockStore);
      executeCommand('select all', mockGet);

      expect(mockStore.selectNodes).toHaveBeenCalledWith(['node1', 'node2', 'node3']);
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Selected 3 nodes',
        'success'
      );
    });

    it('should delete selected nodes', () => {
      mockStore.selectedNodes = ['node1', 'node2'];

      const mockGet = jest.fn(() => mockStore);
      executeCommand('delete selected', mockGet);

      expect(mockStore.deleteNodes).toHaveBeenCalledWith(['node1', 'node2']);
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Deleted 2 nodes',
        'success'
      );
    });

    it('should warn when no nodes are selected for deletion', () => {
      mockStore.selectedNodes = [];

      const mockGet = jest.fn(() => mockStore);
      executeCommand('delete selected', mockGet);

      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'No nodes selected',
        'warning'
      );
    });
  });

  describe('Clear Command', () => {
    it('should clear the scene', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('clear', mockGet);

      expect(mockStore.set).toHaveBeenCalledWith({
        nodes: [],
        connectors: [],
        selectedNodes: []
      });
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Scene cleared',
        'success'
      );
    });
  });

  describe('Unknown Commands', () => {
    it('should notify on unknown command', () => {
      const mockGet = jest.fn(() => mockStore);
      executeCommand('foobar', mockGet);

      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Unknown command',
        'error'
      );
    });

    it('should handle command execution errors', () => {
      mockStore.saveToHistory = jest.fn(() => {
        throw new Error('Test error');
      });

      const mockGet = jest.fn(() => mockStore);
      executeCommand('clear', mockGet);

      expect(mockStore.addNotification).toHaveBeenCalledWith(
        'Command execution failed',
        'error'
      );
    });
  });
});