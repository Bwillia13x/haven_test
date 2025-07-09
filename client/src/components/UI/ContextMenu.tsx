import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useAetherStore } from "../../stores/useAetherStore";

export function ContextMenu() {
  const { contextMenu, hideContextMenu } = useAetherStore();

  if (!contextMenu) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={hideContextMenu}
      />
      
      {/* Context Menu */}
      <Card 
        className="fixed z-50 bg-gray-800/95 backdrop-blur-sm border-gray-700 p-1 min-w-48"
        style={{
          left: contextMenu.position.x,
          top: contextMenu.position.y,
        }}
      >
        {contextMenu.items.map((item, index) => (
          <div key={index}>
            {item.type === 'separator' ? (
              <Separator className="my-1 bg-gray-600" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white hover:bg-gray-700 h-8"
                onClick={() => {
                  item.action?.();
                  hideContextMenu();
                }}
                disabled={item.disabled}
              >
                {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                {item.label}
                {item.shortcut && (
                  <span className="ml-auto text-xs text-gray-400">
                    {item.shortcut}
                  </span>
                )}
              </Button>
            )}
          </div>
        ))}
      </Card>
    </>
  );
}
