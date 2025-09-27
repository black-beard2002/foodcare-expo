import React, { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  Copy,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useOrderStore } from '@/stores/orderStore';
import { useAlert } from '@/providers/AlertProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const { cart, getCartTotal, clearCart } = useAppStore();
  const { showAlert } = useAlert();
  const { addOrder } = useOrderStore();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    pickupTime: '',
    specialInstructions: '',
  });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const colors = {
    light: {
      background: '#FFFFFF',
      primary: '#FF6B35',
      text: '#1A1A1A',
      textSecondary: '#666666',
      card: '#FFFFFF',
      border: '#E5E5EA',
      success: '#34C759',
      inputBackground: '#F5F5F5',
    },
    dark: {
      background: '#000000',
      primary: '#FF6B35',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      card: '#1C1C1E',
      border: '#2C2C2E',
      success: '#30D158',
      inputBackground: '#1C1C1E',
    },
  };

  const theme = colors[colorScheme ?? 'light'];

  const handleReserveOrder = () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      showAlert(
        'Missing Information',
        'Please fill in your name and phone number.',
        'error'
      );
      return;
    }

    // Generate random order number
    const generatedOrderNumber = `ORD${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    setOrderNumber(generatedOrderNumber);

    // Prepare order object
    const newOrder = {
      id: generatedOrderNumber,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      pickupTime: customerInfo.pickupTime,
      specialInstructions: customerInfo.specialInstructions,
      offers: cart, // assuming `cart` is the array of Offer objects
      total: getCartTotal(),
    };

    // Add order to store
    addOrder(newOrder);

    // Show modal with order details
    setShowOrderModal(true);

    // Clear cart after showing modal
    clearCart();
  };

  const deliveryFee = 2.99;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  const isReserveDisabled =
    !customerInfo.name.trim() || !customerInfo.phone.trim();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Order Summary
          </Text>
          {cart.map((item) => (
            <View
              key={item.id}
              style={[
                styles.orderItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.itemName, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.offer.title}
              </Text>
              <View style={styles.itemDetails}>
                <Text
                  style={[styles.itemQuantity, { color: theme.textSecondary }]}
                >
                  Qty: {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>
                  ${(item.offer.discounted_price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Customer Information
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <User color={theme.textSecondary} size={20} />
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.inputBackground },
                ]}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={customerInfo.name}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, name: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone color={theme.textSecondary} size={20} />
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.inputBackground },
                ]}
                placeholder="Phone Number"
                placeholderTextColor={theme.textSecondary}
                value={customerInfo.phone}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Clock color={theme.textSecondary} size={20} />
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.inputBackground },
                ]}
                placeholder="Preferred Pickup Time (Optional)"
                placeholderTextColor={theme.textSecondary}
                value={customerInfo.pickupTime}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, pickupTime: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin color={theme.textSecondary} size={20} />
              <TextInput
                style={[
                  styles.textArea,
                  { color: theme.text, backgroundColor: theme.inputBackground },
                ]}
                placeholder="Special Instructions (Optional)"
                placeholderTextColor={theme.textSecondary}
                value={customerInfo.specialInstructions}
                onChangeText={(text) =>
                  setCustomerInfo({
                    ...customerInfo,
                    specialInstructions: text,
                  })
                }
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View
          style={[
            styles.priceBreakdown,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              {subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
              Service Fee
            </Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              {deliveryFee.toFixed(2)}
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
              Total
            </Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.reserveButton,
            { backgroundColor: isReserveDisabled ? '#ccc' : theme.primary },
          ]}
          onPress={handleReserveOrder}
          disabled={isReserveDisabled}
        >
          <Text style={styles.reserveButtonText}>
            Reserve Order - ${total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Order Reserved!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  styles.modalText,
                  { color: theme.text, fontWeight: 'bold' },
                ]}
              >
                Order Number: {orderNumber}
              </Text>
              <TouchableOpacity
                style={{ marginLeft: 8 }}
                onPress={async () => {
                  await Clipboard.setStringAsync(orderNumber);
                  showAlert(
                    'Copied!',
                    `Order ID ${orderNumber} copied to clipboard.`,
                    'success'
                  );
                }}
              >
                <Copy size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Name: {customerInfo.name}
            </Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Phone: {customerInfo.phone}
            </Text>
            {customerInfo.pickupTime ? (
              <Text style={[styles.modalText, { color: theme.text }]}>
                Pickup Time: {customerInfo.pickupTime}
              </Text>
            ) : null}
            {customerInfo.specialInstructions ? (
              <Text style={[styles.modalText, { color: theme.text }]}>
                Instructions: {customerInfo.specialInstructions}
              </Text>
            ) : null}
            <Text
              style={[
                styles.modalNote,
                {
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            >
              Take a screenshot of this information to show it to the
              restaurant.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowOrderModal(false);
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontFamily: 'Inter-Bold' },
  content: { flex: 1, paddingHorizontal: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 16 },
  orderItem: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  itemName: { fontSize: 16, fontFamily: 'Inter-Medium', marginBottom: 8 },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: { fontSize: 14, fontFamily: 'Inter-Regular' },
  itemPrice: { fontSize: 16, fontFamily: 'Inter-Bold' },
  inputGroup: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceBreakdown: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 130,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: { fontSize: 16, fontFamily: 'Inter-Regular' },
  priceValue: { fontSize: 16, fontFamily: 'Inter-Medium' },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginBottom: 0 },
  totalLabel: { fontSize: 18, fontFamily: 'Inter-Bold' },
  totalValue: { fontSize: 20, fontFamily: 'Inter-Bold' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  reserveButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '85%', borderRadius: 16, padding: 24 },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: { fontSize: 16, fontFamily: 'Inter-Regular', marginBottom: 8 },
  modalNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 12,
    borderWidth: 3,
    padding: 2,
    borderRadius: 10,
    borderStyle: 'dotted',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter-Medium' },
});
