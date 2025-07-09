import React, { useState, useCallback } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Terminal } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function CommandInput() {
  const [command, setCommand] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { executeCommand } = useAetherStore();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommand(command.trim());
      setCommand("");
    }
  }, [command, executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      setCommand("");
    }
  }, []);

  // Global keyboard shortcut to open command input
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsVisible(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <div className="absolute bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-gray-800/90 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-700"
        >
          <Terminal className="w-4 h-4 mr-2" />
          AI Commands (`)
        </Button>
      </div>
    );
  }

  return (
    <Card className="absolute bottom-4 left-4 right-4 bg-gray-800/95 backdrop-blur-sm border-gray-700">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter AI command (e.g., 'create cube size 3', 'create spiral turns 5 radius 3 height 6')"
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={!command.trim()}>
            Execute
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Try: create cube size 3 | create sphere radius 2 segments 20 | create spiral turns 5 radius 3 height 6 | clear
        </div>
      </form>
    </Card>
  );
}
