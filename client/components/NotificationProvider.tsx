import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationAlert, { NotificationType } from './NotificationAlert';

interface NotificationContent {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((type: NotificationType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Portal destination for notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center pointer-events-none w-full px-4">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <NotificationAlert
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              message={n.message}
              onClose={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
