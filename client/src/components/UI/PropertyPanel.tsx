import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { useAetherStore } from "../../stores/useAetherStore";

export function PropertyPanel() {
  const { 
    selectedNodes, 
    nodes, 
    gridSize, 
    setGridSize,
    animationSpeed,
    setAnimationSpeed 
  } = useAetherStore();

  const selectedNodeData = selectedNodes.length > 0 
    ? nodes.filter(n => selectedNodes.includes(n.id))
    : [];

  return (
    <Card className="absolute top-4 right-4 w-72 bg-gray-800/90 backdrop-blur-sm border-gray-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Properties
          {selectedNodes.length > 0 && (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {selectedNodes.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedNodes.length === 0 ? (
          <div className="text-gray-400 text-sm">
            Select nodes to view properties
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-300">Selected Nodes</Label>
              <div className="mt-1 space-y-1">
                {selectedNodeData.map((node, index) => (
                  <div key={node.id} className="text-xs text-gray-400">
                    Node {index + 1}: ({node.position.map(p => p.toFixed(2)).join(', ')})
                  </div>
                ))}
              </div>
            </div>

            {selectedNodes.length === 1 && (
              <div>
                <Label className="text-sm text-gray-300">Material</Label>
                <Select defaultValue={selectedNodeData[0]?.material || 'default'}>
                  <SelectTrigger className="mt-1 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="metallic">Metallic</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                    <SelectItem value="neon">Neon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-600 pt-4 space-y-4">
          <div>
            <Label className="text-sm text-gray-300">Grid Size</Label>
            <div className="mt-2">
              <Slider
                value={[gridSize]}
                onValueChange={(value) => setGridSize(value[0])}
                min={0.5}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                {gridSize} units
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm text-gray-300">Animation Speed</Label>
            <div className="mt-2">
              <Slider
                value={[animationSpeed]}
                onValueChange={(value) => setAnimationSpeed(value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                {animationSpeed}x speed
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-4">
          <Label className="text-sm text-gray-300">Scene Stats</Label>
          <div className="mt-2 space-y-1 text-xs text-gray-400">
            <div>Nodes: {nodes.length}</div>
            <div>Selected: {selectedNodes.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
