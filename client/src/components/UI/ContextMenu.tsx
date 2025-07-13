import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useAetherStore } from "../../stores/useAetherStore";

export function ContextMenu() {
  const { contextMenu, hideContextMenu } = useAetherStore();

  if (!contextMenu?.visible) return null;

  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={hideContextMenu}
      />
      
      {/* Context menu */}
      <Card 
        className="fixed bg-gray-800/95 backdrop-blur-sm border-gray-600 p-1 z-50 min-w-48"
        style={{
          left: contextMenu.position.x,
          top: contextMenu.position.y,
        }}
      >
        <div className="space-y-1">
          {contextMenu.items.map((item, index) => {
            if (item.type === 'separator') {
              return <Separator key={index} className="my-1 bg-gray-600" />;
            }

            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-white hover:bg-gray-700 disabled:opacity-50"
                disabled={item.disabled}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  }
                  hideContextMenu();
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="text-sm">{item.icon()}</span>}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-xs text-gray-400">{item.shortcut}</span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </Card>
    </>
  );
}
