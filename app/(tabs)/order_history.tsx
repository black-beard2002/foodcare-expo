import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
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
import OrderCancelModal from '@/components/OrderCancelModal';
import { formatDateTime } from '@/utils/formatters';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

export default function OrderHistoryScreen() {
  const { theme, isDark } = useTheme();
  const [confirmCancelModal, setConfirmCancelModal] = useState(false);
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const colorMode = isDark ? 'dark' : 'light';
  const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>();
  const { orders, removeOrder, clearOrders, fetchOrders, isLoading } =
    useOrderStore();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchOrders();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'completed' | 'cancelled'
  >('all');

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

  const HeroSkeleton = () => (
    <MotiView className="px-6 mb-6 items-center md:px-8">
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={200}
        width={HERO_CARD_WIDTH}
      />
      <View className="h-10 my-5" />
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={200}
        width={HERO_CARD_WIDTH}
      />
    </MotiView>
  );

  const renderOrder = (order: Order) => (
    <View
      className="rounded-2xl border bg-card p-4 shadow-sm mb-4 md:p-6 lg:mb-6"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      {/* Order Header - Compact */}
      <View className="flex-row justify-between items-start mb-3 md:mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="w-8 h-8 rounded-full items-center justify-center md:w-10 md:h-10"
            style={{ backgroundColor: theme.successLight }}
          >
            <CheckCircle
              color={theme.success}
              size={16}
              className="md:w-5 md:h-5"
            />
          </View>
          <View>
            <Text
              className="text-xs font-inter-medium opacity-60 md:text-sm"
              style={{ color: theme.textSecondary }}
            >
              Order #{order.id}
            </Text>
            <Text
              className="text-sm font-inter-semibold mt-0.5 md:text-base"
              style={{ color: theme.text }}
            >
              {order.customerName}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleOrderRemove(order.id)}
            className="w-8 h-8 rounded-lg items-center justify-center md:w-9 md:h-9"
            style={{ backgroundColor: theme.errorLight }}
          >
            <Trash2 color={theme.error} size={14} className="md:w-4 md:h-4" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedOrder(order);
              setConfirmCancelModal(true);
            }}
            className="w-8 h-8 rounded-lg items-center justify-center md:w-9 md:h-9"
            style={{ backgroundColor: theme.warningLight }}
          >
            <CircleSlash2
              color={theme.warning}
              size={14}
              className="md:w-4 md:h-4"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Compact Info Grid */}
      <View className="flex-row flex-wrap gap-2 mb-3 md:gap-3 md:mb-4">
        <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 md:px-3 md:py-1.5">
          <Phone
            color={theme.primary}
            size={12}
            className="md:w-3.5 md:h-3.5"
          />
          <Text
            className="text-xs font-inter-medium md:text-sm"
            style={{ color: theme.textSecondary }}
          >
            {order.customerPhone}
          </Text>
        </View>

        {order.pickupTime && (
          <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-lg bg-info/10 md:px-3 md:py-1.5">
            <Clock color={theme.info} size={12} className="md:w-3.5 md:h-3.5" />
            <Text
              className="text-xs font-inter-medium md:text-sm"
              style={{ color: theme.textSecondary }}
            >
              {order.pickupTime}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 md:px-3 md:py-1.5">
          <CalendarClock
            color={theme.primary}
            size={12}
            className="md:w-3.5 md:h-3.5"
          />
          <Text
            className="text-xs font-inter-medium md:text-sm"
            style={{ color: theme.textSecondary }}
          >
            {formatDateTime(order.createdAt)}
          </Text>
        </View>
      </View>

      {/* Status Badge */}
      <View className="mb-3 md:mb-4">
        <View
          className="w-full py-2 rounded-xl items-center justify-center md:py-3"
          style={{
            backgroundColor:
              order.status === 'pending' || order.status === 'cancelled'
                ? theme.warning + '20'
                : theme.success,
          }}
        >
          <Text
            className="text-sm font-semibold capitalize md:text-sm"
            style={{
              color: theme.text,
            }}
          >
            {order.status}
          </Text>
        </View>
      </View>

      {/* Order Items - Compact */}
      <View className="mb-3 md:mb-4">
        <View className="flex-row items-center gap-2 mb-2 md:mb-3">
          <Package color={theme.primary} size={16} className="md:w-5 md:h-5" />
          <Text
            className="text-sm font-inter-semibold flex-1 md:text-base"
            style={{ color: theme.text }}
          >
            Items ({order.offers.length})
          </Text>
        </View>

        <View className="gap-1.5 md:gap-2">
          {order.offers.slice(0, 3).map((item: CartItem) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center py-1.5 px-2 rounded-lg border md:py-2 md:px-3"
              style={{ borderColor: theme.border }}
            >
              <View className="flex-1">
                <Text
                  className="text-xs font-inter-medium mb-0.5 md:text-sm"
                  style={{ color: theme.text }}
                  numberOfLines={1}
                >
                  {item.offer.title}
                </Text>
                <Text
                  className="text-xs font-inter-regular md:text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  Qty: {item.quantity || 1} • $
                  {item.offer.discounted_price.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {order.offers.length > 3 && (
            <View className="py-1.5 px-2 rounded-lg bg-primary/5 md:py-2 md:px-3">
              <Text
                className="text-xs font-inter-medium text-center md:text-sm"
                style={{ color: theme.primary }}
              >
                +{order.offers.length - 3} more items
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Special Instructions (if any) */}
      {order.specialInstructions && (
        <View className="mb-3 p-2 rounded-lg bg-warning/5 border border-warning/20 md:p-3 md:mb-4">
          <View className="flex-row items-start gap-2">
            <MessageSquare
              color={theme.warning}
              size={14}
              className="mt-0.5 md:w-4 md:h-4"
            />
            <Text
              className="text-xs font-inter-regular flex-1 md:text-sm"
              style={{ color: theme.textSecondary }}
              numberOfLines={2}
            >
              {order.specialInstructions}
            </Text>
          </View>
        </View>
      )}

      {/* Total Amount - Compact */}
      <View
        className="flex-row justify-between items-center py-2 px-3 rounded-xl md:py-3 md:px-4"
        style={{ backgroundColor: theme.primaryLight + '15' }}
      >
        <Text
          className="text-sm font-inter-semibold md:text-base"
          style={{ color: theme.textSecondary }}
        >
          Total
        </Text>
        <Text
          className="text-lg font-inter-bold md:text-xl"
          style={{ color: theme.text }}
        >
          ${order.total.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 pt-7 items-center px-6 md:px-8 md:pt-8"
        style={{ backgroundColor: theme.background }}
      >
        <Text
          className="text-4xl font-bold w-full mb-10 md:text-4xl md:mb-12"
          style={{ color: theme.text }}
        >
          Order History
        </Text>
        {HeroSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 pt-7"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pb-4 md:px-8 md:pb-6">
        <View>
          <Text
            className="text-4xl mb-1"
            style={{ color: theme.text, fontWeight: 900 }}
          >
            Order History
          </Text>
          <Text
            className="text-sm font-inter-regular md:text-base"
            style={{ color: theme.textSecondary }}
          >
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
            className="flex-row items-center px-4 py-2 rounded-xl gap-2 md:px-5 md:py-2.5"
            style={{ backgroundColor: theme.errorLight }}
          >
            <Trash2 color={theme.error} size={18} className="md:w-5 md:h-5" />
            <Text
              className="text-sm font-inter-semibold md:text-base"
              style={{ color: theme.error }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* 🔍 Search + Filter Section */}
        <View className="px-6 mb-4 md:px-8 md:mb-6">
          {/* Search Bar */}
          <View
            className="flex-row items-center rounded-xl px-4 py-2 gap-3 mb-3 md:px-5 md:py-3"
            style={{ backgroundColor: theme.backgroundSecondary }}
          >
            <Search
              color={theme.textSecondary}
              size={18}
              className="md:w-5 md:h-5"
            />
            <TextInput
              className="flex-1 text-base font-inter-regular md:text-lg"
              style={{ color: theme.text }}
              placeholder="Search by ID or customer name..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Buttons */}
          <View className="flex-row gap-2 flex-wrap md:gap-3">
            {['all', 'pending', 'completed', 'cancelled'].map(
              (status, index) => (
                <TouchableOpacity
                  key={status + index}
                  onPress={() =>
                    setStatusFilter(
                      status as 'all' | 'pending' | 'completed' | 'cancelled'
                    )
                  }
                  className="px-4 py-1.5 rounded-xl md:px-5 md:py-2"
                  style={{
                    backgroundColor:
                      statusFilter === status
                        ? theme.primaryLight
                        : theme.backgroundSecondary,
                  }}
                >
                  <Text
                    className="text-sm font-inter-semibold capitalize md:text-base"
                    style={{ color: theme.text }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8 py-16 md:py-24">
            <View
              className="w-24 h-24 rounded-3xl justify-center items-center mb-6 md:w-32 md:h-32 md:mb-8"
              style={{ backgroundColor: theme.backgroundSecondary }}
            >
              <Package
                color={theme.textTertiary}
                size={48}
                className="md:w-16 md:h-16"
              />
            </View>
            {isLoading ? (
              <Text
                className="text-base font-inter-regular text-center md:text-lg"
                style={{ color: theme.textSecondary }}
              >
                Loading orders...
              </Text>
            ) : (
              <>
                <Text
                  className="text-xl font-inter-semibold mb-2 text-center md:text-2xl"
                  style={{ color: theme.text }}
                >
                  No orders found
                </Text>
                <Text
                  className="text-base font-inter-regular text-center md:text-lg"
                  style={{ color: theme.textSecondary }}
                >
                  Try adjusting your search or filter
                </Text>
              </>
            )}
          </View>
        ) : (
          <View className="px-6 md:px-8 lg:px-12">
            {filteredOrders.map((order: Order) => (
              <View key={order.id}>{renderOrder(order)}</View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Cancel Order Modal */}
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
