import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { 
  Link2, 
  ChevronDown, 
  ChevronUp,
  Minus,
  MoreHorizontal,
  Zap
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";
import { ConnectorType, ConnectorStyle } from "../../types/aether";

export function ConnectorPropertiesPanel() {
  const { 
    selectedNodes, 
    connectors, 
    setConnectorType, 
    setConnectorProperties,
    addNotification 
  } = useAetherStore();
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Find connectors connected to selected nodes
  const relevantConnectors = connectors.filter(connector => 
    selectedNodes.includes(connector.startNodeId) || selectedNodes.includes(connector.endNodeId)
  );

  // Get the first connector for property editing
  const selectedConnector = relevantConnectors.length > 0 ? relevantConnectors[0] : null;

  if (!selectedConnector || selectedNodes.length === 0) {
    return null;
  }

  // Ensure connector has properties (migration)
  const properties = selectedConnector.properties || {
    thickness: selectedConnector.thickness || 1,
    style: 'solid',
    segments: 16
  };

  const connectorType = selectedConnector.type || 'straight';

  const handleTypeChange = (newType: ConnectorType) => {
    relevantConnectors.forEach(connector => {
      setConnectorType(connector.id, newType);
    });
  };

  const handlePropertyChange = (property: string, value: any) => {
    relevantConnectors.forEach(connector => {
      setConnectorProperties(connector.id, { [property]: value });
    });
  };

  const connectorTypeIcons = {
    straight: Minus,
    bezier: () => <span className="text-sm">~</span>,
    spline: () => <span className="text-sm">∿</span>,
    arc: () => <span className="text-sm">⌒</span>,
    spring: Zap
  };

  if (!isExpanded) {
    return (
      <Card className="absolute top-4 right-4 w-12 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full h-8"
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-4 right-4 w-80 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50 max-h-96 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Connector Properties
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
        <div className="text-xs text-gray-400">
          {relevantConnectors.length} connector{relevantConnectors.length !== 1 ? 's' : ''} selected
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 overflow-y-auto max-h-80">
        {/* Connector Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Type</Label>
          <Select value={connectorType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  Straight
                </div>
              </SelectItem>
              <SelectItem value="bezier">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-sm">~</span>
                  Bezier Curve
                </div>
              </SelectItem>
              <SelectItem value="spline">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-sm">∿</span>
                  Spline
                </div>
              </SelectItem>
              <SelectItem value="arc">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-sm">⌒</span>
                  Arc
                </div>
              </SelectItem>
              <SelectItem value="spring">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Spring
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Style Properties */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Style</Label>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Line Style</Label>
            <Select 
              value={properties.style || 'solid'} 
              onValueChange={(value: ConnectorStyle) => handlePropertyChange('style', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4" />
                    Solid
                  </div>
                </SelectItem>
                <SelectItem value="dashed">
                  <div className="flex items-center gap-2">
                    <MoreHorizontal className="w-4 h-4" />
                    Dashed
                  </div>
                </SelectItem>
                <SelectItem value="dotted">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center text-sm">⋯</span>
                    Dotted
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Thickness: {(properties.thickness || 1).toFixed(1)}</Label>
            <Slider
              value={[properties.thickness || 1]}
              onValueChange={(value) => handlePropertyChange('thickness', value[0])}
              min={0.1}
              max={5}
              step={0.1}
              className="mt-1"
            />
          </div>

          {(properties.style === 'dashed' || properties.style === 'dotted') && (
            <>
              <div>
                <Label className="text-xs text-gray-400">Dash Size: {(properties.dashSize || 0.1).toFixed(2)}</Label>
                <Slider
                  value={[properties.dashSize || 0.1]}
                  onValueChange={(value) => handlePropertyChange('dashSize', value[0])}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-400">Gap Size: {(properties.gapSize || 0.05).toFixed(2)}</Label>
                <Slider
                  value={[properties.gapSize || 0.05]}
                  onValueChange={(value) => handlePropertyChange('gapSize', value[0])}
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  className="mt-1"
                />
              </div>
            </>
          )}

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
        </div>

        <Separator />

        {/* Geometry Properties */}
        {(connectorType !== 'straight') && (
          <div className="space-y-3">
            <Label className="text-sm text-gray-300">Geometry</Label>
            
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

            {connectorType === 'bezier' && (
              <div>
                <Label className="text-xs text-gray-400">Tension: {(properties.tension || 0.5).toFixed(2)}</Label>
                <Slider
                  value={[properties.tension || 0.5]}
                  onValueChange={(value) => handlePropertyChange('tension', value[0])}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Smart Features */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Smart Features</Label>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Auto Routing</Label>
            <Switch
              checked={properties.autoRoute !== false}
              onCheckedChange={(checked) => handlePropertyChange('autoRoute', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Collision Avoidance</Label>
            <Switch
              checked={properties.collisionAvoidance !== false}
              onCheckedChange={(checked) => handlePropertyChange('collisionAvoidance', checked)}
            />
          </div>

          {properties.autoRoute !== false && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Routing Style</Label>
              <Select
                value={properties.routingStyle || 'smooth'}
                onValueChange={(value) => handlePropertyChange('routingStyle', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="manhattan">Manhattan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {properties.collisionAvoidance !== false && (
            <div>
              <Label className="text-xs text-gray-400">Avoidance Radius: {(properties.avoidanceRadius || 0.5).toFixed(1)}</Label>
              <Slider
                value={[properties.avoidanceRadius || 0.5]}
                onValueChange={(value) => handlePropertyChange('avoidanceRadius', value[0])}
                min={0.1}
                max={2}
                step={0.1}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Physics (for spring connectors) */}
        {connectorType === 'spring' && (
          <div className="space-y-3">
            <Label className="text-sm text-gray-300">Physics</Label>

            <div>
              <Label className="text-xs text-gray-400">Stiffness: {(properties.stiffness || 1).toFixed(1)}</Label>
              <Slider
                value={[properties.stiffness || 1]}
                onValueChange={(value) => handlePropertyChange('stiffness', value[0])}
                min={0.1}
                max={10}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400">Damping: {(properties.damping || 0.1).toFixed(2)}</Label>
              <Slider
                value={[properties.damping || 0.1]}
                onValueChange={(value) => handlePropertyChange('damping', value[0])}
                min={0.01}
                max={1}
                step={0.01}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400">Rest Length: {(properties.restLength || 1).toFixed(1)}</Label>
              <Slider
                value={[properties.restLength || 1]}
                onValueChange={(value) => handlePropertyChange('restLength', value[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Animation */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Animation</Label>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Animated</Label>
            <Switch
              checked={properties.animated || false}
              onCheckedChange={(checked) => handlePropertyChange('animated', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
