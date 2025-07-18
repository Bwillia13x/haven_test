import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import {
  MousePointer,
  Plus,
  Link,
  Grid3X3,
  Download,
  Upload,
  Undo,
  Redo,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Layers,
  Move,
  ChevronDown,
  Circle
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";
import { NodeGeometry } from "../../types/aether";

export function Toolbar() {
  const {
    connectionMode,
    toggleConnectionMode,
    movementMode,
    toggleMovementMode,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnap,
    selectedNodes,
    deleteNodes,
    duplicateNodes,
    selectAll,
    addNode,
    addAdvancedNode,
    undo,
    redo,
    history,
    historyIndex,
    exportProject,
    addNotification
  } = useAetherStore();

  const handleAddNode = (geometry: NodeGeometry = 'sphere') => {
    const id = addAdvancedNode(geometry, {
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ]
    });
    addNotification(`${geometry.charAt(0).toUpperCase() + geometry.slice(1)} node created`, 'success');
  };

  const handleDeleteSelected = () => {
    if (selectedNodes.length > 0) {
      deleteNodes(selectedNodes);
      addNotification(`Deleted ${selectedNodes.length} node(s)`, 'success');
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedNodes.length > 0) {
      duplicateNodes(selectedNodes);
    } else {
      addNotification('Select nodes to duplicate', 'warning');
    }
  };

  const handleSelectAll = () => {
    selectAll();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Import functionality would be implemented here
        addNotification('Import started', 'info');
      }
    };
    input.click();
  };

  return (
    <TooltipProvider>
      <Card className="absolute top-4 left-4 p-2 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <div className="flex items-center gap-2">
          {/* Selection Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={!connectionMode ? "default" : "outline"}
                size="sm"
                onClick={() => connectionMode && toggleConnectionMode()}
              >
                <MousePointer className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Selection Mode (ESC)</p>
            </TooltipContent>
          </Tooltip>

          {/* Add Node Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Node (N)</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleAddNode('sphere')} className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Sphere
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('cube')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Cube
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('cylinder')} className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Cylinder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('cone')} className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                Cone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('plane')} className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Plane
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode('torus')} className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Torus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Connection Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={connectionMode ? "default" : "outline"}
                size="sm"
                onClick={toggleConnectionMode}
                disabled={movementMode}
              >
                <Link className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Connection Mode (C)</p>
            </TooltipContent>
          </Tooltip>

          {/* Movement Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={movementMode ? "default" : "outline"}
                size="sm"
                onClick={toggleMovementMode}
              >
                <Move className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Movement Mode (M) - Free movement with Shift+Drag</p>
            </TooltipContent>
          </Tooltip>

          {/* Duplicate Selected */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicateSelected}
                disabled={selectedNodes.length === 0}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Duplicate Selected (Ctrl+D)</p>
            </TooltipContent>
          </Tooltip>

          {/* Select All */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                <Layers className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select All (Ctrl+A)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Grid Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={toggleGrid}
              >
                {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Grid (G)</p>
            </TooltipContent>
          </Tooltip>

          {/* Snap to Grid */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapToGrid ? "default" : "outline"}
                size="sm"
                onClick={toggleSnap}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Snap to Grid (Shift+G)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Delete Selected */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedNodes.length === 0}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Selected (Del)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Export */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={exportProject}>
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Project (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          {/* Import */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import Project (Ctrl+O)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
  );
}
