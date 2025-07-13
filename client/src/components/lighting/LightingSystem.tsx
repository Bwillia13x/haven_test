import React, { useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Lightbulb, 
  Flashlight, 
  Square, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Settings,
  Palette
} from 'lucide-react';
import { useAetherStore } from '@/stores/useAetherStore';

export type LightType = 'directional' | 'point' | 'spot' | 'area' | 'hemisphere';

export interface Light {
  id: string;
  name: string;
  type: LightType;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  intensity: number;
  visible: boolean;
  castShadow: boolean;
  // Directional light specific
  target?: [number, number, number];
  // Point/Spot light specific
  distance?: number;
  decay?: number;
  // Spot light specific
  angle?: number;
  penumbra?: number;
  // Area light specific
  width?: number;
  height?: number;
  // Hemisphere light specific
  groundColor?: string;
}

const defaultLights: Light[] = [
  {
    id: 'main-directional',
    name: 'Main Light',
    type: 'directional',
    position: [5, 5, 5],
    rotation: [0, 0, 0],
    color: '#ffffff',
    intensity: 1,
    visible: true,
    castShadow: true,
    target: [0, 0, 0]
  },
  {
    id: 'fill-point',
    name: 'Fill Light',
    type: 'point',
    position: [-3, 2, 3],
    rotation: [0, 0, 0],
    color: '#4a90e2',
    intensity: 0.5,
    visible: true,
    castShadow: false,
    distance: 10,
    decay: 2
  },
  {
    id: 'ambient-hemisphere',
    name: 'Ambient',
    type: 'hemisphere',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    color: '#87ceeb',
    intensity: 0.3,
    visible: true,
    castShadow: false,
    groundColor: '#654321'
  }
];

const lightingPresets = {
  studio: {
    name: 'Studio',
    lights: [
      { ...defaultLights[0], intensity: 1.2, position: [2, 4, 3] },
      { ...defaultLights[1], intensity: 0.6, position: [-2, 2, 2] },
      { ...defaultLights[2], intensity: 0.4 }
    ]
  },
  outdoor: {
    name: 'Outdoor',
    lights: [
      { ...defaultLights[0], intensity: 2, color: '#fff8dc', position: [10, 10, 5] },
      { ...defaultLights[2], intensity: 0.8, color: '#87ceeb', groundColor: '#228b22' }
    ]
  },
  dramatic: {
    name: 'Dramatic',
    lights: [
      { ...defaultLights[0], intensity: 1.5, position: [5, 8, 2] },
      { 
        id: 'rim-spot',
        name: 'Rim Light',
        type: 'spot' as LightType,
        position: [-5, 3, -3],
        rotation: [0, Math.PI / 4, 0],
        color: '#ff6b6b',
        intensity: 0.8,
        visible: true,
        castShadow: true,
        angle: Math.PI / 6,
        penumbra: 0.5,
        distance: 15
      }
    ]
  },
  night: {
    name: 'Night',
    lights: [
      {
        id: 'moon-directional',
        name: 'Moonlight',
        type: 'directional' as LightType,
        position: [3, 8, 4],
        rotation: [0, 0, 0],
        color: '#b0c4de',
        intensity: 0.3,
        visible: true,
        castShadow: true,
        target: [0, 0, 0]
      },
      { ...defaultLights[2], intensity: 0.1, color: '#191970' }
    ]
  }
};

interface LightingSystemProps {
  onLightsChange?: (lights: Light[]) => void;
}

export function LightingSystem({ onLightsChange }: LightingSystemProps) {
  const [lights, setLights] = useState<Light[]>(defaultLights);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [showGizmos, setShowGizmos] = useState(true);

  const { addNotification } = useAetherStore();

  const selectedLight = useMemo(() => 
    lights.find(light => light.id === selectedLightId),
    [lights, selectedLightId]
  );

  // Update light property
  const updateLight = useCallback((lightId: string, property: keyof Light, value: any) => {
    setLights(prev => prev.map(light => 
      light.id === lightId ? { ...light, [property]: value } : light
    ));
  }, []);

  // Add new light
  const addLight = useCallback((type: LightType) => {
    const newLight: Light = {
      id: `${type}-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Light`,
      type,
      position: [0, 2, 0],
      rotation: [0, 0, 0],
      color: '#ffffff',
      intensity: 1,
      visible: true,
      castShadow: type !== 'hemisphere',
      ...(type === 'point' && { distance: 10, decay: 2 }),
      ...(type === 'spot' && { distance: 10, decay: 2, angle: Math.PI / 6, penumbra: 0.1 }),
      ...(type === 'area' && { width: 2, height: 2 }),
      ...(type === 'hemisphere' && { groundColor: '#654321' }),
      ...(type === 'directional' && { target: [0, 0, 0] })
    };
    
    setLights(prev => [...prev, newLight]);
    setSelectedLightId(newLight.id);
    addNotification(`${newLight.name} added`, 'success');
  }, [addNotification]);

  // Remove light
  const removeLight = useCallback((lightId: string) => {
    setLights(prev => prev.filter(light => light.id !== lightId));
    if (selectedLightId === lightId) {
      setSelectedLightId(null);
    }
    addNotification('Light removed', 'info');
  }, [selectedLightId, addNotification]);

  // Apply preset
  const applyPreset = useCallback((presetKey: string) => {
    const preset = lightingPresets[presetKey];
    setLights(preset.lights);
    setSelectedLightId(null);
    addNotification(`Applied ${preset.name} lighting`, 'success');
  }, [addNotification]);

  // Duplicate light
  const duplicateLight = useCallback((lightId: string) => {
    const light = lights.find(l => l.id === lightId);
    if (light) {
      const duplicated = {
        ...light,
        id: `${light.type}-${Date.now()}`,
        name: `${light.name} Copy`,
        position: [light.position[0] + 1, light.position[1], light.position[2]] as [number, number, number]
      };
      setLights(prev => [...prev, duplicated]);
      setSelectedLightId(duplicated.id);
      addNotification(`Duplicated ${light.name}`, 'success');
    }
  }, [lights, addNotification]);

  // Get light icon
  const getLightIcon = (type: LightType) => {
    switch (type) {
      case 'directional': return <Sun className="w-4 h-4" />;
      case 'point': return <Lightbulb className="w-4 h-4" />;
      case 'spot': return <Flashlight className="w-4 h-4" />;
      case 'area': return <Square className="w-4 h-4" />;
      case 'hemisphere': return <Palette className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  // Render actual Three.js lights
  const renderLights = () => {
    return lights.map(light => {
      if (!light.visible) return null;

      const commonProps = {
        key: light.id,
        position: light.position,
        color: light.color,
        intensity: light.intensity,
        castShadow: light.castShadow
      };

      switch (light.type) {
        case 'directional':
          return (
            <directionalLight
              {...commonProps}
              target-position={light.target}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
          );
        
        case 'point':
          return (
            <pointLight
              {...commonProps}
              distance={light.distance}
              decay={light.decay}
            />
          );
        
        case 'spot':
          return (
            <spotLight
              {...commonProps}
              distance={light.distance}
              decay={light.decay}
              angle={light.angle}
              penumbra={light.penumbra}
              target-position={[0, 0, 0]}
            />
          );
        
        case 'hemisphere':
          return (
            <hemisphereLight
              {...commonProps}
              groundColor={light.groundColor}
            />
          );
        
        default:
          return null;
      }
    });
  };

  // Light gizmo component
  const LightGizmo = ({ light }: { light: Light }) => {
    if (!showGizmos || !light.visible) return null;

    return (
      <group position={light.position}>
        <mesh
          onClick={() => setSelectedLightId(light.id)}
          onPointerEnter={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerLeave={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color={selectedLightId === light.id ? '#ff8800' : light.color}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Light direction indicator for directional/spot lights */}
        {(light.type === 'directional' || light.type === 'spot') && (
          <arrowHelper
            args={[
              new THREE.Vector3(0, -1, 0),
              new THREE.Vector3(0, 0, 0),
              1,
              light.color
            ]}
          />
        )}
        
        {/* Light info */}
        <Html position={[0, 0.3, 0]} center>
          <div className="glass-panel px-2 py-1 rounded text-xs text-on-surface pointer-events-none">
            {light.name}
          </div>
        </Html>
      </group>
    );
  };

  return (
    <>
      {/* Render actual lights */}
      {renderLights()}
      
      {/* Render light gizmos */}
      {lights.map(light => (
        <LightGizmo key={`gizmo-${light.id}`} light={light} />
      ))}
      
      {/* Lighting Control Panel */}
      <Card className="glass-panel h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Lighting</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={showGizmos ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowGizmos(!showGizmos)}
              className="h-6 w-6 p-0"
            >
              {showGizmos ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="lights" className="h-full">
            <TabsList className="grid w-full grid-cols-2 mx-3 mt-3">
              <TabsTrigger value="lights">Lights</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="lights" className="p-3 space-y-3">
              {/* Add Light Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" onClick={() => addLight('directional')}>
                  <Sun className="w-3 h-3 mr-1" />
                  Directional
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addLight('point')}>
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Point
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addLight('spot')}>
                  <Flashlight className="w-3 h-3 mr-1" />
                  Spot
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addLight('hemisphere')}>
                  <Palette className="w-3 h-3 mr-1" />
                  Ambient
                </Button>
              </div>

              {/* Light List */}
              <div className="space-y-2">
                {lights.map(light => (
                  <div
                    key={light.id}
                    className={`p-2 rounded border transition-smooth cursor-pointer ${
                      selectedLightId === light.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-border/50'
                    }`}
                    onClick={() => setSelectedLightId(light.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLightIcon(light.type)}
                        <span className="text-sm font-medium">{light.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {light.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLight(light.id, 'visible', !light.visible);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {light.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateLight(light.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLight(light.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Light Properties */}
              {selectedLight && (
                <div className="space-y-3 border-t border-border/20 pt-3">
                  <h4 className="text-sm font-medium">{selectedLight.name} Properties</h4>
                  
                  {/* Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedLight.color}
                        onChange={(e) => updateLight(selectedLight.id, 'color', e.target.value)}
                        className="w-8 h-8 rounded border border-border"
                      />
                      <input
                        type="text"
                        value={selectedLight.color}
                        onChange={(e) => updateLight(selectedLight.id, 'color', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded"
                      />
                    </div>
                  </div>

                  {/* Intensity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Intensity</label>
                      <span className="text-xs text-on-surface-variant">{selectedLight.intensity.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[selectedLight.intensity]}
                      onValueChange={([value]) => updateLight(selectedLight.id, 'intensity', value)}
                      min={0}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['x', 'y', 'z'].map((axis, index) => (
                        <input
                          key={axis}
                          type="number"
                          value={selectedLight.position[index]}
                          onChange={(e) => {
                            const newPosition = [...selectedLight.position] as [number, number, number];
                            newPosition[index] = Number(e.target.value);
                            updateLight(selectedLight.id, 'position', newPosition);
                          }}
                          className="px-2 py-1 text-xs bg-surface border border-border rounded"
                          placeholder={axis.toUpperCase()}
                          step="0.1"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Type-specific properties */}
                  {(selectedLight.type === 'point' || selectedLight.type === 'spot') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Distance</label>
                        <span className="text-xs text-on-surface-variant">{selectedLight.distance?.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[selectedLight.distance || 10]}
                        onValueChange={([value]) => updateLight(selectedLight.id, 'distance', value)}
                        min={1}
                        max={50}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                  )}

                  {selectedLight.type === 'spot' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium">Angle</label>
                          <span className="text-xs text-on-surface-variant">
                            {((selectedLight.angle || 0) * 180 / Math.PI).toFixed(0)}°
                          </span>
                        </div>
                        <Slider
                          value={[(selectedLight.angle || 0) * 180 / Math.PI]}
                          onValueChange={([value]) => updateLight(selectedLight.id, 'angle', value * Math.PI / 180)}
                          min={5}
                          max={90}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium">Penumbra</label>
                          <span className="text-xs text-on-surface-variant">{selectedLight.penumbra?.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[selectedLight.penumbra || 0]}
                          onValueChange={([value]) => updateLight(selectedLight.id, 'penumbra', value)}
                          min={0}
                          max={1}
                          step={0.01}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {selectedLight.type === 'hemisphere' && selectedLight.groundColor && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Ground Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedLight.groundColor}
                          onChange={(e) => updateLight(selectedLight.id, 'groundColor', e.target.value)}
                          className="w-8 h-8 rounded border border-border"
                        />
                        <input
                          type="text"
                          value={selectedLight.groundColor}
                          onChange={(e) => updateLight(selectedLight.id, 'groundColor', e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="presets" className="p-3 space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(lightingPresets).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    onClick={() => applyPreset(key)}
                    className="h-auto p-3 flex flex-col items-start"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-on-surface-variant">
                      {preset.lights.length} lights
                    </span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </>
  );
}
