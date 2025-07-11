import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Copy, 
  RotateCw, 
  Move, 
  Scale, 
  AlignLeft, 
  AlignRight, 
  AlignCenter, 
  AlignJustify,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Group,
  Ungroup
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function AdvancedNodeOperations() {
  const {
    selectedNodes,
    duplicateNodes,
    alignNodes,
    distributeNodes,
    scaleNodes,
    moveNodes,
    rotateNodes,
    groupNodes,
    ungroupNodes,
    addNotification
  } = useAetherStore();

  const [scaleValue, setScaleValue] = useState(1);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [moveZ, setMoveZ] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(45);

  const handleOperation = (operation: () => void, minNodes = 1) => {
    if (selectedNodes.length < minNodes) {
      addNotification(`Select at least ${minNodes} node(s) for this operation`, 'warning');
      return;
    }
    operation();
  };

  const handleDuplicate = () => {
    handleOperation(() => duplicateNodes(selectedNodes));
  };

  const handleScale = () => {
    handleOperation(() => scaleNodes(selectedNodes, scaleValue));
  };

  const handleMove = () => {
    handleOperation(() => moveNodes(selectedNodes, [moveX, moveY, moveZ]));
  };

  const handleRotate = (axis: 'x' | 'y' | 'z') => {
    handleOperation(() => rotateNodes(selectedNodes, axis, (rotationAngle * Math.PI) / 180));
  };

  const handleAlign = (direction: 'left' | 'right' | 'top' | 'bottom' | 'center-x' | 'center-y' | 'center-z') => {
    handleOperation(() => alignNodes(selectedNodes, direction), 2);
  };

  const handleDistribute = (direction: 'horizontal' | 'vertical' | 'depth') => {
    handleOperation(() => distributeNodes(selectedNodes, direction), 3);
  };

  const hasSelection = selectedNodes.length > 0;
  const hasMultipleSelection = selectedNodes.length > 1;

  return (
    <div className="absolute top-4 right-4 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-2rem)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Advanced Operations</h2>
          {hasSelection && (
            <span className="text-sm text-gray-400">
              {selectedNodes.length} selected
            </span>
          )}
        </div>

        <Tabs defaultValue="transform" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transform">Transform</TabsTrigger>
            <TabsTrigger value="align">Align</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>

          <TabsContent value="transform" className="space-y-4">
            {/* Duplicate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Duplicate</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDuplicate}
                  disabled={!hasSelection}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Selection
                </Button>
              </CardContent>
            </Card>

            {/* Scale */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="scale-value">Scale Factor</Label>
                  <Input
                    id="scale-value"
                    type="number"
                    step="0.1"
                    value={scaleValue}
                    onChange={(e) => setScaleValue(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <Button 
                  onClick={handleScale}
                  disabled={!hasSelection}
                  className="w-full"
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Apply Scale
                </Button>
              </CardContent>
            </Card>

            {/* Move */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Move</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="move-x" className="text-xs">X</Label>
                    <Input
                      id="move-x"
                      type="number"
                      step="0.5"
                      value={moveX}
                      onChange={(e) => setMoveX(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="move-y" className="text-xs">Y</Label>
                    <Input
                      id="move-y"
                      type="number"
                      step="0.5"
                      value={moveY}
                      onChange={(e) => setMoveY(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="move-z" className="text-xs">Z</Label>
                    <Input
                      id="move-z"
                      type="number"
                      step="0.5"
                      value={moveZ}
                      onChange={(e) => setMoveZ(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleMove}
                  disabled={!hasSelection}
                  className="w-full"
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move Selection
                </Button>
              </CardContent>
            </Card>

            {/* Rotate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rotate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="rotation-angle">Angle (degrees)</Label>
                  <Input
                    id="rotation-angle"
                    type="number"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(parseFloat(e.target.value) || 45)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => handleRotate('x')}
                    disabled={!hasSelection}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="h-3 w-3 mr-1" />
                    X
                  </Button>
                  <Button 
                    onClick={() => handleRotate('y')}
                    disabled={!hasSelection}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="h-3 w-3 mr-1" />
                    Y
                  </Button>
                  <Button 
                    onClick={() => handleRotate('z')}
                    disabled={!hasSelection}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="h-3 w-3 mr-1" />
                    Z
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="align" className="space-y-4">
            {/* Align */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Align Nodes</CardTitle>
                <p className="text-xs text-gray-400">Requires 2+ selected nodes</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleAlign('left')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <AlignLeft className="h-3 w-3 mr-1" />
                    Left
                  </Button>
                  <Button 
                    onClick={() => handleAlign('right')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <AlignRight className="h-3 w-3 mr-1" />
                    Right
                  </Button>
                  <Button 
                    onClick={() => handleAlign('top')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Top
                  </Button>
                  <Button 
                    onClick={() => handleAlign('bottom')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Bottom
                  </Button>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => handleAlign('center-x')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <AlignCenter className="h-3 w-3 mr-1" />
                    X
                  </Button>
                  <Button 
                    onClick={() => handleAlign('center-y')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <AlignCenter className="h-3 w-3 mr-1" />
                    Y
                  </Button>
                  <Button 
                    onClick={() => handleAlign('center-z')}
                    disabled={!hasMultipleSelection}
                    variant="outline"
                    size="sm"
                  >
                    <AlignCenter className="h-3 w-3 mr-1" />
                    Z
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distribute */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Distribute Nodes</CardTitle>
                <p className="text-xs text-gray-400">Requires 3+ selected nodes</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => handleDistribute('horizontal')}
                    disabled={selectedNodes.length < 3}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    H
                  </Button>
                  <Button 
                    onClick={() => handleDistribute('vertical')}
                    disabled={selectedNodes.length < 3}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    V
                  </Button>
                  <Button 
                    onClick={() => handleDistribute('depth')}
                    disabled={selectedNodes.length < 3}
                    variant="outline"
                    size="sm"
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    D
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            {/* Group Operations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Group Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleOperation(() => groupNodes(selectedNodes), 2)}
                  disabled={selectedNodes.length < 2}
                  className="w-full"
                >
                  <Group className="h-4 w-4 mr-2" />
                  Group Selection
                </Button>
                <Button 
                  onClick={() => ungroupNodes('group')}
                  disabled={!hasSelection}
                  variant="outline"
                  className="w-full"
                >
                  <Ungroup className="h-4 w-4 mr-2" />
                  Ungroup
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}