import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sparkles, 
  Zap, 
  Eye, 
  Download, 
  Upload,
  RotateCcw,
  Copy,
  Trash2
} from 'lucide-react';
import { useAetherStore } from '@/stores/useAetherStore';
import { cn } from '@/lib/utils';

export interface PBRMaterial {
  id: string;
  name: string;
  albedo: string;
  metallic: number;
  roughness: number;
  normal: number;
  emission: string;
  emissionIntensity: number;
  opacity: number;
  clearcoat: number;
  clearcoatRoughness: number;
  ior: number;
  transmission: number;
  thickness: number;
  attenuationColor: string;
  attenuationDistance: number;
  sheen: number;
  sheenColor: string;
  sheenRoughness: number;
  specular: number;
  specularColor: string;
  iridescence: number;
  iridescenceIOR: number;
  iridescenceThickness: [number, number];
}

const defaultMaterial: PBRMaterial = {
  id: 'default',
  name: 'Default',
  albedo: '#ffffff',
  metallic: 0,
  roughness: 0.5,
  normal: 1,
  emission: '#000000',
  emissionIntensity: 0,
  opacity: 1,
  clearcoat: 0,
  clearcoatRoughness: 0,
  ior: 1.5,
  transmission: 0,
  thickness: 0,
  attenuationColor: '#ffffff',
  attenuationDistance: Infinity,
  sheen: 0,
  sheenColor: '#ffffff',
  sheenRoughness: 0,
  specular: 1,
  specularColor: '#ffffff',
  iridescence: 0,
  iridescenceIOR: 1.3,
  iridescenceThickness: [100, 400]
};

const materialPresets: Record<string, Partial<PBRMaterial>> = {
  metal: {
    name: 'Metal',
    albedo: '#c0c0c0',
    metallic: 1,
    roughness: 0.1
  },
  plastic: {
    name: 'Plastic',
    albedo: '#ff4444',
    metallic: 0,
    roughness: 0.3
  },
  glass: {
    name: 'Glass',
    albedo: '#ffffff',
    metallic: 0,
    roughness: 0,
    transmission: 1,
    ior: 1.5,
    opacity: 0.1
  },
  rubber: {
    name: 'Rubber',
    albedo: '#333333',
    metallic: 0,
    roughness: 0.9
  },
  gold: {
    name: 'Gold',
    albedo: '#ffd700',
    metallic: 1,
    roughness: 0.05
  },
  wood: {
    name: 'Wood',
    albedo: '#8b4513',
    metallic: 0,
    roughness: 0.8
  },
  ceramic: {
    name: 'Ceramic',
    albedo: '#f5f5dc',
    metallic: 0,
    roughness: 0.1
  },
  fabric: {
    name: 'Fabric',
    albedo: '#4169e1',
    metallic: 0,
    roughness: 1,
    sheen: 0.5,
    sheenColor: '#ffffff'
  }
};

interface PBRMaterialEditorProps {
  selectedNodeIds: string[];
  onMaterialChange: (nodeIds: string[], material: PBRMaterial) => void;
}

export function PBRMaterialEditor({ selectedNodeIds, onMaterialChange }: PBRMaterialEditorProps) {
  const [currentMaterial, setCurrentMaterial] = useState<PBRMaterial>(defaultMaterial);
  const [savedMaterials, setSavedMaterials] = useState<PBRMaterial[]>([]);
  const [previewMode, setPreviewMode] = useState<'sphere' | 'cube' | 'plane'>('sphere');

  const { addNotification } = useAetherStore();

  // Update material property
  const updateMaterial = useCallback((property: keyof PBRMaterial, value: any) => {
    const updatedMaterial = { ...currentMaterial, [property]: value };
    setCurrentMaterial(updatedMaterial);
    
    if (selectedNodeIds.length > 0) {
      onMaterialChange(selectedNodeIds, updatedMaterial);
    }
  }, [currentMaterial, selectedNodeIds, onMaterialChange]);

  // Apply preset
  const applyPreset = useCallback((presetKey: string) => {
    const preset = materialPresets[presetKey];
    const updatedMaterial = { 
      ...currentMaterial, 
      ...preset,
      id: `${presetKey}-${Date.now()}`,
      name: preset.name || presetKey
    };
    setCurrentMaterial(updatedMaterial);
    
    if (selectedNodeIds.length > 0) {
      onMaterialChange(selectedNodeIds, updatedMaterial);
    }
    
    addNotification(`Applied ${preset.name} material`, 'success');
  }, [currentMaterial, selectedNodeIds, onMaterialChange, addNotification]);

  // Save current material
  const saveMaterial = useCallback(() => {
    const name = prompt('Material name:');
    if (name) {
      const savedMaterial = { 
        ...currentMaterial, 
        id: `saved-${Date.now()}`,
        name 
      };
      setSavedMaterials(prev => [...prev, savedMaterial]);
      addNotification(`Material "${name}" saved`, 'success');
    }
  }, [currentMaterial, addNotification]);

  // Load saved material
  const loadMaterial = useCallback((material: PBRMaterial) => {
    setCurrentMaterial(material);
    if (selectedNodeIds.length > 0) {
      onMaterialChange(selectedNodeIds, material);
    }
    addNotification(`Loaded material "${material.name}"`, 'info');
  }, [selectedNodeIds, onMaterialChange, addNotification]);

  // Reset to default
  const resetMaterial = useCallback(() => {
    setCurrentMaterial(defaultMaterial);
    if (selectedNodeIds.length > 0) {
      onMaterialChange(selectedNodeIds, defaultMaterial);
    }
    addNotification('Material reset to default', 'info');
  }, [selectedNodeIds, onMaterialChange, addNotification]);

  // Copy material
  const copyMaterial = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(currentMaterial, null, 2));
    addNotification('Material copied to clipboard', 'success');
  }, [currentMaterial, addNotification]);

  // Paste material
  const pasteMaterial = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const material = JSON.parse(text) as PBRMaterial;
      setCurrentMaterial(material);
      if (selectedNodeIds.length > 0) {
        onMaterialChange(selectedNodeIds, material);
      }
      addNotification('Material pasted from clipboard', 'success');
    } catch (error) {
      addNotification('Failed to paste material', 'error');
    }
  }, [selectedNodeIds, onMaterialChange, addNotification]);

  // Material preview component
  const MaterialPreview = useMemo(() => (
    <div className="w-full h-32 bg-gradient-to-br from-surface to-surface-variant rounded-lg flex items-center justify-center">
      <div 
        className="w-16 h-16 rounded-full shadow-elevation-3"
        style={{
          background: `linear-gradient(135deg, ${currentMaterial.albedo}, ${currentMaterial.emission})`,
          opacity: currentMaterial.opacity,
          filter: `brightness(${1 + currentMaterial.emissionIntensity})`
        }}
      />
    </div>
  ), [currentMaterial]);

  return (
    <Card className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">PBR Materials</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {selectedNodeIds.length} selected
        </Badge>
      </div>

      {/* Material Preview */}
      <div className="p-3 border-b border-border/20">
        {MaterialPreview}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium">{currentMaterial.name}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={copyMaterial} className="h-6 w-6 p-0">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={pasteMaterial} className="h-6 w-6 p-0">
              <Upload className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetMaterial} className="h-6 w-6 p-0">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Material Controls */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="basic" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-3 mt-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="p-3 space-y-4">
            {/* Albedo Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Albedo</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentMaterial.albedo}
                  onChange={(e) => updateMaterial('albedo', e.target.value)}
                  className="w-8 h-8 rounded border border-border"
                />
                <input
                  type="text"
                  value={currentMaterial.albedo}
                  onChange={(e) => updateMaterial('albedo', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded"
                />
              </div>
            </div>

            {/* Metallic */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Metallic</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.metallic.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.metallic]}
                onValueChange={([value]) => updateMaterial('metallic', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Roughness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Roughness</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.roughness.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.roughness]}
                onValueChange={([value]) => updateMaterial('roughness', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Emission */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Emission</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentMaterial.emission}
                  onChange={(e) => updateMaterial('emission', e.target.value)}
                  className="w-8 h-8 rounded border border-border"
                />
                <Slider
                  value={[currentMaterial.emissionIntensity]}
                  onValueChange={([value]) => updateMaterial('emissionIntensity', value)}
                  min={0}
                  max={2}
                  step={0.01}
                  className="flex-1"
                />
                <span className="text-xs text-on-surface-variant w-8">
                  {currentMaterial.emissionIntensity.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Opacity</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.opacity.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.opacity]}
                onValueChange={([value]) => updateMaterial('opacity', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="p-3 space-y-4">
            {/* Transmission */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Transmission</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.transmission.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.transmission]}
                onValueChange={([value]) => updateMaterial('transmission', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* IOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">IOR</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.ior.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.ior]}
                onValueChange={([value]) => updateMaterial('ior', value)}
                min={1}
                max={3}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Clearcoat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Clearcoat</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.clearcoat.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.clearcoat]}
                onValueChange={([value]) => updateMaterial('clearcoat', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Sheen */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Sheen</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.sheen.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.sheen]}
                onValueChange={([value]) => updateMaterial('sheen', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Iridescence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Iridescence</label>
                <span className="text-xs text-on-surface-variant">{currentMaterial.iridescence.toFixed(2)}</span>
              </div>
              <Slider
                value={[currentMaterial.iridescence]}
                onValueChange={([value]) => updateMaterial('iridescence', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="presets" className="p-3 space-y-3">
            {/* Material Presets */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(materialPresets).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => applyPreset(key)}
                  className="h-auto p-2 flex flex-col items-start"
                >
                  <div 
                    className="w-full h-6 rounded mb-1"
                    style={{ backgroundColor: preset.albedo }}
                  />
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>

            {/* Saved Materials */}
            {savedMaterials.length > 0 && (
              <div className="space-y-2 border-t border-border/20 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Saved Materials</label>
                  <Button variant="ghost" size="sm" onClick={saveMaterial} className="h-6 px-2">
                    <Download className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {savedMaterials.map((material) => (
                    <div key={material.id} className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadMaterial(material)}
                        className="flex-1 justify-start h-8"
                      >
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: material.albedo }}
                        />
                        <span className="text-xs">{material.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSavedMaterials(prev => prev.filter(m => m.id !== material.id));
                          addNotification(`Material "${material.name}" deleted`, 'info');
                        }}
                        className="w-6 h-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {savedMaterials.length === 0 && (
              <Button variant="ghost" size="sm" onClick={saveMaterial} className="w-full">
                <Download className="w-3 h-3 mr-1" />
                Save Current Material
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
