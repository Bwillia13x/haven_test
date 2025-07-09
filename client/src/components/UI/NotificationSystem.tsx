import { useEffect } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function NotificationSystem() {
  const { notifications, removeNotification } = useAetherStore();

  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 space-y-2 z-50">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="p-3 bg-gray-800/95 backdrop-blur-sm border-gray-700 max-w-sm animate-in slide-in-from-right"
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
            {notification.type === 'error' && (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            {notification.type === 'warning' && (
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            )}
            {notification.type === 'info' && (
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
            
            <span className="text-sm text-white flex-1">
              {notification.message}
            </span>
            
            <Badge 
              variant="secondary" 
              className={`text-xs px-2 py-0.5 ${
                notification.type === 'success' ? 'bg-green-600' :
                notification.type === 'error' ? 'bg-red-600' :
                notification.type === 'warning' ? 'bg-yellow-600' :
                'bg-blue-600'
              }`}
            >
              {notification.type}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
