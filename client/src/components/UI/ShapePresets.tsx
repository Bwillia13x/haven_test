import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { 
  Shapes, 
  Box, 
  Triangle, 
  Circle, 
  Zap,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";
import { shapePresets, ShapePreset } from "../../utils/shapePresets";

export function ShapePresets() {
  const { createShapePreset, addNotification } = useAetherStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [presetOptions, setPresetOptions] = useState({
    scale: 1,
    density: 8,
    complexity: 20,
    material: 'default'
  });

  const categories = [
    { id: 'all', name: 'All', icon: Shapes },
    { id: 'basic', name: 'Basic', icon: Box },
    { id: 'geometric', name: 'Geometric', icon: Circle },
    { id: 'mathematical', name: 'Mathematical', icon: Zap },
  ];

  const filteredPresets = selectedCategory === 'all' 
    ? shapePresets 
    : shapePresets.filter(preset => preset.category === selectedCategory);

  const handleCreatePreset = (preset: ShapePreset) => {
    const options = {
      scale: presetOptions.scale,
      density: presetOptions.density,
      complexity: presetOptions.complexity,
      material: presetOptions.material,
      position: [0, 0, 0] as [number, number, number]
    };

    createShapePreset(preset.id, options);
    setShowOptions(null);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || Shapes;
  };

  if (!isExpanded) {
    return (
      <Card className="absolute top-4 left-96 w-12 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <CardContent className="p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="w-full h-8"
                >
                  <Shapes className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shape Presets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-4 left-96 w-80 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50 max-h-96 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Shapes className="w-4 h-4" />
            Shape Presets
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
      
      <CardContent className="space-y-3 overflow-y-auto max-h-80">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="h-7 px-2 text-xs"
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>

        <Separator />

        {/* Preset Options */}
        {showOptions && (
          <div className="space-y-3 p-3 bg-gray-700/50 rounded-md">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-300">Options</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(null)}
                className="h-5 w-5 p-0"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Scale: {presetOptions.scale}</Label>
                <Slider
                  value={[presetOptions.scale]}
                  onValueChange={(value) => setPresetOptions(prev => ({ ...prev, scale: value[0] }))}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-400">Density: {presetOptions.density}</Label>
                <Slider
                  value={[presetOptions.density]}
                  onValueChange={(value) => setPresetOptions(prev => ({ ...prev, density: value[0] }))}
                  min={4}
                  max={20}
                  step={1}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-400">Complexity: {presetOptions.complexity}</Label>
                <Slider
                  value={[presetOptions.complexity]}
                  onValueChange={(value) => setPresetOptions(prev => ({ ...prev, complexity: value[0] }))}
                  min={5}
                  max={50}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Shape Presets Grid */}
        <div className="grid grid-cols-2 gap-2">
          {filteredPresets.map((preset) => {
            const IconComponent = getCategoryIcon(preset.category);
            return (
              <div key={preset.id} className="space-y-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-16 flex flex-col items-center justify-center gap-1 text-xs"
                        onClick={() => handleCreatePreset(preset)}
                      >
                        <span className="text-lg">{preset.icon}</span>
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-48">
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-xs text-gray-400">{preset.description}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {preset.category}
                        </Badge>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptions(showOptions === preset.id ? null : preset.id)}
                  className="w-full h-5 text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Options
                  {showOptions === preset.id ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {filteredPresets.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            No presets found in this category
          </div>
        )}
      </CardContent>
    </Card>
  );
}
