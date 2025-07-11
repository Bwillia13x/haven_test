import React, { useState, useEffect } from 'react';
import { useAetherStore } from '../../stores/useAetherStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Camera, 
  Target, 
  Bookmark, 
  Eye, 
  Home, 
  Box,
  Maximize,
  RotateCcw,
  Plus,
  Trash2,
  Play
} from 'lucide-react';
interface CameraBookmark {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  created: number;
}

interface ViewPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  icon: React.ComponentType<any>;
}

const VIEW_PRESETS: ViewPreset[] = [
  {
    name: 'Front',
    position: [0, 0, 15],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Back',
    position: [0, 0, -15],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Top',
    position: [0, 15, 0],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Bottom',
    position: [0, -15, 0],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Right',
    position: [15, 0, 0],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Left',
    position: [-15, 0, 0],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Isometric',
    position: [10, 10, 10],
    target: [0, 0, 0],
    icon: Box
  },
  {
    name: 'Home',
    position: [10, 10, 10],
    target: [0, 0, 0],
    icon: Home
  }
];

export function CameraControls() {
  const { 
    selectedNodes, 
    nodes, 
    addNotification,
    cameraBookmarks,
    addCameraBookmark,
    deleteCameraBookmark
  } = useAetherStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [activeTab, setActiveTab] = useState('presets');

  const handleViewPreset = (preset: ViewPreset) => {
    window.dispatchEvent(new CustomEvent('camera-view-preset', { detail: { preset: preset.name } }));
  };

  const handleFocusSelected = () => {
    window.dispatchEvent(new CustomEvent('camera-focus-selected'));
  };

  const handleFrameAll = () => {
    window.dispatchEvent(new CustomEvent('camera-frame-all'));
  };

  const handleSaveBookmark = () => {
    if (!bookmarkName.trim()) {
      addNotification('Please enter a bookmark name', 'error');
      return;
    }

    // Dispatch event to get current camera position from the CameraController
    window.dispatchEvent(new CustomEvent('camera-save-bookmark', { detail: { name: bookmarkName } }));
    setBookmarkName('');
  };

  const handleLoadBookmark = (bookmark: CameraBookmark) => {
    window.dispatchEvent(new CustomEvent('camera-load-bookmark', { detail: { bookmark } }));
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    deleteCameraBookmark(bookmarkId);
    addNotification('Bookmark deleted', 'success');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40"
        variant="outline"
      >
        <Camera className="h-4 w-4 mr-2" />
        Camera
      </Button>
    );
  }

  return (
    <div className="fixed top-4 left-4 w-80 max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Camera Controls</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          ×
        </Button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[80vh]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Views</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleFocusSelected} 
                  className="w-full"
                  disabled={selectedNodes.length === 0}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Focus Selected ({selectedNodes.length})
                </Button>
                <Button 
                  onClick={handleFrameAll} 
                  className="w-full"
                  disabled={nodes.length === 0}
                >
                  <Maximize className="h-4 w-4 mr-2" />
                  Frame All ({nodes.length})
                </Button>
              </CardContent>
            </Card>

            {/* View Presets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">View Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {VIEW_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      onClick={() => handleViewPreset(preset)}
                      variant="outline"
                      className="flex flex-col h-16 p-2"
                    >
                      <preset.icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {/* Save Bookmark */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Save Current View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Bookmark name"
                  value={bookmarkName}
                  onChange={(e) => setBookmarkName(e.target.value)}
                />
                <Button onClick={handleSaveBookmark} className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Bookmark
                </Button>
              </CardContent>
            </Card>

            {/* Bookmarks List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Saved Bookmarks</CardTitle>
              </CardHeader>
              <CardContent>
                {cameraBookmarks && cameraBookmarks.length > 0 ? (
                  <div className="space-y-2">
                    {cameraBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{bookmark.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(bookmark.created).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadBookmark(bookmark)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <Bookmark className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No bookmarks saved</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}