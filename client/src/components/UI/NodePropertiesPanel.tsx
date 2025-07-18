import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Circle
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";
import { NodeGeometry } from "../../types/aether";

export function NodePropertiesPanel() {
  const { 
    selectedNodes, 
    nodes, 
    setNodeGeometry, 
    updateNodeProperty,
    addNotification 
  } = useAetherStore();
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the first selected node for property editing
  const selectedNode = selectedNodes.length === 1 
    ? nodes.find(n => n.id === selectedNodes[0]) 
    : null;

  if (!selectedNode) {
    return null;
  }

  // Ensure node has properties (migration)
  const properties = selectedNode.properties || {
    position: selectedNode.position,
    rotation: [0, 0, 0],
    scale: [selectedNode.scale || 1, selectedNode.scale || 1, selectedNode.scale || 1],
    radius: 0.15,
    height: 0.3,
    width: 0.3,
    depth: 0.3,
    segments: 16,
    rings: 8,
    visible: true,
    castShadow: true,
    receiveShadow: true,
    wireframe: false
  };

  const geometry = selectedNode.geometry || 'sphere';

  const handleGeometryChange = (newGeometry: NodeGeometry) => {
    setNodeGeometry(selectedNode.id, newGeometry);
  };

  const handlePropertyChange = (property: string, value: any) => {
    updateNodeProperty(selectedNode.id, property, value);
  };

  const geometryIcons = {
    sphere: Circle,
    cube: Settings,
    cylinder: Circle,
    cone: ChevronDown,
    plane: Grid3X3,
    torus: Circle
  };

  if (!isExpanded) {
    return (
      <Card className="absolute top-4 right-96 w-12 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full h-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-4 right-96 w-80 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50 max-h-96 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Node Properties
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 overflow-y-auto max-h-80">
        {/* Geometry Selection */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Geometry</Label>
          <Select value={geometry} onValueChange={handleGeometryChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sphere">
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  Sphere
                </div>
              </SelectItem>
              <SelectItem value="cube">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Cube
                </div>
              </SelectItem>
              <SelectItem value="cylinder">
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  Cylinder
                </div>
              </SelectItem>
              <SelectItem value="cone">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4" />
                  Cone
                </div>
              </SelectItem>
              <SelectItem value="plane">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Plane
                </div>
              </SelectItem>
              <SelectItem value="torus">
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  Torus
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Geometry-specific Parameters */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Parameters</Label>
          
          {/* Common parameters */}
          {(geometry === 'sphere' || geometry === 'cylinder' || geometry === 'cone' || geometry === 'torus') && (
            <div>
              <Label className="text-xs text-gray-400">Radius: {properties.radius?.toFixed(2) || 0.15}</Label>
              <Slider
                value={[properties.radius || 0.15]}
                onValueChange={(value) => handlePropertyChange('radius', value[0])}
                min={0.05}
                max={2}
                step={0.05}
                className="mt-1"
              />
            </div>
          )}

          {(geometry === 'cylinder' || geometry === 'cone' || geometry === 'cube') && (
            <div>
              <Label className="text-xs text-gray-400">Height: {properties.height?.toFixed(2) || 0.3}</Label>
              <Slider
                value={[properties.height || 0.3]}
                onValueChange={(value) => handlePropertyChange('height', value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="mt-1"
              />
            </div>
          )}

          {(geometry === 'cube' || geometry === 'plane') && (
            <>
              <div>
                <Label className="text-xs text-gray-400">Width: {properties.width?.toFixed(2) || 0.3}</Label>
                <Slider
                  value={[properties.width || 0.3]}
                  onValueChange={(value) => handlePropertyChange('width', value[0])}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              
              {geometry === 'cube' && (
                <div>
                  <Label className="text-xs text-gray-400">Depth: {properties.depth?.toFixed(2) || 0.3}</Label>
                  <Slider
                    value={[properties.depth || 0.3]}
                    onValueChange={(value) => handlePropertyChange('depth', value[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <Label className="text-xs text-gray-400">Segments: {properties.segments || 16}</Label>
            <Slider
              value={[properties.segments || 16]}
              onValueChange={(value) => handlePropertyChange('segments', Math.round(value[0]))}
              min={3}
              max={64}
              step={1}
              className="mt-1"
            />
          </div>

          {(geometry === 'sphere' || geometry === 'torus') && (
            <div>
              <Label className="text-xs text-gray-400">Rings: {properties.rings || 8}</Label>
              <Slider
                value={[properties.rings || 8]}
                onValueChange={(value) => handlePropertyChange('rings', Math.round(value[0]))}
                min={3}
                max={32}
                step={1}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Transform Properties */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Transform</Label>

          <div>
            <Label className="text-xs text-gray-400">Rotation X: {(properties.rotation?.[0] || 0).toFixed(2)}°</Label>
            <Slider
              value={[properties.rotation?.[0] || 0]}
              onValueChange={(value) => {
                const newRotation = [...(properties.rotation || [0, 0, 0])];
                newRotation[0] = value[0];
                handlePropertyChange('rotation', newRotation);
              }}
              min={-Math.PI}
              max={Math.PI}
              step={0.1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-400">Rotation Y: {(properties.rotation?.[1] || 0).toFixed(2)}°</Label>
            <Slider
              value={[properties.rotation?.[1] || 0]}
              onValueChange={(value) => {
                const newRotation = [...(properties.rotation || [0, 0, 0])];
                newRotation[1] = value[0];
                handlePropertyChange('rotation', newRotation);
              }}
              min={-Math.PI}
              max={Math.PI}
              step={0.1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-400">Rotation Z: {(properties.rotation?.[2] || 0).toFixed(2)}°</Label>
            <Slider
              value={[properties.rotation?.[2] || 0]}
              onValueChange={(value) => {
                const newRotation = [...(properties.rotation || [0, 0, 0])];
                newRotation[2] = value[0];
                handlePropertyChange('rotation', newRotation);
              }}
              min={-Math.PI}
              max={Math.PI}
              step={0.1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-400">Scale: {(properties.scale?.[0] || 1).toFixed(2)}</Label>
            <Slider
              value={[properties.scale?.[0] || 1]}
              onValueChange={(value) => {
                handlePropertyChange('scale', [value[0], value[0], value[0]]);
              }}
              min={0.1}
              max={3}
              step={0.1}
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* Visual Properties */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Visual</Label>

          <div>
            <Label className="text-xs text-gray-400">Opacity: {(properties.opacity || 1).toFixed(2)}</Label>
            <Slider
              value={[properties.opacity || 1]}
              onValueChange={(value) => handlePropertyChange('opacity', value[0])}
              min={0}
              max={1}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-400">Metalness: {(properties.metalness || 0).toFixed(2)}</Label>
            <Slider
              value={[properties.metalness || 0]}
              onValueChange={(value) => handlePropertyChange('metalness', value[0])}
              min={0}
              max={1}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-400">Roughness: {(properties.roughness || 0.5).toFixed(2)}</Label>
            <Slider
              value={[properties.roughness || 0.5]}
              onValueChange={(value) => handlePropertyChange('roughness', value[0])}
              min={0}
              max={1}
              step={0.05}
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Wireframe</Label>
            <Switch
              checked={properties.wireframe || false}
              onCheckedChange={(checked) => handlePropertyChange('wireframe', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Cast Shadow</Label>
            <Switch
              checked={properties.castShadow !== false}
              onCheckedChange={(checked) => handlePropertyChange('castShadow', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Receive Shadow</Label>
            <Switch
              checked={properties.receiveShadow !== false}
              onCheckedChange={(checked) => handlePropertyChange('receiveShadow', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Visible</Label>
            <Switch
              checked={properties.visible !== false}
              onCheckedChange={(checked) => handlePropertyChange('visible', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
