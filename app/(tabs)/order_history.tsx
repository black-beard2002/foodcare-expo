import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, useOrderStore } from '@/stores/orderStore';
import { CheckCircle } from 'lucide-react-native';
import { useAlert } from '@/providers/AlertProvider';
import { CartItem, Offer } from '@/stores/appStore';

export default function OrderHistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { orders, removeOrder, clearOrders } = useOrderStore();
  const { showAlert } = useAlert();

  const renderOrder = ({ item: order }: { item: Order }) => (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: theme.text }]}>
          Order ID: {order.id}
        </Text>
        <TouchableOpacity
          onPress={() => {
            removeOrder(order.id);
            showAlert('Removed', 'Order removed from history', 'info');
          }}
        >
          <Text style={{ color: theme.primary }}>Remove</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.customerText, { color: theme.text }]}>
        Customer: {order.customerName} | {order.customerPhone}
      </Text>
      {order.pickupTime && (
        <Text style={[styles.customerText, { color: theme.textSecondary }]}>
          Pickup: {order.pickupTime}
        </Text>
      )}
      {order.specialInstructions && (
        <Text style={[styles.customerText, { color: theme.textSecondary }]}>
          Notes: {order.specialInstructions}
        </Text>
      )}

      <View style={styles.offersContainer}>
        <Text
          style={[
            {
              color: theme.text,
              fontSize: 16,
              marginBottom: 15,
              borderBottomWidth: 2,
              borderColor: theme.border,
            },
          ]}
        >
          Offers:
        </Text>
        {order.offers.map((order: CartItem) => (
          <View key={order.id} style={styles.offerItem}>
            <Text
              style={[
                styles.offerTitle,
                { color: theme.text, backgroundColor: theme.primary },
              ]}
              numberOfLines={1}
            >
              {order.offer.title}
            </Text>
            <Text style={[styles.offerPrice, { color: theme.primary }]}>
              ${order.offer.discounted_price.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <CheckCircle color={theme.success} size={20} />
        <Text style={[styles.totalText, { color: theme.text }]}>
          Total: ${order.total.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Order History</Text>
        {orders.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              clearOrders();
              showAlert('Cleared', 'All orders have been cleared', 'success');
            }}
          >
            <Text style={[styles.clearText, { color: theme.primary }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No orders yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(order) => order.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const lightTheme = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5E5EA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#FF6B35',
  success: '#34C759',
};

const darkTheme = {
  background: '#000000',
  card: '#1C1C1E',
  border: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  primary: '#FF6B35',
  success: '#30D158',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  customerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  offersContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  offerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    paddingStart: 10,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  offerPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  totalText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
