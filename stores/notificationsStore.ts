import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Notification, NotificationPreferences } from '@/types/appTypes';

const NOTIFICATIONS_STORAGE_KEY = '@notifications_storage';
const PREFERENCES_STORAGE_KEY = '@notification_preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  order_updates: true,
  promotions: true,
  price_alerts: true,
  rewards: true,
  general: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

interface NotificationsState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  isLoading: boolean;

  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;
  shouldSendNotification: (type: Notification['type']) => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  preferences: DEFAULT_PREFERENCES,
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;
        set({ notifications, unreadCount, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      set({ isLoading: false });
    }
  },

  loadPreferences: async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        set({ preferences });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  },

  addNotification: async (notificationData) => {
    const { notifications, shouldSendNotification } = get();

    if (!shouldSendNotification(notificationData.type)) {
      return;
    }

    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    const updated = [newNotification, ...notifications];
    const unreadCount = updated.filter((n) => !n.is_read).length;
    set({ notifications: updated, unreadCount });

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  },

  markAsRead: async (notificationId) => {
    const { notifications } = get();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    const unreadCount = updated.filter((n) => !n.is_read).length;
    set({ notifications: updated, unreadCount });

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    set({ notifications: updated, unreadCount: 0 });

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  deleteNotification: async (notificationId) => {
    const { notifications } = get();
    const updated = notifications.filter((n) => n.id !== notificationId);
    const unreadCount = updated.filter((n) => !n.is_read).length;
    set({ notifications: updated, unreadCount });

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  clearAllNotifications: async () => {
    set({ notifications: [], unreadCount: 0 });
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  updatePreferences: async (newPreferences) => {
    const { preferences } = get();
    const updated = { ...preferences, ...newPreferences };
    set({ preferences: updated });

    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  shouldSendNotification: (type) => {
    const { preferences } = get();
    const typeMap: Record<Notification['type'], keyof NotificationPreferences> = {
      order: 'order_updates',
      promo: 'promotions',
      price_alert: 'price_alerts',
      reward: 'rewards',
      general: 'general',
    };

    const prefKey = typeMap[type];
    if (!preferences[prefKey]) {
      return false;
    }

    if (preferences.quiet_hours_enabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = preferences.quiet_hours_start.split(':').map(Number);
      const [endHour, endMinute] = preferences.quiet_hours_end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (startTime < endTime) {
        if (currentTime >= startTime && currentTime < endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime || currentTime < endTime) {
          return false;
        }
      }
    }

    return true;
  },
}));
