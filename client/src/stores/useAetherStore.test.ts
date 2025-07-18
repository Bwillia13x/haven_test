import { useAetherStore } from './useAetherStore';

describe('useAetherStore', () => {
  describe('Store Structure', () => {
    it('should have initial state properties', () => {
      const store = useAetherStore.getState();

      expect(store).toHaveProperty('nodes');
      expect(store).toHaveProperty('connectors');
      expect(store).toHaveProperty('selectedNodes');
      expect(store).toHaveProperty('notifications');
      expect(store).toHaveProperty('showGrid');
      expect(store).toHaveProperty('snapToGrid');
      expect(store).toHaveProperty('gridSize');
      expect(store).toHaveProperty('materials');
      expect(store).toHaveProperty('history');
    });

    it('should have required methods', () => {
      const store = useAetherStore.getState();

      expect(typeof store.addNode).toBe('function');
      expect(typeof store.addConnector).toBe('function');
      expect(typeof store.selectNode).toBe('function');
      expect(typeof store.deleteNodes).toBe('function');
      expect(typeof store.addNotification).toBe('function');
      expect(typeof store.toggleGrid).toBe('function');
      expect(typeof store.toggleSnap).toBe('function');
      expect(typeof store.setGridSize).toBe('function');
      expect(typeof store.undo).toBe('function');
      expect(typeof store.redo).toBe('function');
    });

    it('should have initial arrays as empty', () => {
      const store = useAetherStore.getState();

      expect(Array.isArray(store.nodes)).toBe(true);
      expect(Array.isArray(store.connectors)).toBe(true);
      expect(Array.isArray(store.selectedNodes)).toBe(true);
      expect(Array.isArray(store.notifications)).toBe(true);
      expect(Array.isArray(store.history)).toBe(true);
    });

    it('should have default grid settings', () => {
      const store = useAetherStore.getState();

      expect(typeof store.showGrid).toBe('boolean');
      expect(typeof store.snapToGrid).toBe('boolean');
      expect(typeof store.gridSize).toBe('number');
      expect(store.gridSize).toBeGreaterThan(0);
    });

    it('should have materials object', () => {
      const store = useAetherStore.getState();

      expect(typeof store.materials).toBe('object');
      expect(store.materials).not.toBeNull();
    });
  });

  describe('Basic Functionality', () => {
    it('should handle method calls without errors', () => {
      const store = useAetherStore.getState();

      // Test that methods can be called without throwing errors
      expect(() => {
        store.addNotification('Test', 'info');
        store.toggleGrid();
        store.toggleSnap();
        store.setGridSize(2);
        store.clearSelection();
      }).not.toThrow();
    });

    it('should handle command execution', () => {
      const store = useAetherStore.getState();

      expect(() => {
        store.executeCommand('clear');
      }).not.toThrow();
    });

    it('should handle undo/redo operations', () => {
      const store = useAetherStore.getState();

      expect(() => {
        store.undo();
        store.redo();
      }).not.toThrow();
    });
  });
});