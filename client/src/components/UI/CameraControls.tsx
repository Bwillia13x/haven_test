import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { 
  Camera, 
  Home, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Maximize
} from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function CameraControls() {
  const { addNotification } = useAetherStore();

  const handleResetCamera = () => {
    addNotification('Camera reset', 'info');
    // Camera reset logic would go here
  };

  const handleFocusAll = () => {
    addNotification('Focus all nodes', 'info');
    // Focus all logic would go here
  };

  const handleZoomIn = () => {
    addNotification('Zoom in', 'info');
    // Zoom in logic would go here
  };

  const handleZoomOut = () => {
    addNotification('Zoom out', 'info');
    // Zoom out logic would go here
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <TooltipProvider>
      <Card className="absolute bottom-4 right-4 p-2 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
        <div className="flex items-center gap-2">
          {/* Reset Camera */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleResetCamera}>
                <Home className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Camera (Home)</p>
            </TooltipContent>
          </Tooltip>

          {/* Focus All */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleFocusAll}>
                <Maximize className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Focus All (F)</p>
            </TooltipContent>
          </Tooltip>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In (+)</p>
            </TooltipContent>
          </Tooltip>

          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out (-)</p>
            </TooltipContent>
          </Tooltip>

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleFullscreen}>
                <Camera className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Fullscreen (F11)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
  );
}
