import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAetherStore } from '@/stores/useAetherStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MousePointer2, 
  Square, 
  Lasso, 
  Filter, 
  RotateCcw, 
  Plus, 
  Minus,
  Bookmark,
  History
} from 'lucide-react';

export type SelectionMode = 'pointer' | 'box' | 'lasso' | 'filter';

interface SelectionToolsProps {
  mode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
}

export function SelectionTools({ mode, onModeChange }: SelectionToolsProps) {
  const { 
    selectedNodes, 
    selectNode, 
    selectMultipleNodes, 
    clearSelection,
    nodes,
    addNotification 
  } = useAetherStore();

  const [selectionHistory, setSelectionHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectionBookmarks, setSelectionBookmarks] = useState<Record<string, string[]>>({});
  const [filterCriteria, setFilterCriteria] = useState({
    type: '',
    material: '',
    size: { min: 0, max: 100 },
    name: ''
  });

  // Save selection to history
  const saveSelectionToHistory = useCallback(() => {
    const newHistory = selectionHistory.slice(0, historyIndex + 1);
    newHistory.push([...selectedNodes]);
    setSelectionHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [selectedNodes, selectionHistory, historyIndex]);

  // Undo selection
  const undoSelection = useCallback(() => {
    if (historyIndex > 0) {
      const previousSelection = selectionHistory[historyIndex - 1];
      selectMultipleNodes(previousSelection);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, selectionHistory, selectMultipleNodes]);

  // Redo selection
  const redoSelection = useCallback(() => {
    if (historyIndex < selectionHistory.length - 1) {
      const nextSelection = selectionHistory[historyIndex + 1];
      selectMultipleNodes(nextSelection);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, selectionHistory, selectMultipleNodes]);

  // Invert selection
  const invertSelection = useCallback(() => {
    const allNodeIds = nodes.map(node => node.id);
    const invertedSelection = allNodeIds.filter(id => !selectedNodes.includes(id));
    saveSelectionToHistory();
    selectMultipleNodes(invertedSelection);
    addNotification(`Inverted selection: ${invertedSelection.length} nodes selected`, 'info');
  }, [nodes, selectedNodes, selectMultipleNodes, saveSelectionToHistory, addNotification]);

  // Grow selection (select connected nodes)
  const growSelection = useCallback(() => {
    // Implementation would depend on connector system
    // For now, select nearby nodes
    const growthRadius = 2;
    const newSelection = [...selectedNodes];
    
    selectedNodes.forEach(selectedId => {
      const selectedNode = nodes.find(n => n.id === selectedId);
      if (!selectedNode) return;
      
      const selectedPos = new THREE.Vector3(...selectedNode.properties.position);
      
      nodes.forEach(node => {
        if (!newSelection.includes(node.id)) {
          const nodePos = new THREE.Vector3(...node.properties.position);
          if (selectedPos.distanceTo(nodePos) <= growthRadius) {
            newSelection.push(node.id);
          }
        }
      });
    });
    
    if (newSelection.length > selectedNodes.length) {
      saveSelectionToHistory();
      selectMultipleNodes(newSelection);
      addNotification(`Grew selection: ${newSelection.length - selectedNodes.length} nodes added`, 'info');
    }
  }, [selectedNodes, nodes, selectMultipleNodes, saveSelectionToHistory, addNotification]);

  // Shrink selection
  const shrinkSelection = useCallback(() => {
    if (selectedNodes.length <= 1) return;
    
    // Remove nodes that are on the "edge" of the selection
    const shrunkSelection = selectedNodes.filter(selectedId => {
      const selectedNode = nodes.find(n => n.id === selectedId);
      if (!selectedNode) return false;
      
      const selectedPos = new THREE.Vector3(...selectedNode.properties.position);
      let neighborCount = 0;
      
      selectedNodes.forEach(otherId => {
        if (otherId === selectedId) return;
        const otherNode = nodes.find(n => n.id === otherId);
        if (!otherNode) return;
        
        const otherPos = new THREE.Vector3(...otherNode.properties.position);
        if (selectedPos.distanceTo(otherPos) <= 2) {
          neighborCount++;
        }
      });
      
      return neighborCount >= 2; // Keep nodes with at least 2 neighbors
    });
    
    if (shrunkSelection.length < selectedNodes.length) {
      saveSelectionToHistory();
      selectMultipleNodes(shrunkSelection);
      addNotification(`Shrunk selection: ${selectedNodes.length - shrunkSelection.length} nodes removed`, 'info');
    }
  }, [selectedNodes, nodes, selectMultipleNodes, saveSelectionToHistory, addNotification]);

  // Filter selection by criteria
  const filterSelection = useCallback(() => {
    let filteredNodes = nodes;
    
    // Filter by geometry type
    if (filterCriteria.type) {
      filteredNodes = filteredNodes.filter(node => node.geometry === filterCriteria.type);
    }
    
    // Filter by material
    if (filterCriteria.material) {
      filteredNodes = filteredNodes.filter(node => 
        node.material?.color === filterCriteria.material
      );
    }
    
    // Filter by size (scale)
    filteredNodes = filteredNodes.filter(node => {
      const scale = Math.max(...node.properties.scale);
      return scale >= filterCriteria.size.min && scale <= filterCriteria.size.max;
    });
    
    // Filter by name (if nodes have names)
    if (filterCriteria.name) {
      filteredNodes = filteredNodes.filter(node => 
        node.id.toLowerCase().includes(filterCriteria.name.toLowerCase())
      );
    }
    
    const filteredIds = filteredNodes.map(node => node.id);
    saveSelectionToHistory();
    selectMultipleNodes(filteredIds);
    addNotification(`Filtered selection: ${filteredIds.length} nodes selected`, 'info');
  }, [nodes, filterCriteria, selectMultipleNodes, saveSelectionToHistory, addNotification]);

  // Save selection as bookmark
  const saveSelectionBookmark = useCallback((name: string) => {
    setSelectionBookmarks(prev => ({
      ...prev,
      [name]: [...selectedNodes]
    }));
    addNotification(`Selection bookmark "${name}" saved`, 'success');
  }, [selectedNodes, addNotification]);

  // Load selection bookmark
  const loadSelectionBookmark = useCallback((name: string) => {
    const bookmark = selectionBookmarks[name];
    if (bookmark) {
      saveSelectionToHistory();
      selectMultipleNodes(bookmark);
      addNotification(`Selection bookmark "${name}" loaded`, 'info');
    }
  }, [selectionBookmarks, selectMultipleNodes, saveSelectionToHistory, addNotification]);

  // Select all nodes
  const selectAll = useCallback(() => {
    saveSelectionToHistory();
    selectMultipleNodes(nodes.map(node => node.id));
    addNotification(`Selected all ${nodes.length} nodes`, 'info');
  }, [nodes, selectMultipleNodes, saveSelectionToHistory, addNotification]);

  // Select none
  const selectNone = useCallback(() => {
    if (selectedNodes.length > 0) {
      saveSelectionToHistory();
      clearSelection();
      addNotification('Selection cleared', 'info');
    }
  }, [selectedNodes, clearSelection, saveSelectionToHistory, addNotification]);

  return (
    <Card className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Selection Tools</h3>
        <span className="text-xs text-on-surface-variant">
          {selectedNodes.length} selected
        </span>
      </div>

      {/* Selection Mode Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={mode === 'pointer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('pointer')}
          leftIcon={<MousePointer2 className="w-3 h-3" />}
        >
          Pointer
        </Button>
        <Button
          variant={mode === 'box' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('box')}
          leftIcon={<Square className="w-3 h-3" />}
        >
          Box
        </Button>
        <Button
          variant={mode === 'lasso' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('lasso')}
          leftIcon={<Lasso className="w-3 h-3" />}
        >
          Lasso
        </Button>
        <Button
          variant={mode === 'filter' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('filter')}
          leftIcon={<Filter className="w-3 h-3" />}
        >
          Filter
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={selectNone}>
            Select None
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={invertSelection}>
            Invert
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={growSelection}
            disabled={selectedNodes.length === 0}
          >
            <Plus className="w-3 h-3 mr-1" />
            Grow
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={shrinkSelection}
          disabled={selectedNodes.length <= 1}
          className="w-full"
        >
          <Minus className="w-3 h-3 mr-1" />
          Shrink
        </Button>
      </div>

      {/* Selection History */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <History className="w-3 h-3" />
          <span className="text-xs font-medium">History</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={undoSelection}
            disabled={historyIndex <= 0}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Undo
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={redoSelection}
            disabled={historyIndex >= selectionHistory.length - 1}
          >
            Redo
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      {mode === 'filter' && (
        <div className="space-y-3 border-t border-border/20 pt-3">
          <div className="space-y-2">
            <label className="text-xs font-medium">Geometry Type</label>
            <select 
              className="w-full px-2 py-1 text-xs bg-surface border border-border rounded"
              value={filterCriteria.type}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="sphere">Sphere</option>
              <option value="cube">Cube</option>
              <option value="cylinder">Cylinder</option>
              <option value="cone">Cone</option>
              <option value="plane">Plane</option>
              <option value="torus">Torus</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium">Size Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                className="px-2 py-1 text-xs bg-surface border border-border rounded"
                value={filterCriteria.size.min}
                onChange={(e) => setFilterCriteria(prev => ({
                  ...prev,
                  size: { ...prev.size, min: Number(e.target.value) }
                }))}
              />
              <input
                type="number"
                placeholder="Max"
                className="px-2 py-1 text-xs bg-surface border border-border rounded"
                value={filterCriteria.size.max}
                onChange={(e) => setFilterCriteria(prev => ({
                  ...prev,
                  size: { ...prev.size, max: Number(e.target.value) }
                }))}
              />
            </div>
          </div>
          
          <Button variant="default" size="sm" onClick={filterSelection} className="w-full">
            Apply Filter
          </Button>
        </div>
      )}

      {/* Selection Bookmarks */}
      <div className="space-y-2 border-t border-border/20 pt-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-3 h-3" />
          <span className="text-xs font-medium">Bookmarks</span>
        </div>
        
        <div className="space-y-1">
          {Object.keys(selectionBookmarks).map(name => (
            <div key={name} className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadSelectionBookmark(name)}
                className="flex-1 text-xs"
              >
                {name} ({selectionBookmarks[name].length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newBookmarks = { ...selectionBookmarks };
                  delete newBookmarks[name];
                  setSelectionBookmarks(newBookmarks);
                }}
                className="w-6 h-6 p-0"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const name = prompt('Bookmark name:');
            if (name && selectedNodes.length > 0) {
              saveSelectionBookmark(name);
            }
          }}
          disabled={selectedNodes.length === 0}
          className="w-full text-xs"
        >
          Save Bookmark
        </Button>
      </div>
    </Card>
  );
}
