import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import AetherWeaver from "./components/AetherWeaver";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/Auth/AuthPage";
import "@fontsource/inter";
import "./index.css";

function AppContent() {
  // Authentication disabled for direct testing
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
  //       <div className="text-white text-xl">Loading...</div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <AuthPage />;
  // }

  return (
    <div className="w-full h-screen bg-gray-900 overflow-hidden">
      <AetherWeaver />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
