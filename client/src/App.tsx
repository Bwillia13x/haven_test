import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import AetherWeaver from "./components/AetherWeaver";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/Auth/AuthPage";
import { ThemeProvider } from "./hooks/useTheme";
import { LayoutManager, PanelConfig } from "./components/layout/LayoutManager";
import { OutlinerPanel } from "./components/UI/OutlinerPanel";
import { PBRMaterialEditor } from "./components/materials/PBRMaterialEditor";
import { LightingSystem } from "./components/lighting/LightingSystem";
import { SelectionTools } from "./components/selection/SelectionTools";
import { PropertyPanel } from "./components/UI/PropertyPanel";
import { Toolbar } from "./components/UI/Toolbar";
import {
  Layers,
  Palette,
  Sun,
  MousePointer2,
  Settings,
  Wrench
} from "lucide-react";
import "@fontsource/inter";
import "./index.css";

// Panel configurations for the layout manager
const panelConfigs: PanelConfig[] = [
  {
    id: 'outliner',
    title: 'Outliner',
    component: OutlinerPanel,
    icon: Layers,
    position: 'left',
    defaultSize: 20,
    minSize: 15,
    maxSize: 40
  },
  {
    id: 'properties',
    title: 'Properties',
    component: PropertyPanel,
    icon: Settings,
    position: 'right',
    defaultSize: 25,
    minSize: 20,
    maxSize: 40
  },
  {
    id: 'materials',
    title: 'Materials',
    component: () => <PBRMaterialEditor selectedNodeIds={[]} onMaterialChange={() => {}} />,
    icon: Palette,
    position: 'right',
    defaultSize: 25,
    minSize: 20,
    maxSize: 40
  },
  {
    id: 'lighting',
    title: 'Lighting',
    component: LightingSystem,
    icon: Sun,
    position: 'right',
    defaultSize: 25,
    minSize: 20,
    maxSize: 40
  },
  {
    id: 'selection',
    title: 'Selection',
    component: () => <SelectionTools mode="pointer" onModeChange={() => {}} />,
    icon: MousePointer2,
    position: 'left',
    defaultSize: 20,
    minSize: 15,
    maxSize: 30
  },
  {
    id: 'tools',
    title: 'Tools',
    component: Toolbar,
    icon: Wrench,
    position: 'bottom',
    defaultSize: 30,
    minSize: 20,
    maxSize: 50
  }
];

function AppContent() {
  // Authentication disabled for direct testing
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="w-full h-screen bg-background flex items-center justify-center">
  //       <div className="text-on-surface text-xl animate-fade-in">Loading...</div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <AuthPage />;
  // }

  return (
    <div className="w-full h-screen overflow-hidden">
      <LayoutManager panels={panelConfigs}>
        <AetherWeaver />
      </LayoutManager>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
