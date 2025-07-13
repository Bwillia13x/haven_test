import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useCallback } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Node } from "./Node";
import { AdvancedNode } from "./AdvancedNode";
import { Connector } from "./Connector";
import { AdvancedConnector } from "./AdvancedConnector";
import { SurfaceGenerator } from "./SurfaceGenerator";
import { SubdivisionSurface } from "./SubdivisionSurface";
import { Grid } from "./Grid";
import { Toolbar } from "./UI/Toolbar";
import { PropertyPanel } from "./UI/PropertyPanel";
import { CommandInput } from "./UI/CommandInput";
import { NotificationSystem } from "./UI/NotificationSystem";
import { ContextMenu } from "./UI/ContextMenu";
import { MaterialEditor } from "./UI/MaterialEditor";
import { CameraControls } from "./UI/CameraControls";
import { AdvancedNodeOperations } from "./UI/AdvancedNodeOperations";
import { ShapePresets } from "./UI/ShapePresets";
import { NodePropertiesPanel } from "./UI/NodePropertiesPanel";
import { ConnectorPropertiesPanel } from "./UI/ConnectorPropertiesPanel";
import { SurfaceControls } from "./UI/SurfaceControls";
import { useAetherStore } from "../stores/useAetherStore";

function Scene() {
  const { nodes, connectors, surfaces, showGrid, clearSelection, setMultiSelect, migrateNode } = useAetherStore();

  const handleCanvasClick = useCallback((e: any) => {
    // Only clear selection if clicking empty space
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setMultiSelect(true);
    }
  }, [setMultiSelect]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      setMultiSelect(false);
    }
  }, [setMultiSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Grid */}
      {showGrid && <Grid />}

      {/* Nodes */}
      {nodes.map((node) => {
        const migratedNode = migrateNode(node);
        return (
          <AdvancedNode
            key={node.id}
            id={node.id}
            geometry={migratedNode.geometry}
            properties={migratedNode.properties}
            material={node.material}
          />
        );
      })}

      {/* Connectors */}
      {connectors.map((connector) => {
        // Use AdvancedConnector if it has type and properties, otherwise fallback to legacy Connector
        if (connector.type && connector.properties) {
          return (
            <AdvancedConnector
              key={connector.id}
              startNodeId={connector.startNodeId}
              endNodeId={connector.endNodeId}
              type={connector.type}
              properties={connector.properties}
              material={connector.material}
            />
          );
        } else {
          return (
            <Connector
              key={connector.id}
              startNodeId={connector.startNodeId}
              endNodeId={connector.endNodeId}
              material={connector.material}
              thickness={connector.thickness}
            />
          );
        }
      })}

      {/* Surfaces */}
      {surfaces.map((surface) => {
        if (surface.isSubdivision) {
          return (
            <SubdivisionSurface
              key={surface.id}
              nodeIds={surface.nodeIds}
              subdivisionType={surface.subdivisionType || 'catmull-clark'}
              iterations={surface.subdivisionIterations || 1}
              material={surface.material}
              opacity={surface.opacity}
              wireframe={surface.wireframe}
              showControlMesh={surface.showControlMesh || false}
            />
          );
        } else {
          return (
            <SurfaceGenerator
              key={surface.id}
              nodeIds={surface.nodeIds}
              surfaceType={surface.surfaceType}
              material={surface.material}
              opacity={surface.opacity}
              wireframe={surface.wireframe}
              doubleSided={surface.doubleSided}
            />
          );
        }
      })}

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        enableDamping={true}
      />

      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[10, 10, 10]}
        fov={45}
        near={0.1}
        far={1000}
      />
    </>
  );
}

export default function AetherWeaver() {
  const {
    undo,
    redo,
    exportProject,
    addNotification,
    selectedNodes,
    nodes,
    deleteNodes,
    duplicateNodes,
    selectAll,
    clearSelection,
    setConnectionMode,
    toggleMovementMode,
    hideContextMenu,
    addNode
  } = useAetherStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
              addNotification('Redo performed', 'success');
            } else {
              undo();
              addNotification('Undo performed', 'success');
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            addNotification('Redo performed', 'success');
            break;
          case 's':
            e.preventDefault();
            exportProject();
            break;
          case 'd':
            e.preventDefault();
            // Duplicate selected nodes
            if (selectedNodes.length > 0) {
              duplicateNodes(selectedNodes);
            }
            break;
          case 'a':
            e.preventDefault();
            // Select all nodes
            selectAll();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            if (selectedNodes.length > 0) {
              deleteNodes(selectedNodes);
              addNotification(`Deleted ${selectedNodes.length} node(s)`, 'success');
            }
            break;
          case 'Escape':
            e.preventDefault();
            clearSelection();
            setConnectionMode(false);
            hideContextMenu();
            break;
          case 'm':
          case 'M':
            e.preventDefault();
            toggleMovementMode();
            addNotification('Movement mode toggled', 'info');
            break;
          case 'f':
            e.preventDefault();
            // Focus on selected nodes (if any) or frame all
            if (selectedNodes.length > 0) {
              // This will be handled by the CameraControls component via custom event
              window.dispatchEvent(new CustomEvent('camera-focus-selected'));
            } else {
              window.dispatchEvent(new CustomEvent('camera-frame-all'));
            }
            break;
          case 'h':
            e.preventDefault();
            // Home view
            window.dispatchEvent(new CustomEvent('camera-home-view'));
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, exportProject, addNotification, selectedNodes, nodes, deleteNodes, addNode, duplicateNodes, selectAll, clearSelection, setConnectionMode, toggleMovementMode, hideContextMenu]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <Canvas
        shadows
        className="w-full h-full"
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <Toolbar />
      <PropertyPanel />
      <ShapePresets />
      <NodePropertiesPanel />
      <ConnectorPropertiesPanel />
      <SurfaceControls />
      <CommandInput />
      <NotificationSystem />
      <ContextMenu />
      <MaterialEditor />
      <CameraControls />
      <AdvancedNodeOperations />
    </div>
  );
}
