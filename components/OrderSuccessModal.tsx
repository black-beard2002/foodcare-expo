import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CheckCircle, Copy, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { router } from 'expo-router';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';

interface OrderSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    pickupTime?: string;
    specialInstructions?: string;
  };
}

export default function OrderSuccessModal({
  visible,
  onClose,
  orderNumber,
  customerInfo,
}: OrderSuccessModalProps) {
  const { theme } = useTheme();
  const { showAlert } = useAlert();

  const handleCopyOrderNumber = async () => {
    await Clipboard.setStringAsync(orderNumber);
    showAlert(
      'Copied!',
      `Order ID ${orderNumber} copied to clipboard.`,
      'success'
    );
  };

  const handleClose = () => {
    onClose();
    router.replace('/(tabs)');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.card },
            shadows.xl,
          ]}
        >
          {/* Success Icon */}
          <View
            style={[
              styles.successIconContainer,
              { backgroundColor: theme.successLight },
            ]}
          >
            <CheckCircle color={theme.success} size={64} />
          </View>

          {/* Title */}
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Order Reserved!
          </Text>
          <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
            Your order has been successfully placed
          </Text>

          {/* Order Details Card */}
          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Order Number */}
            <View style={styles.orderNumberSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Order Number
              </Text>
              <TouchableOpacity
                style={[
                  styles.orderNumberContainer,
                  { backgroundColor: theme.primary + '15' },
                ]}
                onPress={handleCopyOrderNumber}
              >
                <Text style={[styles.orderNumber, { color: theme.text }]}>
                  {orderNumber}
                </Text>
                <Copy size={20} color={theme.primaryDark} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Customer Info */}
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Name
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {customerInfo.name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Phone
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {customerInfo.phone}
              </Text>
            </View>

            {customerInfo.pickupTime && (
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: theme.textSecondary }]}
                >
                  Pickup Time
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {customerInfo.pickupTime}
                </Text>
              </View>
            )}

            {customerInfo.specialInstructions && (
              <View style={[styles.infoRow, styles.instructionsRow]}>
                <Text
                  style={[styles.infoLabel, { color: theme.textSecondary }]}
                >
                  Instructions
                </Text>
                <Text style={[styles.instructionsText, { color: theme.text }]}>
                  {customerInfo.specialInstructions}
                </Text>
              </View>
            )}
          </View>

          {/* Important Note */}
          <View
            style={[
              styles.noteContainer,
              {
                backgroundColor: theme.warningLight,
                borderColor: theme.warning,
              },
            ]}
          >
            <Text style={[styles.noteText, { color: theme.warning }]}>
              📸 Take a screenshot to show at the restaurant
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={handleClose}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => {
              onClose();
              router.push('/(tabs)/order_history');
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              View Order History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize['3xl'],
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  orderNumberSection: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.sm,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  orderNumber: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instructionsRow: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
  },
  instructionsText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  noteContainer: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginBottom: spacing.lg,
  },
  noteText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
  },
});
