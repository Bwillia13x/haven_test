import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Terminal, ChevronDown } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

// Quick command definitions
const QUICK_COMMANDS = [
  { label: "Create Single Node", command: "create node at 0,0,0", description: "Add a single node at origin" },
  { label: "Create Small Cube", command: "create cube size 3", description: "3x3x3 cube structure" },
  { label: "Create Large Cube", command: "create cube size 5", description: "5x5x5 cube structure" },
  { label: "Create Sphere (20 nodes)", command: "create sphere radius 3 segments 20", description: "Sphere with 20 nodes" },
  { label: "Create Sphere (50 nodes)", command: "create sphere radius 4 segments 50", description: "Sphere with 50 nodes" },
  { label: "Create Simple Spiral", command: "create spiral turns 3 radius 2 height 4", description: "Simple spiral structure" },
  { label: "Create Complex Spiral", command: "create spiral turns 8 radius 3 height 6", description: "Complex spiral structure" },
  { label: "Connect All (distance 2)", command: "connect all distance 2", description: "Connect nodes within distance 2" },
  { label: "Connect All (distance 3)", command: "connect all distance 3", description: "Connect nodes within distance 3" },
  { label: "Select All Nodes", command: "select all", description: "Select all nodes in scene" },
  { label: "Delete Selected", command: "delete selected", description: "Remove selected nodes" },
  { label: "Clear Scene", command: "clear", description: "Remove all nodes and connections" }
];

export function CommandInput() {
  const [command, setCommand] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { executeCommand } = useAetherStore();

  const filteredCommands = QUICK_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(command.toLowerCase()) ||
    cmd.command.toLowerCase().includes(command.toLowerCase())
  );

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommand(command.trim());
      setCommand("");
      setShowDropdown(false);
      setSelectedIndex(0);
    }
  }, [command, executeCommand]);

  const handleCommandChange = useCallback((value: string) => {
    setCommand(value);
    setShowDropdown(value === "/" || value.startsWith("/"));
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      setCommand("");
      setShowDropdown(false);
      setSelectedIndex(0);
      return;
    }

    if (showDropdown && filteredCommands.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selectedCommand = filteredCommands[selectedIndex];
          if (selectedCommand) {
            executeCommand(selectedCommand.command);
            setCommand("");
            setShowDropdown(false);
            setSelectedIndex(0);
          }
          break;
        case 'Tab':
          e.preventDefault();
          const currentCommand = filteredCommands[selectedIndex];
          if (currentCommand) {
            setCommand(currentCommand.command);
            setShowDropdown(false);
            setSelectedIndex(0);
          }
          break;
      }
    }
  }, [showDropdown, filteredCommands, selectedIndex, executeCommand]);

  const selectCommand = useCallback((cmd: typeof QUICK_COMMANDS[0]) => {
    setCommand(cmd.command);
    setShowDropdown(false);
    setSelectedIndex(0);
    inputRef.current?.focus();
  }, []);

  const executeQuickCommand = useCallback((cmd: typeof QUICK_COMMANDS[0]) => {
    executeCommand(cmd.command);
    setCommand("");
    setShowDropdown(false);
    setSelectedIndex(0);
  }, [executeCommand]);

  // Global keyboard shortcut to open command input
  useEffect(() => {
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
    <div className="absolute bottom-4 left-4 right-4">
      {/* Dropdown Menu */}
      {showDropdown && (
        <Card className="mb-2 bg-gray-800/95 backdrop-blur-sm border-gray-700 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2 px-2">
              Quick Commands (Use ↑↓ to navigate, Enter to execute, Tab to select)
            </div>
            {filteredCommands.map((cmd, index) => (
              <div
                key={index}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => executeQuickCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{cmd.label}</div>
                    <div className="text-xs text-gray-400">{cmd.description}</div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {cmd.command}
                  </div>
                </div>
              </div>
            ))}
            {filteredCommands.length === 0 && (
              <div className="p-2 text-gray-400 text-sm">
                No matching commands found
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Command Input */}
      <Card className="bg-gray-800/95 backdrop-blur-sm border-gray-700">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => handleCommandChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type '/' for quick commands or enter AI command directly"
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
            Type "/" to see quick commands | Try: create cube size 3 | create spiral turns 5 radius 3 height 6 | clear
          </div>
        </form>
      </Card>
    </div>
  );
}
