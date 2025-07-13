import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Search,
  Plus,
  Minus,
  Folder,
  FolderOpen,
  Box,
  Circle,
  Triangle,
  Square,
  Cylinder
} from 'lucide-react';
import { useAetherStore } from '@/stores/useAetherStore';
import { cn } from '@/lib/utils';

interface HierarchyNode {
  id: string;
  name: string;
  type: 'group' | 'node';
  geometry?: string;
  children: HierarchyNode[];
  parent?: string;
  visible: boolean;
  locked: boolean;
  expanded: boolean;
}

interface OutlinerPanelProps {
  className?: string;
}

export function OutlinerPanel({ className }: OutlinerPanelProps) {
  const { 
    nodes, 
    selectedNodes, 
    selectNode, 
    selectMultipleNodes,
    clearSelection,
    addNotification 
  } = useAetherStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [nodeVisibility, setNodeVisibility] = useState<Record<string, boolean>>({});
  const [nodeLocked, setNodeLocked] = useState<Record<string, boolean>>({});
  const [groups, setGroups] = useState<Record<string, HierarchyNode>>({});

  // Build hierarchy tree from nodes and groups
  const hierarchyTree = useMemo(() => {
    const tree: HierarchyNode[] = [];
    const nodeMap = new Map<string, HierarchyNode>();

    // Create hierarchy nodes for actual nodes
    nodes.forEach(node => {
      const hierarchyNode: HierarchyNode = {
        id: node.id,
        name: node.id,
        type: 'node',
        geometry: node.geometry,
        children: [],
        visible: nodeVisibility[node.id] !== false,
        locked: nodeLocked[node.id] || false,
        expanded: true
      };
      nodeMap.set(node.id, hierarchyNode);
    });

    // Add groups
    Object.values(groups).forEach(group => {
      nodeMap.set(group.id, { ...group });
    });

    // Build tree structure
    nodeMap.forEach(node => {
      if (node.parent && nodeMap.has(node.parent)) {
        const parent = nodeMap.get(node.parent)!;
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    });

    // Filter by search query
    if (searchQuery) {
      const filterTree = (nodes: HierarchyNode[]): HierarchyNode[] => {
        return nodes.filter(node => {
          const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               node.geometry?.toLowerCase().includes(searchQuery.toLowerCase());
          const hasMatchingChildren = node.children.length > 0 && filterTree(node.children).length > 0;
          
          if (matchesSearch || hasMatchingChildren) {
            return true;
          }
          return false;
        }).map(node => ({
          ...node,
          children: filterTree(node.children)
        }));
      };
      return filterTree(tree);
    }

    return tree;
  }, [nodes, groups, nodeVisibility, nodeLocked, searchQuery]);

  // Get icon for node type
  const getNodeIcon = (node: HierarchyNode) => {
    if (node.type === 'group') {
      return node.expanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />;
    }

    switch (node.geometry) {
      case 'sphere': return <Circle className="w-4 h-4" />;
      case 'cube': return <Box className="w-4 h-4" />;
      case 'cylinder': return <Cylinder className="w-4 h-4" />;
      case 'cone': return <Triangle className="w-4 h-4" />;
      case 'plane': return <Square className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  // Toggle node expansion
  const toggleExpanded = useCallback((nodeId: string) => {
    if (groups[nodeId]) {
      setGroups(prev => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          expanded: !prev[nodeId].expanded
        }
      }));
    } else {
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    }
  }, [groups]);

  // Toggle node visibility
  const toggleVisibility = useCallback((nodeId: string) => {
    setNodeVisibility(prev => ({
      ...prev,
      [nodeId]: prev[nodeId] !== false ? false : true
    }));
    addNotification(`Node ${nodeId} ${nodeVisibility[nodeId] !== false ? 'hidden' : 'shown'}`, 'info');
  }, [nodeVisibility, addNotification]);

  // Toggle node lock
  const toggleLock = useCallback((nodeId: string) => {
    setNodeLocked(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
    addNotification(`Node ${nodeId} ${nodeLocked[nodeId] ? 'unlocked' : 'locked'}`, 'info');
  }, [nodeLocked, addNotification]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (selectedNodes.includes(nodeId)) {
        const newSelection = selectedNodes.filter(id => id !== nodeId);
        selectMultipleNodes(newSelection);
      } else {
        selectMultipleNodes([...selectedNodes, nodeId]);
      }
    } else if (event.shiftKey && selectedNodes.length > 0) {
      // Range select
      const lastSelected = selectedNodes[selectedNodes.length - 1];
      const allNodeIds = nodes.map(n => n.id);
      const startIndex = allNodeIds.indexOf(lastSelected);
      const endIndex = allNodeIds.indexOf(nodeId);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const rangeStart = Math.min(startIndex, endIndex);
        const rangeEnd = Math.max(startIndex, endIndex);
        const rangeSelection = allNodeIds.slice(rangeStart, rangeEnd + 1);
        selectMultipleNodes([...new Set([...selectedNodes, ...rangeSelection])]);
      }
    } else {
      // Single select
      selectNode(nodeId, false);
    }
  }, [selectedNodes, selectNode, selectMultipleNodes, nodes]);

  // Create new group
  const createGroup = useCallback(() => {
    const groupName = prompt('Group name:');
    if (groupName) {
      const groupId = `group-${Date.now()}`;
      const newGroup: HierarchyNode = {
        id: groupId,
        name: groupName,
        type: 'group',
        children: [],
        visible: true,
        locked: false,
        expanded: true
      };
      
      setGroups(prev => ({
        ...prev,
        [groupId]: newGroup
      }));
      
      addNotification(`Group "${groupName}" created`, 'success');
    }
  }, [addNotification]);

  // Add selected nodes to group
  const addToGroup = useCallback((groupId: string) => {
    if (selectedNodes.length === 0) {
      addNotification('No nodes selected', 'warning');
      return;
    }

    setGroups(prev => {
      const updatedGroups = { ...prev };
      
      // Remove nodes from their current parents
      Object.keys(updatedGroups).forEach(gId => {
        updatedGroups[gId] = {
          ...updatedGroups[gId],
          children: updatedGroups[gId].children.filter(child => !selectedNodes.includes(child.id))
        };
      });
      
      // Add nodes to target group
      if (updatedGroups[groupId]) {
        const nodesToAdd = selectedNodes.map(nodeId => {
          const node = nodes.find(n => n.id === nodeId);
          return {
            id: nodeId,
            name: nodeId,
            type: 'node' as const,
            geometry: node?.geometry,
            children: [],
            parent: groupId,
            visible: nodeVisibility[nodeId] !== false,
            locked: nodeLocked[nodeId] || false,
            expanded: true
          };
        });
        
        updatedGroups[groupId] = {
          ...updatedGroups[groupId],
          children: [...updatedGroups[groupId].children, ...nodesToAdd]
        };
      }
      
      return updatedGroups;
    });
    
    addNotification(`${selectedNodes.length} nodes added to group`, 'success');
  }, [selectedNodes, nodes, nodeVisibility, nodeLocked, addNotification]);

  // Render hierarchy node
  const renderNode = (node: HierarchyNode, depth: number = 0) => {
    const isSelected = selectedNodes.includes(node.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = node.type === 'group' ? node.expanded : expandedGroups.has(node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-sm hover:bg-surface-variant/30 cursor-pointer transition-smooth",
            isSelected && "bg-primary/20 text-primary",
            node.locked && "opacity-60"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={(e) => node.type === 'node' && handleNodeSelect(node.id, e)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </Button>
          )}
          
          {/* Icon */}
          <div className="w-4 h-4 flex items-center justify-center text-on-surface-variant">
            {getNodeIcon(node)}
          </div>
          
          {/* Name */}
          <span className="flex-1 truncate">{node.name}</span>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(node.id);
              }}
            >
              {node.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(node.id);
              }}
            >
              {node.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("glass-panel h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/20">
        <h3 className="text-sm font-medium">Outliner</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={createGroup} className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border/20">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-on-surface-variant" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-auto">
        {hierarchyTree.length === 0 ? (
          <div className="p-4 text-center text-sm text-on-surface-variant">
            {searchQuery ? 'No matching nodes found' : 'No nodes in scene'}
          </div>
        ) : (
          <div className="py-2">
            {hierarchyTree.map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/20 text-xs text-on-surface-variant">
        {nodes.length} nodes • {selectedNodes.length} selected
      </div>
    </Card>
  );
}
