import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  TreePine, 
  Snowflake, 
  Zap, 
  Play, 
  RotateCcw, 
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { useAetherStore } from '@/stores/useAetherStore';
import * as THREE from 'three';

interface LSystemRule {
  symbol: string;
  replacement: string;
}

interface LSystemConfig {
  axiom: string;
  rules: LSystemRule[];
  iterations: number;
  angle: number;
  length: number;
  lengthDecay: number;
  thickness: number;
  thicknessDecay: number;
}

const presetLSystems: Record<string, LSystemConfig> = {
  tree: {
    axiom: 'F',
    rules: [
      { symbol: 'F', replacement: 'F[+F]F[-F]F' }
    ],
    iterations: 4,
    angle: 25,
    length: 1,
    lengthDecay: 0.8,
    thickness: 0.1,
    thicknessDecay: 0.7
  },
  dragonCurve: {
    axiom: 'FX',
    rules: [
      { symbol: 'X', replacement: 'X+YF+' },
      { symbol: 'Y', replacement: '-FX-Y' }
    ],
    iterations: 10,
    angle: 90,
    length: 0.5,
    lengthDecay: 1,
    thickness: 0.02,
    thicknessDecay: 1
  },
  kochSnowflake: {
    axiom: 'F++F++F',
    rules: [
      { symbol: 'F', replacement: 'F-F++F-F' }
    ],
    iterations: 4,
    angle: 60,
    length: 1,
    lengthDecay: 0.33,
    thickness: 0.05,
    thicknessDecay: 1
  },
  sierpinski: {
    axiom: 'F-G-G',
    rules: [
      { symbol: 'F', replacement: 'F-G+F+G-F' },
      { symbol: 'G', replacement: 'GG' }
    ],
    iterations: 5,
    angle: 120,
    length: 0.5,
    lengthDecay: 0.5,
    thickness: 0.03,
    thicknessDecay: 1
  },
  plant: {
    axiom: 'X',
    rules: [
      { symbol: 'X', replacement: 'F+[[X]-X]-F[-FX]+X' },
      { symbol: 'F', replacement: 'FF' }
    ],
    iterations: 5,
    angle: 25,
    length: 0.5,
    lengthDecay: 0.9,
    thickness: 0.08,
    thicknessDecay: 0.8
  },
  fractalTree: {
    axiom: 'F',
    rules: [
      { symbol: 'F', replacement: 'F[+F]F[-F][F]' }
    ],
    iterations: 4,
    angle: 20,
    length: 1,
    lengthDecay: 0.75,
    thickness: 0.12,
    thicknessDecay: 0.6
  }
};

interface TurtleState {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  up: THREE.Vector3;
  length: number;
  thickness: number;
}

class LSystemTurtle {
  private stack: TurtleState[] = [];
  private state: TurtleState;
  private geometry: THREE.BufferGeometry;
  private vertices: number[] = [];
  private indices: number[] = [];
  private config: LSystemConfig;

  constructor(config: LSystemConfig) {
    this.config = config;
    this.state = {
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(0, 1, 0),
      up: new THREE.Vector3(0, 0, 1),
      length: config.length,
      thickness: config.thickness
    };
    this.geometry = new THREE.BufferGeometry();
  }

  // Execute L-System string
  execute(lString: string): THREE.BufferGeometry {
    this.vertices = [];
    this.indices = [];
    
    for (const symbol of lString) {
      switch (symbol) {
        case 'F':
        case 'G':
          this.drawForward();
          break;
        case '+':
          this.turnLeft();
          break;
        case '-':
          this.turnRight();
          break;
        case '[':
          this.pushState();
          break;
        case ']':
          this.popState();
          break;
        case '&':
          this.pitchDown();
          break;
        case '^':
          this.pitchUp();
          break;
        case '\\':
          this.rollLeft();
          break;
        case '/':
          this.rollRight();
          break;
        case '|':
          this.turnAround();
          break;
      }
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
    this.geometry.setIndex(this.indices);
    this.geometry.computeVertexNormals();
    
    return this.geometry;
  }

  private drawForward() {
    const startPos = this.state.position.clone();
    const endPos = startPos.clone().add(
      this.state.direction.clone().multiplyScalar(this.state.length)
    );

    // Create cylinder segment
    const segments = 8;
    const startIndex = this.vertices.length / 3;

    // Add vertices for cylinder
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const right = new THREE.Vector3().crossVectors(this.state.direction, this.state.up).normalize();
      const up = new THREE.Vector3().crossVectors(right, this.state.direction).normalize();
      
      const offset = right.clone().multiplyScalar(Math.cos(angle) * this.state.thickness)
        .add(up.clone().multiplyScalar(Math.sin(angle) * this.state.thickness));
      
      // Start circle
      const startVertex = startPos.clone().add(offset);
      this.vertices.push(startVertex.x, startVertex.y, startVertex.z);
      
      // End circle
      const endVertex = endPos.clone().add(offset);
      this.vertices.push(endVertex.x, endVertex.y, endVertex.z);
    }

    // Add indices for cylinder faces
    for (let i = 0; i < segments; i++) {
      const a = startIndex + i * 2;
      const b = startIndex + i * 2 + 1;
      const c = startIndex + ((i + 1) % (segments + 1)) * 2;
      const d = startIndex + ((i + 1) % (segments + 1)) * 2 + 1;

      // Two triangles per face
      this.indices.push(a, b, c);
      this.indices.push(b, d, c);
    }

    // Update state
    this.state.position = endPos;
    this.state.length *= this.config.lengthDecay;
    this.state.thickness *= this.config.thicknessDecay;
  }

  private turnLeft() {
    const angle = this.config.angle * Math.PI / 180;
    this.state.direction.applyAxisAngle(this.state.up, angle);
  }

  private turnRight() {
    const angle = -this.config.angle * Math.PI / 180;
    this.state.direction.applyAxisAngle(this.state.up, angle);
  }

  private pitchDown() {
    const angle = this.config.angle * Math.PI / 180;
    const right = new THREE.Vector3().crossVectors(this.state.direction, this.state.up);
    this.state.direction.applyAxisAngle(right, angle);
    this.state.up.applyAxisAngle(right, angle);
  }

  private pitchUp() {
    const angle = -this.config.angle * Math.PI / 180;
    const right = new THREE.Vector3().crossVectors(this.state.direction, this.state.up);
    this.state.direction.applyAxisAngle(right, angle);
    this.state.up.applyAxisAngle(right, angle);
  }

  private rollLeft() {
    const angle = this.config.angle * Math.PI / 180;
    this.state.up.applyAxisAngle(this.state.direction, angle);
  }

  private rollRight() {
    const angle = -this.config.angle * Math.PI / 180;
    this.state.up.applyAxisAngle(this.state.direction, angle);
  }

  private turnAround() {
    this.state.direction.multiplyScalar(-1);
  }

  private pushState() {
    this.stack.push({
      position: this.state.position.clone(),
      direction: this.state.direction.clone(),
      up: this.state.up.clone(),
      length: this.state.length,
      thickness: this.state.thickness
    });
  }

  private popState() {
    const savedState = this.stack.pop();
    if (savedState) {
      this.state = savedState;
    }
  }
}

export function LSystemGenerator() {
  const [config, setConfig] = useState<LSystemConfig>(presetLSystems.tree);
  const [customRules, setCustomRules] = useState('');
  const [generatedString, setGeneratedString] = useState('');
  const [previewGeometry, setPreviewGeometry] = useState<THREE.BufferGeometry | null>(null);

  const { addNode, addNotification } = useAetherStore();

  // Generate L-System string
  const generateString = useCallback((config: LSystemConfig): string => {
    let current = config.axiom;
    
    for (let i = 0; i < config.iterations; i++) {
      let next = '';
      for (const char of current) {
        const rule = config.rules.find(r => r.symbol === char);
        next += rule ? rule.replacement : char;
      }
      current = next;
    }
    
    return current;
  }, []);

  // Generate geometry from L-System
  const generateGeometry = useCallback((lString: string, config: LSystemConfig): THREE.BufferGeometry => {
    const turtle = new LSystemTurtle(config);
    return turtle.execute(lString);
  }, []);

  // Update preview
  const updatePreview = useCallback(() => {
    const lString = generateString(config);
    setGeneratedString(lString);
    
    const geometry = generateGeometry(lString, config);
    setPreviewGeometry(geometry);
  }, [config, generateString, generateGeometry]);

  // Apply preset
  const applyPreset = useCallback((presetKey: string) => {
    const preset = presetLSystems[presetKey];
    setConfig(preset);
    addNotification(`Applied ${presetKey} L-System`, 'success');
  }, [addNotification]);

  // Update config property
  const updateConfig = useCallback((property: keyof LSystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [property]: value }));
  }, []);

  // Parse custom rules
  const parseCustomRules = useCallback((rulesText: string): LSystemRule[] => {
    const lines = rulesText.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const [symbol, replacement] = line.split('->').map(s => s.trim());
      return { symbol: symbol || '', replacement: replacement || '' };
    }).filter(rule => rule.symbol && rule.replacement);
  }, []);

  // Apply custom rules
  const applyCustomRules = useCallback(() => {
    const rules = parseCustomRules(customRules);
    if (rules.length > 0) {
      updateConfig('rules', rules);
      addNotification(`Applied ${rules.length} custom rules`, 'success');
    } else {
      addNotification('No valid rules found', 'warning');
    }
  }, [customRules, parseCustomRules, updateConfig, addNotification]);

  // Generate and add to scene
  const generateToScene = useCallback(() => {
    const lString = generateString(config);
    const geometry = generateGeometry(lString, config);
    
    // Create a new node with the generated geometry
    const nodeId = `lsystem-${Date.now()}`;
    addNode([0, 0, 0], 'custom', {
      geometry: geometry,
      material: {
        color: '#8b4513',
        metallic: 0,
        roughness: 0.8,
        opacity: 1
      }
    });
    
    addNotification('L-System generated and added to scene', 'success');
  }, [config, generateString, generateGeometry, addNode, addNotification]);

  // Auto-update preview when config changes
  React.useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <Card className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <TreePine className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">L-Systems</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {generatedString.length} symbols
        </Badge>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="presets" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-3 mt-3">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(presetLSystems).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => applyPreset(key)}
                  className="h-auto p-2 flex flex-col items-start"
                >
                  <span className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-xs text-on-surface-variant">
                    {preset.iterations} iterations
                  </span>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="p-3 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Axiom</label>
              <Input
                value={config.axiom}
                onChange={(e) => updateConfig('axiom', e.target.value)}
                placeholder="F"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Rules (symbol -> replacement)</label>
              <Textarea
                value={customRules}
                onChange={(e) => setCustomRules(e.target.value)}
                placeholder="F -> F[+F]F[-F]F&#10;X -> F+[[X]-X]-F[-FX]+X"
                className="text-xs font-mono"
                rows={4}
              />
              <Button variant="ghost" size="sm" onClick={applyCustomRules} className="w-full">
                Apply Rules
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Current Rules</label>
              <div className="space-y-1">
                {config.rules.map((rule, index) => (
                  <div key={index} className="text-xs font-mono bg-surface-variant/30 p-2 rounded">
                    {rule.symbol} → {rule.replacement}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-3 space-y-4">
            {/* Iterations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Iterations</label>
                <span className="text-xs text-on-surface-variant">{config.iterations}</span>
              </div>
              <Slider
                value={[config.iterations]}
                onValueChange={([value]) => updateConfig('iterations', value)}
                min={1}
                max={8}
                step={1}
                className="w-full"
              />
            </div>

            {/* Angle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Angle</label>
                <span className="text-xs text-on-surface-variant">{config.angle}°</span>
              </div>
              <Slider
                value={[config.angle]}
                onValueChange={([value]) => updateConfig('angle', value)}
                min={5}
                max={90}
                step={5}
                className="w-full"
              />
            </div>

            {/* Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Length</label>
                <span className="text-xs text-on-surface-variant">{config.length.toFixed(2)}</span>
              </div>
              <Slider
                value={[config.length]}
                onValueChange={([value]) => updateConfig('length', value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Length Decay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Length Decay</label>
                <span className="text-xs text-on-surface-variant">{config.lengthDecay.toFixed(2)}</span>
              </div>
              <Slider
                value={[config.lengthDecay]}
                onValueChange={([value]) => updateConfig('lengthDecay', value)}
                min={0.1}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Thickness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Thickness</label>
                <span className="text-xs text-on-surface-variant">{config.thickness.toFixed(3)}</span>
              </div>
              <Slider
                value={[config.thickness]}
                onValueChange={([value]) => updateConfig('thickness', value)}
                min={0.01}
                max={0.5}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Thickness Decay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Thickness Decay</label>
                <span className="text-xs text-on-surface-variant">{config.thicknessDecay.toFixed(2)}</span>
              </div>
              <Slider
                value={[config.thicknessDecay]}
                onValueChange={([value]) => updateConfig('thicknessDecay', value)}
                min={0.1}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border/20 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={updatePreview}>
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button variant="default" size="sm" onClick={generateToScene}>
            <Play className="w-3 h-3 mr-1" />
            Generate
          </Button>
        </div>
        
        <div className="text-xs text-on-surface-variant">
          String length: {generatedString.length} characters
        </div>
      </div>
    </Card>
  );
}
