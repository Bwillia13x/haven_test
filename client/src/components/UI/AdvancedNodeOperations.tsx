import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { X, Grid, RotateCw, Move, Scale } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function AdvancedNodeOperations() {
  const [isVisible, setIsVisible] = useState(false);
  const { selectedNodes, addNotification, addNode } = useAetherStore();
  const [gridSize, setGridSize] = useState(3);
  const [spacing, setSpacing] = useState(2);

  if (!isVisible) return null;

  const handleCreateGrid = () => {
    const size = Math.max(1, Math.min(10, gridSize));
    const space = Math.max(0.5, Math.min(10, spacing));
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const position: [number, number, number] = [
          (x - (size - 1) / 2) * space,
          0,
          (z - (size - 1) / 2) * space
        ];
        addNode(position);
      }
    }
    
    addNotification(`Created ${size}x${size} grid of nodes`, 'success');
    setIsVisible(false);
  };

  const handleCreateCircle = () => {
    const count = Math.max(3, Math.min(20, gridSize));
    const radius = Math.max(1, Math.min(10, spacing));
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const position: [number, number, number] = [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
      addNode(position);
    }
    
    addNotification(`Created circle with ${count} nodes`, 'success');
    setIsVisible(false);
  };

  const handleCreateSpiral = () => {
    const count = Math.max(5, Math.min(50, gridSize * 5));
    const radius = Math.max(1, Math.min(10, spacing));
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 4; // 2 full rotations
      const r = radius * t;
      const position: [number, number, number] = [
        Math.cos(angle) * r,
        t * 2 - 1, // Vertical component
        Math.sin(angle) * r
      ];
      addNode(position);
    }
    
    addNotification(`Created spiral with ${count} nodes`, 'success');
    setIsVisible(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={() => setIsVisible(false)}
      />
      
      {/* Advanced Operations Panel */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-gray-800/95 backdrop-blur-sm border-gray-600 z-50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">Advanced Operations</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Grid Parameters */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-white text-sm">Grid Size / Count</Label>
              <Input
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value) || 3)}
                min="1"
                max="10"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white text-sm">Spacing / Radius</Label>
              <Input
                type="number"
                value={spacing}
                onChange={(e) => setSpacing(parseFloat(e.target.value) || 2)}
                min="0.5"
                max="10"
                step="0.5"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Generation Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleCreateGrid}
              className="w-full justify-start"
              variant="outline"
            >
              <Grid className="w-4 h-4 mr-2" />
              Create {gridSize}×{gridSize} Grid
            </Button>
            
            <Button 
              onClick={handleCreateCircle}
              className="w-full justify-start"
              variant="outline"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Create Circle ({gridSize} nodes)
            </Button>
            
            <Button 
              onClick={handleCreateSpiral}
              className="w-full justify-start"
              variant="outline"
            >
              <Move className="w-4 h-4 mr-2" />
              Create Spiral ({gridSize * 5} nodes)
            </Button>
          </div>

          {/* Selection Info */}
          {selectedNodes.length > 0 && (
            <div className="pt-3 border-t border-gray-600">
              <div className="text-sm text-gray-400">
                {selectedNodes.length} node(s) selected
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
