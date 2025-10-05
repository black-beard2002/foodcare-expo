import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Package,
  Tag,
  TrendingUp,
  Clock,
  Check,
  Trash2,
  Settings,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'reminder' | 'update';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      message:
        'Your order #12345 has been delivered successfully. Enjoy your meal!',
      time: '5 min ago',
      isRead: false,
      icon: Package,
      iconColor: theme.success,
      iconBg: theme.successLight,
    },
    {
      id: '2',
      type: 'promotion',
      title: '50% OFF Weekend Special',
      message:
        'Get 50% off on all pizza orders this weekend. Limited time offer!',
      time: '1 hour ago',
      isRead: false,
      icon: Tag,
      iconColor: theme.primary,
      iconBg: theme.primaryLight + '30',
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #12344 has been confirmed and is being prepared.',
      time: '2 hours ago',
      isRead: true,
      icon: Package,
      iconColor: theme.info,
      iconBg: theme.infoLight,
    },
    {
      id: '4',
      type: 'promotion',
      title: 'New Restaurant Alert',
      message:
        'Taste of Italy just joined! Check out their amazing pasta dishes.',
      time: '5 hours ago',
      isRead: true,
      icon: TrendingUp,
      iconColor: theme.warning,
      iconBg: theme.warningLight,
    },
    {
      id: '5',
      type: 'reminder',
      title: 'Your Favorite is Available',
      message:
        'The Signature Burger you loved is back on the menu at Burger Palace.',
      time: '1 day ago',
      isRead: true,
      icon: Bell,
      iconColor: theme.primary,
      iconBg: theme.primaryLight + '30',
    },
    {
      id: '6',
      type: 'update',
      title: 'Delivery Time Updated',
      message:
        'Your order #12343 will arrive 10 minutes earlier than expected.',
      time: '2 days ago',
      isRead: true,
      icon: Clock,
      iconColor: theme.info,
      iconBg: theme.infoLight,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.isRead ? theme.card : theme.highlight,
            borderColor: item.isRead ? theme.border : theme.primary,
          },
        ]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
          <IconComponent color={item.iconColor} size={20} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[styles.notificationTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && (
              <View
                style={[styles.unreadBadge, { backgroundColor: theme.primary }]}
              />
            )}
          </View>
          <Text
            style={[styles.notificationMessage, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text
            style={[styles.notificationTime, { color: theme.textTertiary }]}
          >
            {item.time}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 color={theme.textTertiary} size={18} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text
                style={[styles.headerSubtitle, { color: theme.textSecondary }]}
              >
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => {
            // Handle notification settings
            router.push('/(tabs)/settings');
          }}
        >
          <Settings color={theme.text} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'all' && { backgroundColor: theme.primary },
              filter !== 'all' && {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === 'all' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'unread' && { backgroundColor: theme.primary },
              filter !== 'unread' && {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'unread' ? '#FFFFFF' : theme.textSecondary,
                },
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Actions */}
      {notifications.length > 0 && (
        <View style={styles.actionsContainer}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primaryLight + '20' },
              ]}
              onPress={markAllAsRead}
            >
              <Check color={theme.primary} size={16} />
              <Text style={[styles.actionText, { color: theme.text }]}>
                Mark all as read
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.errorLight }]}
            onPress={clearAll}
          >
            <Trash2 color={theme.error} size={16} />
            <Text style={[styles.actionText, { color: theme.error }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Bell color={theme.textTertiary} size={48} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {filter === 'unread'
              ? "You've read all your notifications"
              : 'Your notifications will appear here'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterContainer: {
    paddingVertical: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  notificationTime: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
