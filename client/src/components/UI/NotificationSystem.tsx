import { useEffect } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useAetherStore } from "../../stores/useAetherStore";

export function NotificationSystem() {
  const { notifications, removeNotification } = useAetherStore();

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    notifications.forEach(notification => {
      if (notification.autoRemove !== false) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, 5000);
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notification) => {
        const Icon = notification.type === 'success' ? CheckCircle :
                   notification.type === 'error' ? AlertCircle :
                   notification.type === 'warning' ? AlertCircle : Info;
        
        const bgColor = notification.type === 'success' ? 'bg-green-800/90' :
                       notification.type === 'error' ? 'bg-red-800/90' :
                       notification.type === 'warning' ? 'bg-yellow-800/90' : 'bg-blue-800/90';
        
        const iconColor = notification.type === 'success' ? 'text-green-400' :
                         notification.type === 'error' ? 'text-red-400' :
                         notification.type === 'warning' ? 'text-yellow-400' : 'text-blue-400';

        return (
          <Alert 
            key={notification.id} 
            className={`${bgColor} backdrop-blur-sm border-gray-600 text-white relative`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <AlertDescription className="pr-6">
              {notification.message}
            </AlertDescription>
            <button
              onClick={() => removeNotification(notification.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </Alert>
        );
      })}
    </div>
  );
}
