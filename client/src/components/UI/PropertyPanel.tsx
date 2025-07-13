import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAetherStore } from "../../stores/useAetherStore";

export function PropertyPanel() {
  const {
    selectedNodes,
    nodes,
    setNodePosition,
    setNodeMaterial,
    setNodeScale,
    materials
  } = useAetherStore();

  if (selectedNodes.length === 0) {
    return (
      <Card className="absolute top-4 right-4 w-80 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <CardHeader>
          <CardTitle className="text-white text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">No nodes selected</p>
        </CardContent>
      </Card>
    );
  }

  const selectedNode = nodes.find(n => n.id === selectedNodes[0]);
  if (!selectedNode) return null;

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newPosition = [...selectedNode.position] as [number, number, number];
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    newPosition[axisIndex] = numValue;
    
    setNodePosition(selectedNode.id, newPosition);
  };

  const handleScaleChange = (value: number[]) => {
    setNodeScale(selectedNode.id, value[0]);
  };

  const handleMaterialChange = (material: string) => {
    setNodeMaterial(selectedNode.id, material);
  };

  return (
    <Card className="absolute top-4 right-4 w-80 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
      <CardHeader>
        <CardTitle className="text-white text-sm">
          Properties {selectedNodes.length > 1 && `(${selectedNodes.length} selected)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position */}
        <div className="space-y-2">
          <Label className="text-white text-xs">Position</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-gray-400 text-xs">X</Label>
              <Input
                type="number"
                value={selectedNode.position[0].toFixed(2)}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white text-xs"
                step="0.1"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Y</Label>
              <Input
                type="number"
                value={selectedNode.position[1].toFixed(2)}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white text-xs"
                step="0.1"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Z</Label>
              <Input
                type="number"
                value={selectedNode.position[2].toFixed(2)}
                onChange={(e) => handlePositionChange('z', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white text-xs"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <Label className="text-white text-xs">Scale</Label>
          <div className="px-2">
            <Slider
              value={[selectedNode.scale || 1]}
              onValueChange={handleScaleChange}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.1</span>
              <span>{(selectedNode.scale || 1).toFixed(1)}</span>
              <span>3.0</span>
            </div>
          </div>
        </div>

        {/* Material */}
        <div className="space-y-2">
          <Label className="text-white text-xs">Material</Label>
          <Select value={selectedNode.material} onValueChange={handleMaterialChange}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {Object.keys(materials).map((materialKey) => (
                <SelectItem key={materialKey} value={materialKey} className="text-white">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: materials[materialKey].color }}
                    />
                    {materialKey.charAt(0).toUpperCase() + materialKey.slice(1)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Node Info */}
        <div className="space-y-2 pt-2 border-t border-gray-600">
          <Label className="text-white text-xs">Node Info</Label>
          <div className="text-xs text-gray-400 space-y-1">
            <div>ID: {selectedNode.id.split('_')[1]}</div>
            <div>Created: {new Date(selectedNode.created || 0).toLocaleTimeString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
