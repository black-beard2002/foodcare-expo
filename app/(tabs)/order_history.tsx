import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '@/stores/orderStore';
import {
  CheckCircle,
  Clock,
  User,
  Phone,
  MessageSquare,
  Trash2,
  Package,
  CircleSlash2,
  CalendarClock,
  Search,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { CartItem, Order } from '@/types/appTypes';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';
import OrderCancelModal from '@/components/OrderCancelModal';
import { formatDateTime } from '@/utils/formatters';

export default function OrderHistoryScreen() {
  const { theme } = useTheme();
  const [confirmCancelModal, setConfirmCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>();
  const { orders, removeOrder, clearOrders, isLoading, fetchOrders } =
    useOrderStore();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchOrders();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'completed' | 'cancelled'
  >('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  function handleOrderRemove(order_id: string) {
    removeOrder(order_id);
    showAlert('Removed', `Order ${order_id} removed from history`, 'info');
  }

  function handleOrderCancel() {
    setConfirmCancelModal(false);
    setSelectedOrder(null);
    showAlert(
      'Cancelled',
      `Order ${selectedOrder?.id} cancelled successfully`,
      'warning'
    );
  }

  function handleConfirmCancel() {
    setConfirmCancelModal(false);
    setSelectedOrder(null);
  }

  const renderOrder = ({ item: order }: { item: Order }) => (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        shadows.md,
      ]}
    >
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <View
            style={[styles.iconBadge, { backgroundColor: theme.successLight }]}
          >
            <CheckCircle color={theme.success} size={20} />
          </View>
          <View style={styles.orderHeaderText}>
            <Text style={[styles.orderIdLabel, { color: theme.textSecondary }]}>
              Order ID
            </Text>
            <Text style={[styles.orderId, { color: theme.text }]}>
              #{order.id}
            </Text>
          </View>
        </View>
        <View style={[{ gap: 6 }]}>
          <TouchableOpacity
            onPress={() => {
              handleOrderRemove(order.id);
            }}
            style={[styles.removeButton, { backgroundColor: theme.errorLight }]}
          >
            <Trash2 color={theme.error} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedOrder(order);
              setConfirmCancelModal(true);
            }}
            style={[
              styles.removeButton,
              { backgroundColor: theme.warningLight },
            ]}
          >
            <CircleSlash2 color={theme.warning} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Info Section */}
      <View style={[styles.section, { borderTopColor: theme.borderLight }]}>
        <View style={styles.infoRow}>
          <View
            style={[styles.infoIcon, { backgroundColor: theme.primaryLight }]}
          >
            <User color={theme.primaryDark} size={16} />
          </View>
          <Text style={[styles.infoText, { color: theme.text }]}>
            {order.customerName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View
            style={[styles.infoIcon, { backgroundColor: theme.primaryLight }]}
          >
            <Phone color={theme.primaryDark} size={16} />
          </View>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {order.customerPhone}
          </Text>
        </View>

        {order.pickupTime && (
          <View style={styles.infoRow}>
            <View
              style={[styles.infoIcon, { backgroundColor: theme.infoLight }]}
            >
              <Clock color={theme.info} size={16} />
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {order.pickupTime}
            </Text>
          </View>
        )}

        {order.specialInstructions && (
          <View style={[styles.infoRow, styles.specialInstructionsRow]}>
            <View
              style={[styles.infoIcon, { backgroundColor: theme.warningLight }]}
            >
              <MessageSquare color={theme.warning} size={16} />
            </View>
            <Text
              style={[
                styles.specialInstructionsText,
                { color: theme.textSecondary },
              ]}
              numberOfLines={2}
            >
              {order.specialInstructions}
            </Text>
          </View>
        )}
      </View>

      {/* Offers Section */}
      <View style={[styles.section, { borderTopColor: theme.borderLight }]}>
        <View style={styles.sectionHeader}>
          <Package color={theme.primary} size={18} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Order Items
          </Text>
          <View
            style={[styles.itemBadge, { backgroundColor: theme.primaryLight }]}
          >
            <Text style={[styles.itemBadgeText, { color: theme.primaryDark }]}>
              {order.offers.length}
            </Text>
          </View>
        </View>
        <View style={[{ gap: 5 }]}>
          {order.offers.map((item: CartItem) => (
            <View
              key={item.id}
              style={[styles.offerItem, { borderColor: theme.border }]}
            >
              <View style={styles.offerInfo}>
                <Text
                  style={[styles.offerTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.offer.title}
                </Text>
                <Text
                  style={[styles.offerQuantity, { color: theme.textTertiary }]}
                >
                  Qty: {item.quantity || 1}
                </Text>
              </View>
              <View
                style={[
                  styles.priceTag,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text style={[styles.offerPrice, { color: theme.primaryDark }]}>
                  ${item.offer.discounted_price.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[{ flexDirection: 'row', gap: 5 }]}>
        <View
          style={[
            styles.section,
            {
              borderTopColor: theme.borderLight,
              flex: 0.5,
            },
          ]}
        >
          <View style={[styles.sectionHeader, { flexDirection: 'column' }]}>
            <CalendarClock color={theme.primaryDark} size={18} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Ordered At
            </Text>
            <View
              style={[
                styles.itemBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Text style={[styles.itemBadgeText, { color: theme.text }]}>
                {formatDateTime(order.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.section,
            { borderTopColor: theme.borderLight, flex: 0.5 },
          ]}
        >
          <View style={[styles.sectionHeader, { flexDirection: 'column' }]}>
            <CalendarClock color={theme.primary} size={18} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Status
            </Text>
            <View
              style={[
                styles.itemBadge,
                { width: '100%', height: 40 },
                order.status === 'pending' || order.status === 'cancelled'
                  ? { backgroundColor: theme.warning }
                  : { backgroundColor: theme.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.itemBadgeText,
                  { color: theme.text, textAlignVertical: 'center' },
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Total Section */}
      <View
        style={[
          styles.totalSection,
          { backgroundColor: theme.primaryLight + '10' },
        ]}
      >
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Total Amount
          </Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Order History
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {filteredOrders.length}{' '}
            {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </Text>
        </View>
        {orders.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              clearOrders();
              showAlert('Cleared', 'All orders have been cleared', 'success');
            }}
            style={[styles.clearButton, { backgroundColor: theme.errorLight }]}
          >
            <Trash2 color={theme.error} size={18} />
            <Text style={[styles.clearText, { color: theme.error }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔍 Search + Filter Section */}
      <View style={styles.searchFilterContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Search color={theme.textSecondary} size={18} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by ID or customer name..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterRow}>
          {['all', 'pending', 'completed', 'cancelled'].map((status, index) => (
            <TouchableOpacity
              key={status + index}
              onPress={() =>
                setStatusFilter(
                  status as 'all' | 'pending' | 'completed' | 'cancelled'
                )
              }
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    statusFilter === status
                      ? theme.primaryLight
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Package color={theme.textTertiary} size={48} />
          </View>
          {isLoading ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Loading orders...
            </Text>
          ) : (
            <>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No orders found
              </Text>
              <Text
                style={[styles.emptySubtext, { color: theme.textSecondary }]}
              >
                Try adjusting your search or filter
              </Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      {confirmCancelModal && (
        <OrderCancelModal
          visible={confirmCancelModal}
          onConfirm={handleOrderCancel}
          onCancel={handleConfirmCancel}
          orderNumber={selectedOrder?.id ?? ''}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: fontSize.sm, fontFamily: 'Inter-Regular' },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  clearText: { fontSize: fontSize.sm, fontFamily: 'Inter-SemiBold' },

  // 🔍 Search + Filter
  searchFilterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  filterText: { fontSize: fontSize.sm, fontFamily: 'Inter-SemiBold' },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
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
  emptyText: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  orderCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderHeaderText: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  orderId: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  specialInstructionsRow: {
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  specialInstructionsText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  itemBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  itemBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  offerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderStyle: 'dashed',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  offerInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  offerTitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  offerQuantity: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
  },
  priceTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  offerPrice: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Bold',
  },
  totalSection: {
    padding: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Medium',
  },
  totalAmount: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Inter-Bold',
  },
});
