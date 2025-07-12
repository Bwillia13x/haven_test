import { act } from 'react-dom/test-utils';
import create from 'zustand';
import { useAetherStore } from './useAetherStore';

describe('useAetherStore', () => {
  it('should add a node and select it', () => {
    const store = useAetherStore.getState();
    const nodeId = store.addNode([1, 2, 3], 'default', false);
    expect(store.nodes.find(n => n.id === nodeId)).toBeDefined();
    store.selectNode(nodeId);
    expect(store.selectedNodes).toContain(nodeId);
  });

  it('should undo and redo node addition', () => {
    const store = useAetherStore.getState();
    const nodeId = store.addNode([4, 5, 6], 'default', false);
    expect(store.nodes.find(n => n.id === nodeId)).toBeDefined();
    store.undo();
    expect(store.nodes.find(n => n.id === nodeId)).toBeUndefined();
    store.redo();
    expect(store.nodes.find(n => n.id === nodeId)).toBeDefined();
  });
}); 