import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function CommandInput() {
  const [command, setCommand] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { addNotification } = useAetherStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // For now, just show a notification
    addNotification(`Command received: ${command}`, 'info');
    setCommand("");
    setIsVisible(false);
  };

  // Show/hide with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isVisible) {
        e.preventDefault();
        setIsVisible(true);
      } else if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        setCommand("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
          Press "/" to open command input
        </div>
      </div>
    );
  }

  return (
    <Card className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800/90 backdrop-blur-sm border-gray-700 z-50">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command (e.g., 'create 5 nodes in a circle')"
            className="bg-gray-700 border-gray-600 text-white flex-1"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={!command.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Press Escape to close
        </div>
      </form>
    </Card>
  );
}
