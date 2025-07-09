import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useCallback } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Node } from "./Node";
import { Connector } from "./Connector";
import { Grid } from "./Grid";
import { Toolbar } from "./UI/Toolbar";
import { PropertyPanel } from "./UI/PropertyPanel";
import { CommandInput } from "./UI/CommandInput";
import { NotificationSystem } from "./UI/NotificationSystem";
import { ContextMenu } from "./UI/ContextMenu";
import { useAetherStore } from "../stores/useAetherStore";

function Scene() {
  const { nodes, connectors, showGrid, selectedNodes, selectNode, clearSelection, setMultiSelect } = useAetherStore();

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
      {nodes.map((node) => (
        <Node
          key={node.id}
          id={node.id}
          position={node.position}
          material={node.material}
          scale={node.scale || 1}
        />
      ))}

      {/* Connectors */}
      {connectors.map((connector) => (
        <Connector
          key={connector.id}
          startNodeId={connector.startNodeId}
          endNodeId={connector.endNodeId}
          material={connector.material}
          thickness={connector.thickness}
        />
      ))}

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
  const { undo, redo, exportProject, addNotification } = useAetherStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, exportProject, addNotification]);

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
      <CommandInput />
      <NotificationSystem />
      <ContextMenu />
    </div>
  );
}
