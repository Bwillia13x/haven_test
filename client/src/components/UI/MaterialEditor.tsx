import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { X } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function MaterialEditor() {
  const [isVisible, setIsVisible] = useState(false);
  const { materials, updateMaterial } = useAetherStore();
  const [selectedMaterial, setSelectedMaterial] = useState('default');

  if (!isVisible) return null;

  const material = materials[selectedMaterial];

  const handleColorChange = (color: string) => {
    updateMaterial(selectedMaterial, { ...material, color });
  };

  const handleOpacityChange = (value: number[]) => {
    updateMaterial(selectedMaterial, { ...material, opacity: value[0] });
  };

  const handleMetalnessChange = (value: number[]) => {
    updateMaterial(selectedMaterial, { ...material, metalness: value[0] });
  };

  const handleRoughnessChange = (value: number[]) => {
    updateMaterial(selectedMaterial, { ...material, roughness: value[0] });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={() => setIsVisible(false)}
      />
      
      {/* Material Editor */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-gray-800/95 backdrop-blur-sm border-gray-600 z-50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">Material Editor</CardTitle>
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
          {/* Material Selection */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Material</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(materials).map((materialKey) => (
                <Button
                  key={materialKey}
                  variant={selectedMaterial === materialKey ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMaterial(materialKey)}
                  className="justify-start"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: materials[materialKey].color }}
                  />
                  {materialKey.charAt(0).toUpperCase() + materialKey.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={material.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-8 p-1 bg-gray-700 border-gray-600"
              />
              <Input
                type="text"
                value={material.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Opacity</Label>
            <Slider
              value={[material.opacity]}
              onValueChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>{material.opacity.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>

          {/* Metalness */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Metalness</Label>
            <Slider
              value={[material.metalness]}
              onValueChange={handleMetalnessChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>{material.metalness.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>

          {/* Roughness */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Roughness</Label>
            <Slider
              value={[material.roughness]}
              onValueChange={handleRoughnessChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>{material.roughness.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
