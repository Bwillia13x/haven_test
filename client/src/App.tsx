import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import AetherWeaver from "./components/AetherWeaver";
import "@fontsource/inter";
import "./index.css";

function App() {
  return (
    <div className="w-full h-screen bg-gray-900 overflow-hidden">
      <AetherWeaver />
    </div>
  );
}

export default App;
