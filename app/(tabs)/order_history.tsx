import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '@/stores/orderStore';
import { useCameraPermissions } from 'expo-camera';
import {
  CheckCircle,
  Phone,
  Trash2,
  Package,
  CircleSlash2,
  CalendarClock,
  Search,
  ScanQrCode,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { TransactionBase, TransactionStatus } from '@/types/appTypes';
import OrderCancelModal from '@/components/OrderCancelModal';
import { formatDateTime } from '@/utils/formatters';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { TSX_WEBSOCKET_URL } from '@/constants/api_constants';

export default function OrderHistoryScreen() {
  const { theme, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [confirmCancelModal, setConfirmCancelModal] = useState(false);
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const colorMode = isDark ? 'dark' : 'light';
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;
  const [selectedOrder, setSelectedOrder] = useState<TransactionBase | null>();
  const {
    orders,
    updateLocalOrder,
    updateOrder,
    clearOrders,
    fetchOrders,
    isLoading,
  } = useOrderStore();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    console.log('Entering ws use effect');
    const ws = new WebSocket(`${TSX_WEBSOCKET_URL}/ws/mobile/${user?.id}`);
    ws.onopen = () => {
      console.log('CONNECTED');
    };
    ws.onerror = (err) => {
      console.log('connection err:', err);
    };
    ws.onclose = () => {
      console.log('WS Closed');
    };
    ws.onmessage = (event) => {
      const data: { transaction_id: string; status: string } = JSON.parse(
        event.data
      );
      console.log('ws data', data);

      if (data) {
        const targetTrans = orders.find(
          (trx) => trx.id === data.transaction_id
        );

        if (targetTrans) {
          updateLocalOrder(data.transaction_id, {
            status: data.status as TransactionStatus,
          });
        }
      }

      showAlert(`your order is ${data.status}`, '', 'success');
    };

    return () => {
      ws.close();
    };
  }, [orders, updateLocalOrder, user?.tenant_id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>(
    'all'
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.client_data?.first_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.items?.find((item) =>
          item.item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'all' ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  async function handleOrderCancel() {
    const res = await updateOrder(selectedOrder?.id ?? '', {
      status: 'CANCELLED',
      transaction_type: 'ORDER',
      user_id: user?.id!,
    });
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

  function handleQrScan() {
    requestPermission();
    const isPermissionGranted = Boolean(permission?.granted);
    if (!isPermissionGranted) {
      requestPermission();
    } else {
      router.replace('/(in_app_screens)/qrScan');
    }
  }
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchOrders();
    setRefreshing(false);
  }, []);

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

  const getOrderStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <CalendarClock
            color={theme.warning}
            size={16}
            className="md:w-5 md:h-5"
          />
        );
      case 'COMPLETED':
        return (
          <CheckCircle
            color={theme.success}
            size={16}
            className="md:w-5 md:h-5"
          />
        );
      case 'CANCELLED':
        return (
          <CircleSlash2
            color={theme.error}
            size={16}
            className="md:w-5 md:h-5"
          />
        );
      default:
        return null;
    }
  };

  const renderOrder = (order: TransactionBase) => (
    <TouchableOpacity
      className="rounded-2xl border bg-card p-4 shadow-sm mb-4 md:p-6 lg:mb-6"
      onPress={() =>
        router.push(`/(in_app_screens)/order-details?id=${order.id}`)
      }
      style={{
        backgroundColor: theme.card,
        borderColor:
          order.status === 'PENDING' || order.status === 'CANCELLED'
            ? theme.warning
            : theme.success,
      }}
    >
      {/* Order Header - Compact */}
      <View className="flex-row justify-between items-start mb-3 md:mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="w-8 h-8 rounded-full items-center justify-center md:w-10 md:h-10"
            style={{ backgroundColor: theme.successLight }}
          >
            {getOrderStatusIcon(order.status ?? 'PENDING')}
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
              {order.client_data?.first_name.concat(
                ` ${order.client_data.last_name}`
              )}
            </Text>
          </View>
        </View>
        {order.status === 'PENDING' && (
          <View className="flex-row gap-2">
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
            <TouchableOpacity
              onPress={() => {
                setSelectedOrder(order);
                handleQrScan();
              }}
              className="w-8 h-8 rounded-lg items-center justify-center md:w-9 md:h-9"
              style={{ backgroundColor: theme.successLight }}
            >
              <ScanQrCode
                color={theme.success}
                size={14}
                className="md:w-4 md:h-4"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Compact Info Grid */}
      <View className="flex-row items-center justify-center  mb-3 gap-3">
        <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-lg md:px-3 md:py-1.5">
          <Phone
            color={theme.primary}
            size={12}
            className="md:w-3.5 md:h-3.5"
          />
          <Text
            className="text-xs font-inter-medium md:text-sm"
            style={{ color: theme.textSecondary }}
          >
            {order.client_data?.phone_number}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-lg md:px-3 md:py-1.5">
          <CalendarClock
            color={theme.primary}
            size={12}
            className="md:w-3.5 md:h-3.5"
          />
          <Text
            className="text-xs font-inter-medium md:text-sm"
            style={{ color: theme.textSecondary }}
          >
            {formatDateTime(order.created_at ?? '')}
          </Text>
        </View>
      </View>

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
          ${order.total_price}
        </Text>
      </View>
    </TouchableOpacity>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
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
              placeholder="Search by order ID,customer name, or order item..."
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
                  onPress={() => setStatusFilter(status as TransactionStatus)}
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
            {filteredOrders.reverse().map((order: TransactionBase) => (
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
