import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Minus, Trash2 } from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const {
    cart,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
  } = useAppStore();

  const renderCartItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.cartItem,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Image source={item.offer.image_url} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text
          style={[styles.itemTitle, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.offer.title}
        </Text>
        <Text style={[styles.restaurantName, { color: theme.textSecondary }]}>
          {item.offer.restaurant.name}
        </Text>
        <Text style={[styles.itemPrice, { color: theme.primary }]}>
          ${item.offer.discounted_price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => {
            removeFromCart(item.id);
            showAlert('Removed', 'Item removed from cart', 'info');
          }}
          style={[
            styles.deleteButton,
            { backgroundColor: `${theme.errorLight}20` },
          ]}
        >
          <Trash2 color={theme.error} size={16} />
        </TouchableOpacity>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => updateCartItem(item.id, item.quantity - 1)}
            style={[styles.quantityButton, { borderColor: theme.border }]}
          >
            <Minus color={theme.text} size={16} />
          </TouchableOpacity>

          <Text style={[styles.quantity, { color: theme.text }]}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => updateCartItem(item.id, item.quantity + 1)}
            style={[styles.quantityButton, { borderColor: theme.border }]}
          >
            <Plus color={theme.text} size={16} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Cart</Text>
        </View>

        <View style={styles.emptyCart}>
          <Text style={[styles.emptyCartText, { color: theme.textSecondary }]}>
            Your cart is empty
          </Text>
          <Text
            style={[styles.emptyCartSubtext, { color: theme.textSecondary }]}
          >
            Add some delicious offers to get started!
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Browse Offers</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Cart</Text>
        <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
          {getCartItemCount()} items
        </Text>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Total Amount
          </Text>
          <Text style={[styles.totalAmount, { color: theme.primary }]}>
            ${getCartTotal().toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/(in_app_screens)/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  cartList: {
    paddingHorizontal: 24,
    paddingBottom: 200,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    lineHeight: 22,
  },
  restaurantName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  itemPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    minWidth: 24,
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyCartText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 2,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  totalAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  checkoutButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
