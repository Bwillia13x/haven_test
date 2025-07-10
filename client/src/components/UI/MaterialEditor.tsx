import React, { useState } from 'react';
import { useAetherStore } from '../../stores/useAetherStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Trash2, Plus, Palette, Eye, Save } from 'lucide-react';
import type { Material } from '../../types/aether';

interface MaterialPreviewProps {
  material: Material;
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

function MaterialPreview({ material, name, isSelected, onClick, onDelete }: MaterialPreviewProps) {
  const isBuiltIn = ['default', 'selected', 'connecting', 'metallic', 'glass', 'neon'].includes(name);
  
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{name}</span>
          {!isBuiltIn && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Material preview sphere */}
        <div 
          className="w-full h-12 rounded-lg border"
          style={{
            background: `linear-gradient(135deg, ${material.color} 0%, ${material.color}88 100%)`,
            opacity: material.opacity,
            boxShadow: material.metalness > 0.5 ? 'inset 0 1px 3px rgba(255,255,255,0.3)' : 'none'
          }}
        />
        
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Metalness</span>
            <span>{Math.round(material.metalness * 100)}%</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Roughness</span>
            <span>{Math.round(material.roughness * 100)}%</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Opacity</span>
            <span>{Math.round(material.opacity * 100)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MaterialEditor() {
  const { 
    materials, 
    selectedNodes, 
    setNodeMaterial,
    addNotification,
    addMaterial,
    updateMaterial,
    deleteMaterial
  } = useAetherStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('default');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [activeTab, setActiveTab] = useState('library');

  const handleApplyMaterial = (materialName: string) => {
    if (selectedNodes.length === 0) {
      addNotification('Please select nodes to apply material', 'warning');
      return;
    }

    selectedNodes.forEach(nodeId => {
      setNodeMaterial(nodeId, materialName);
    });
    
    addNotification(`Applied ${materialName} material to ${selectedNodes.length} node(s)`, 'success');
  };

  const handleCreateMaterial = () => {
    if (!newMaterialName.trim()) {
      addNotification('Please enter a material name', 'error');
      return;
    }

    if (materials[newMaterialName]) {
      addNotification('Material name already exists', 'error');
      return;
    }

    const newMaterial: Material = {
      color: '#3b82f6',
      opacity: 1.0,
      metalness: 0.3,
      roughness: 0.4
    };

    addMaterial(newMaterialName, newMaterial);

    setEditingMaterial(newMaterial);
    setSelectedMaterial(newMaterialName);
    setNewMaterialName('');
    setActiveTab('editor');
    addNotification(`Created material: ${newMaterialName}`, 'success');
  };

  const handleSaveMaterial = () => {
    if (!editingMaterial || !selectedMaterial) return;

    updateMaterial(selectedMaterial, editingMaterial);
    addNotification(`Saved material: ${selectedMaterial}`, 'success');
  };

  const handleDeleteMaterial = (materialName: string) => {
    deleteMaterial(materialName);
    
    if (selectedMaterial === materialName) {
      setSelectedMaterial('default');
      setEditingMaterial(null);
    }
  };

  const handleEditMaterial = (materialName: string) => {
    setSelectedMaterial(materialName);
    setEditingMaterial({ ...materials[materialName] });
    setActiveTab('editor');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40"
        variant="outline"
      >
        <Palette className="h-4 w-4 mr-2" />
        Materials
      </Button>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Material Editor</h3>
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
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {/* Create new material */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Create Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Material name"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                />
                <Button onClick={handleCreateMaterial} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </CardContent>
            </Card>

            {/* Material library */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(materials).map(([name, material]) => (
                <MaterialPreview
                  key={name}
                  name={name}
                  material={material}
                  isSelected={selectedMaterial === name}
                  onClick={() => handleEditMaterial(name)}
                  onDelete={() => handleDeleteMaterial(name)}
                />
              ))}
            </div>

            {/* Apply to selected */}
            {selectedNodes.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Apply to {selectedNodes.length} selected node(s)
                  </p>
                  <Button 
                    onClick={() => handleApplyMaterial(selectedMaterial)}
                    className="w-full"
                    disabled={!selectedMaterial}
                  >
                    Apply {selectedMaterial}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            {editingMaterial ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Editing: {selectedMaterial}</h4>
                  <Badge variant="outline">{selectedMaterial}</Badge>
                </div>

                {/* Live preview */}
                <Card>
                  <CardContent className="p-4">
                    <div 
                      className="w-full h-16 rounded-lg border"
                      style={{
                        background: `linear-gradient(135deg, ${editingMaterial.color} 0%, ${editingMaterial.color}88 100%)`,
                        opacity: editingMaterial.opacity,
                        boxShadow: editingMaterial.metalness > 0.5 ? 'inset 0 2px 6px rgba(255,255,255,0.3)' : 'none'
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Color picker */}
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={editingMaterial.color}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      color: e.target.value
                    })}
                  />
                </div>

                {/* Opacity slider */}
                <div className="space-y-2">
                  <Label>Opacity: {Math.round(editingMaterial.opacity * 100)}%</Label>
                  <Slider
                    value={[editingMaterial.opacity]}
                    onValueChange={([value]) => setEditingMaterial({
                      ...editingMaterial,
                      opacity: value
                    })}
                    max={1}
                    min={0}
                    step={0.01}
                  />
                </div>

                {/* Metalness slider */}
                <div className="space-y-2">
                  <Label>Metalness: {Math.round(editingMaterial.metalness * 100)}%</Label>
                  <Slider
                    value={[editingMaterial.metalness]}
                    onValueChange={([value]) => setEditingMaterial({
                      ...editingMaterial,
                      metalness: value
                    })}
                    max={1}
                    min={0}
                    step={0.01}
                  />
                </div>

                {/* Roughness slider */}
                <div className="space-y-2">
                  <Label>Roughness: {Math.round(editingMaterial.roughness * 100)}%</Label>
                  <Slider
                    value={[editingMaterial.roughness]}
                    onValueChange={([value]) => setEditingMaterial({
                      ...editingMaterial,
                      roughness: value
                    })}
                    max={1}
                    min={0}
                    step={0.01}
                  />
                </div>

                {/* Save button */}
                <Button onClick={handleSaveMaterial} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Material
                </Button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Palette className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Select a material to edit</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}