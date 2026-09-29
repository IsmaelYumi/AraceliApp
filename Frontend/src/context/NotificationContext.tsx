import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<NotificationItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newNotification: NotificationItem = { id, type, title, message, duration };

      setNotifications((prev) => [...prev, newNotification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  const success = useCallback(
    (title: string, message?: string) => showNotification({ type: 'success', title, message }),
    [showNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => showNotification({ type: 'error', title, message }),
    [showNotification]
  );

  const info = useCallback(
    (title: string, message?: string) => showNotification({ type: 'info', title, message }),
    [showNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => showNotification({ type: 'warning', title, message }),
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        success,
        error,
        info,
        warning,
        removeNotification,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400" />,
            info: <Info className="w-5 h-5 text-brand-400" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          };

          const borders = {
            success: 'border-emerald-500/30 bg-slate-900/95',
            error: 'border-rose-500/30 bg-slate-900/95',
            info: 'border-brand-500/30 bg-slate-900/95',
            warning: 'border-amber-500/30 bg-slate-900/95',
          };

          return (
            <div
              key={n.id}
              role="alert"
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom duration-200 ${borders[n.type]}`}
            >
              <div className="shrink-0 mt-0.5">{icons[n.type]}</div>
              <div className="flex-1">
                <h5 className="text-xs font-semibold text-slate-100">{n.title}</h5>
                {n.message && <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>}
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
