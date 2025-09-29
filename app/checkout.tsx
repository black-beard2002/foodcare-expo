import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  User,
  Phone,
  ShoppingBag,
  DollarSign,
  Percent,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useOrderStore } from '@/stores/orderStore';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const { cart, getCartTotal, clearCart } = useAppStore();
  const { showAlert } = useAlert();
  const { createOrder, isLoading } = useOrderStore();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    pickupTime: '',
    specialInstructions: '',
  });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleReserveOrder = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      showAlert(
        'Missing Information',
        'Please fill in your name and phone number.',
        'error'
      );
      return;
    }

    const orderData = {
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      pickupTime: customerInfo.pickupTime,
      specialInstructions: customerInfo.specialInstructions,
      offers: cart,
      status: 'pending',
      total: getCartTotal(),
    };

    const result = await createOrder(orderData);

    if (result.success && result.orderId) {
      setOrderNumber(result.orderId);
      setShowOrderModal(true);
      clearCart();

      showAlert(
        'Order Created!',
        `Your order ${result.orderId} has been placed successfully.`,
        'success'
      );
    } else {
      showAlert(
        'Order Failed',
        result.error || 'Failed to create order. Please try again.',
        'error'
      );
    }
  };

  const deliveryFee = 2.99;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  const isReserveDisabled =
    !customerInfo.name.trim() || !customerInfo.phone.trim() || isLoading;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Order Summary
            </Text>
            <View
              style={[
                styles.itemCount,
                { backgroundColor: theme.primaryDark + '30' },
              ]}
            >
              <Text style={[styles.itemCountText, { color: theme.text }]}>
                {cart.length}
              </Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            {cart.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.orderItem,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                  shadows.sm,
                ]}
              >
                <Image source={item.offer.image_url} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {item.offer.title}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    <View
                      style={[
                        styles.quantityBadge,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemQuantity,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <View style={styles.itemPriceContainer}>
                      <Text
                        style={[
                          styles.itemOriginalPrice,
                          { color: theme.textTertiary },
                        ]}
                      >
                        ${item.offer.original_price.toFixed(2)}
                      </Text>
                      <Text
                        style={[styles.itemPrice, { color: theme.primary }]}
                      >
                        $
                        {(item.offer.discounted_price * item.quantity).toFixed(
                          2
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User color={theme.info} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Customer Information
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.card, borderColor: theme.border },
                shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: theme.primaryLight + '20' },
                ]}
              >
                <User color={theme.primaryDark} size={20} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full Name *"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.name}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, name: text })
                }
              />
            </View>

            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.card, borderColor: theme.border },
                shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: theme.primaryLight + '20' },
                ]}
              >
                <Phone color={theme.primaryDark} size={20} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Phone Number *"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.phone}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.card, borderColor: theme.border },
                shadows.sm,
              ]}
            >
              <View
                style={[styles.inputIcon, { backgroundColor: theme.infoLight }]}
              >
                <Clock color={theme.info} size={20} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Preferred Pickup Time (Optional)"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.pickupTime}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, pickupTime: text })
                }
              />
            </View>

            <View
              style={[
                styles.textAreaWrapper,
                { backgroundColor: theme.card, borderColor: theme.border },
                shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: theme.warningLight },
                ]}
              >
                <MessageSquare color={theme.warning} size={20} />
              </View>
              <TextInput
                style={[styles.textArea, { color: theme.text }]}
                placeholder="Special Instructions (Optional)"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.specialInstructions}
                onChangeText={(text) =>
                  setCustomerInfo({
                    ...customerInfo,
                    specialInstructions: text,
                  })
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Price Breakdown Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color={theme.success} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Price Breakdown
            </Text>
          </View>

          <View
            style={[
              styles.priceBreakdown,
              { backgroundColor: theme.card, borderColor: theme.border },
              shadows.md,
            ]}
          >
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Service Fee
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View
              style={[
                styles.savingsRow,
                { backgroundColor: theme.successLight },
              ]}
            >
              <Percent color={theme.success} size={16} />
              <Text style={[styles.savingsLabel, { color: theme.success }]}>
                You're saving
              </Text>
              <Text style={[styles.savingsValue, { color: theme.success }]}>
                $
                {cart
                  .reduce(
                    (sum, item) =>
                      sum +
                      (item.offer.original_price -
                        item.offer.discounted_price) *
                        item.quantity,
                    0
                  )
                  .toFixed(2)}
              </Text>
            </View>

            <View
              style={[
                styles.priceRow,
                styles.totalRow,
                { borderTopColor: theme.border },
              ]}
            >
              <Text style={[styles.totalLabel, { color: theme.text }]}>
                Total Amount
              </Text>
              <Text style={[styles.totalValue, { color: theme.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.background, borderTopColor: theme.border },
          shadows.lg,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.reserveButton,
            {
              backgroundColor: isReserveDisabled
                ? theme.disabled
                : theme.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleReserveOrder}
          disabled={isReserveDisabled}
          activeOpacity={0.8}
        >
          <Text style={[styles.reserveButtonText, { color: theme.text }]}>
            {isLoading
              ? 'Creating Order...'
              : `Reserve Order • $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
          * Required fields must be filled
        </Text>
      </View>

      {/* Order Success Modal */}
      <OrderSuccessModal
        visible={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        orderNumber={orderNumber}
        customerInfo={customerInfo}
      />
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
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  itemCount: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  itemCountText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Bold',
  },
  orderItems: {
    gap: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.lg,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  itemQuantity: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemOriginalPrice: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
  },
  inputGroup: {
    gap: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    paddingVertical: spacing.sm,
  },
  textArea: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
  },
  priceBreakdown: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceLabel: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
  },
  priceValue: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  savingsLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  savingsValue: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
  },
  totalValue: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Inter-Bold',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  reserveButton: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reserveButtonText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
  },
  footerNote: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
