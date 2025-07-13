import React, { useState, useCallback, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Eye, 
  EyeOff,
  RotateCcw,
  Save,
  Monitor,
  Palette,
  Layers
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export interface PanelConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  icon: React.ComponentType<{ className?: string }>;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  position: 'left' | 'right' | 'bottom' | 'top';
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  panels: {
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
  };
  visibility: Record<string, boolean>;
}

const defaultPresets: LayoutPreset[] = [
  {
    id: 'modeling',
    name: 'Modeling',
    description: 'Optimized for 3D modeling and node manipulation',
    icon: LayoutGrid,
    panels: { left: 20, right: 25, bottom: 30 },
    visibility: { toolbar: true, properties: true, outliner: true, materials: false }
  },
  {
    id: 'animation',
    name: 'Animation',
    description: 'Timeline and keyframe editing focused',
    icon: Monitor,
    panels: { left: 15, right: 20, bottom: 40 },
    visibility: { toolbar: true, properties: true, timeline: true, outliner: true }
  },
  {
    id: 'rendering',
    name: 'Rendering',
    description: 'Material editing and render settings',
    icon: Palette,
    panels: { left: 30, right: 35, bottom: 20 },
    visibility: { materials: true, lighting: true, render: true, properties: true }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean workspace with essential tools only',
    icon: Minimize2,
    panels: { left: 0, right: 0, bottom: 0 },
    visibility: { toolbar: true }
  }
];

interface LayoutManagerProps {
  children: React.ReactNode;
  panels: PanelConfig[];
  onLayoutChange?: (layout: any) => void;
}

export function LayoutManager({ children, panels, onLayoutChange }: LayoutManagerProps) {
  const { actualTheme } = useTheme();
  const [currentPreset, setCurrentPreset] = useState<string>('modeling');
  const [panelSizes, setPanelSizes] = useState<Record<string, number>>({});
  const [panelVisibility, setPanelVisibility] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customPresets, setCustomPresets] = useState<LayoutPreset[]>([]);

  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('aether-layout');
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        setPanelSizes(layout.panelSizes || {});
        setPanelVisibility(layout.panelVisibility || {});
        setCurrentPreset(layout.currentPreset || 'modeling');
        setCustomPresets(layout.customPresets || []);
      } catch (error) {
        console.warn('Failed to load saved layout:', error);
      }
    }
  }, []);

  // Save layout to localStorage
  const saveLayout = useCallback(() => {
    const layout = {
      panelSizes,
      panelVisibility,
      currentPreset,
      customPresets
    };
    localStorage.setItem('aether-layout', JSON.stringify(layout));
    onLayoutChange?.(layout);
  }, [panelSizes, panelVisibility, currentPreset, customPresets, onLayoutChange]);

  // Apply preset
  const applyPreset = useCallback((preset: LayoutPreset) => {
    setCurrentPreset(preset.id);
    setPanelSizes(preset.panels);
    setPanelVisibility(preset.visibility);
    setIsFullscreen(false);
  }, []);

  // Toggle panel visibility
  const togglePanel = useCallback((panelId: string) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    const defaultPreset = defaultPresets.find(p => p.id === 'modeling')!;
    applyPreset(defaultPreset);
  }, [applyPreset]);

  // Save current layout as custom preset
  const saveAsPreset = useCallback((name: string, description: string) => {
    const newPreset: LayoutPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      icon: Settings,
      panels: panelSizes,
      visibility: panelVisibility
    };
    setCustomPresets(prev => [...prev, newPreset]);
  }, [panelSizes, panelVisibility]);

  // Get panels by position
  const getPanelsByPosition = (position: 'left' | 'right' | 'bottom' | 'top') => {
    return panels.filter(panel => panel.position === position);
  };

  // Render panel content
  const renderPanel = (panel: PanelConfig) => {
    const isVisible = panelVisibility[panel.id] !== false;
    if (!isVisible) return null;

    return (
      <Card key={panel.id} className="h-full glass-panel border-0">
        <div className="flex items-center justify-between p-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <panel.icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{panel.title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel(panel.id)}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="w-3 h-3" />
          </Button>
        </div>
        <div className="p-3 h-[calc(100%-60px)] overflow-auto">
          <panel.component />
        </div>
      </Card>
    );
  };

  if (isFullscreen) {
    return (
      <div className="relative w-full h-full">
        {children}
        <Button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 glass-panel"
          size="sm"
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const leftPanels = getPanelsByPosition('left');
  const rightPanels = getPanelsByPosition('right');
  const bottomPanels = getPanelsByPosition('bottom');

  return (
    <div className="w-full h-full flex flex-col">
      {/* Layout Controls */}
      <div className="flex items-center justify-between p-2 glass-panel border-b border-border/20 z-50">
        <div className="flex items-center gap-2">
          <Tabs value={currentPreset} onValueChange={(value) => {
            const preset = [...defaultPresets, ...customPresets].find(p => p.id === value);
            if (preset) applyPreset(preset);
          }}>
            <TabsList className="h-8">
              {defaultPresets.map(preset => (
                <TabsTrigger key={preset.id} value={preset.id} className="text-xs">
                  <preset.icon className="w-3 h-3 mr-1" />
                  {preset.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-1">
          {panels.map(panel => (
            <Button
              key={panel.id}
              variant={panelVisibility[panel.id] !== false ? "default" : "ghost"}
              size="sm"
              onClick={() => togglePanel(panel.id)}
              className="h-7 px-2"
            >
              <panel.icon className="w-3 h-3" />
            </Button>
          ))}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button variant="ghost" size="sm" onClick={resetLayout} className="h-7 px-2">
            <RotateCcw className="w-3 h-3" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={saveLayout} className="h-7 px-2">
            <Save className="w-3 h-3" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-7 px-2">
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panels */}
          {leftPanels.length > 0 && (
            <>
              <ResizablePanel
                defaultSize={panelSizes.left || 20}
                minSize={15}
                maxSize={40}
                className="min-w-[200px]"
              >
                <div className="h-full p-2 space-y-2">
                  {leftPanels.map(renderPanel)}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center Content */}
          <ResizablePanel defaultSize={100 - (panelSizes.left || 0) - (panelSizes.right || 0)}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Main Viewport */}
              <ResizablePanel defaultSize={100 - (panelSizes.bottom || 0)}>
                {children}
              </ResizablePanel>

              {/* Bottom Panels */}
              {bottomPanels.length > 0 && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel
                    defaultSize={panelSizes.bottom || 30}
                    minSize={20}
                    maxSize={50}
                    className="min-h-[150px]"
                  >
                    <div className="h-full p-2">
                      <Tabs defaultValue={bottomPanels[0]?.id} className="h-full">
                        <TabsList className="grid w-full grid-cols-3">
                          {bottomPanels.map(panel => (
                            <TabsTrigger key={panel.id} value={panel.id}>
                              <panel.icon className="w-4 h-4 mr-2" />
                              {panel.title}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {bottomPanels.map(panel => (
                          <TabsContent key={panel.id} value={panel.id} className="h-[calc(100%-40px)]">
                            {renderPanel(panel)}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Right Panels */}
          {rightPanels.length > 0 && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={panelSizes.right || 25}
                minSize={15}
                maxSize={40}
                className="min-w-[200px]"
              >
                <div className="h-full p-2 space-y-2">
                  {rightPanels.map(renderPanel)}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
