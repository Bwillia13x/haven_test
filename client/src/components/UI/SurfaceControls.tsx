import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Triangle,
  Grid3X3,
  Hexagon,
  Square,
  ArrowUp,
  RotateCw,
  Stretch
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";
import { SurfaceType } from "../../types/aether";

export function SurfaceControls() {
  const {
    selectedNodes,
    generateSurface,
    generateSurfaceFromNetwork,
    extrudeNodes,
    revolveNodes,
    generateSubdivisionSurface,
    addNotification
  } = useAetherStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('triangulation');

  const handleGenerateSurface = () => {
    if (selectedNodes.length < 3) {
      addNotification('Select at least 3 nodes to generate a surface', 'warning');
      return;
    }

    generateSurface(selectedNodes, surfaceType);
  };

  const handleGenerateNetworkSurface = () => {
    if (selectedNodes.length === 0) {
      addNotification('Select a starting node to generate network surface', 'warning');
      return;
    }

    generateSurfaceFromNetwork(selectedNodes[0]);
  };

  const surfaceTypeIcons = {
    triangulation: Triangle,
    quad: Square,
    convexHull: Hexagon,
    grid: Grid3X3
  };

  if (!isExpanded) {
    return (
      <Card className="absolute bottom-4 left-4 w-12 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full h-8"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute bottom-4 left-4 w-80 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Surface Generation
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
          {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Surface Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Surface Type</Label>
          <Select value={surfaceType} onValueChange={(value: SurfaceType) => setSurfaceType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="triangulation">
                <div className="flex items-center gap-2">
                  <Triangle className="w-4 h-4" />
                  Triangulation
                </div>
              </SelectItem>
              <SelectItem value="quad">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Quad Mesh
                </div>
              </SelectItem>
              <SelectItem value="convexHull">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-4 h-4" />
                  Convex Hull
                </div>
              </SelectItem>
              <SelectItem value="grid">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Grid Surface
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Generation Options */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Generation Methods</Label>
          
          <Button
            onClick={handleGenerateSurface}
            disabled={selectedNodes.length < 3}
            className="w-full"
            variant="outline"
          >
            <Triangle className="w-4 h-4 mr-2" />
            Generate from Selected Nodes
          </Button>

          <Button
            onClick={handleGenerateNetworkSurface}
            disabled={selectedNodes.length === 0}
            className="w-full"
            variant="outline"
          >
            <Layers className="w-4 h-4 mr-2" />
            Generate from Node Network
          </Button>
        </div>

        <Separator />

        {/* Mesh Tools */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Mesh Tools</Label>

          <Button
            onClick={() => {
              if (selectedNodes.length < 2) {
                addNotification('Select at least 2 nodes to extrude', 'warning');
                return;
              }
              extrudeNodes(selectedNodes, [0, 1, 0], 1); // Extrude upward by 1 unit
            }}
            disabled={selectedNodes.length < 2}
            className="w-full"
            variant="outline"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Extrude (Y+)
          </Button>

          <Button
            onClick={() => {
              if (selectedNodes.length < 2) {
                addNotification('Select at least 2 nodes to revolve', 'warning');
                return;
              }
              revolveNodes(selectedNodes, [0, 1, 0], Math.PI * 2, 16); // Full revolution around Y axis
            }}
            disabled={selectedNodes.length < 2}
            className="w-full"
            variant="outline"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Revolve (360°)
          </Button>
        </div>

        <Separator />

        {/* Subdivision Surfaces */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Subdivision Surfaces</Label>

          <Button
            onClick={() => {
              if (selectedNodes.length < 4) {
                addNotification('Select at least 4 nodes for subdivision surface', 'warning');
                return;
              }
              generateSubdivisionSurface(selectedNodes, 'catmull-clark', 1);
            }}
            disabled={selectedNodes.length < 4}
            className="w-full"
            variant="outline"
          >
            <Triangle className="w-4 h-4 mr-2" />
            Catmull-Clark Subdivision
          </Button>

          <Button
            onClick={() => {
              if (selectedNodes.length < 4) {
                addNotification('Select at least 4 nodes for subdivision surface', 'warning');
                return;
              }
              generateSubdivisionSurface(selectedNodes, 'loop', 2);
            }}
            disabled={selectedNodes.length < 4}
            className="w-full"
            variant="outline"
          >
            <Hexagon className="w-4 h-4 mr-2" />
            Loop Subdivision (2x)
          </Button>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Quick Actions</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setSurfaceType('triangulation');
                handleGenerateSurface();
              }}
              disabled={selectedNodes.length < 3}
              size="sm"
              variant="outline"
            >
              <Triangle className="w-3 h-3 mr-1" />
              Triangle
            </Button>
            
            <Button
              onClick={() => {
                setSurfaceType('quad');
                handleGenerateSurface();
              }}
              disabled={selectedNodes.length < 4}
              size="sm"
              variant="outline"
            >
              <Square className="w-3 h-3 mr-1" />
              Quad
            </Button>
            
            <Button
              onClick={() => {
                setSurfaceType('convexHull');
                handleGenerateSurface();
              }}
              disabled={selectedNodes.length < 4}
              size="sm"
              variant="outline"
            >
              <Hexagon className="w-3 h-3 mr-1" />
              Hull
            </Button>
            
            <Button
              onClick={() => {
                setSurfaceType('grid');
                handleGenerateSurface();
              }}
              disabled={selectedNodes.length < 4}
              size="sm"
              variant="outline"
            >
              <Grid3X3 className="w-3 h-3 mr-1" />
              Grid
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Triangulation:</strong> Creates triangular faces between points</p>
          <p><strong>Quad Mesh:</strong> Creates quadrilateral faces in a grid pattern</p>
          <p><strong>Convex Hull:</strong> Creates the smallest convex surface containing all points</p>
          <p><strong>Grid Surface:</strong> Creates a regular grid surface from points</p>
        </div>
      </CardContent>
    </Card>
  );
}
