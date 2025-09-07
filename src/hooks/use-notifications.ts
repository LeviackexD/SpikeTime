
'use client';

import * as React from 'react';
import { useToast } from './use-toast';

export function useNotifications() {
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const { toast } = useToast();

  React.useEffect(() => {
    // Set initial permission state, as Notification.permission is synchronous
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = React.useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermission('granted');
        return;
      }
      if (Notification.permission !== 'denied') {
        const status = await Notification.requestPermission();
        setPermission(status);
        if (status === 'denied') {
            toast({
                title: "Notifications Denied",
                description: "You have disabled notifications. You can enable them in your browser settings.",
                variant: "destructive"
            });
        }
      }
    }
  }, [toast]);

  const showNotification = React.useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      const notification = new Notification(title, options);
      return notification;
    }
    return null;
  }, [permission]);
  
  return {
    isPermissionGranted: permission === 'granted',
    requestPermission,
    showNotification,
  };
}
