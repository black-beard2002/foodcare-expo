import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CheckCircle, CircleSlash2, Copy, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { router } from 'expo-router';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';

interface OrderCancelModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  orderNumber: string;
}

export default function OrderCancelModal({
  visible,
  onConfirm,
  onCancel,
  orderNumber,
}: OrderCancelModalProps) {
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.modalOverlay]}>
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
              { backgroundColor: theme.warningLight },
            ]}
          >
            <CircleSlash2 color={theme.warning} size={64} />
          </View>

          {/* Title */}
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Cancel Order!
          </Text>
          <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
            Are you sure you want to cancel this order ?
          </Text>

          {/* Order Number */}
          <View style={styles.orderNumberSection}>
            <TouchableOpacity
              style={[
                styles.orderNumberContainer,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleCopyOrderNumber}
            >
              <Text style={[styles.orderNumber, { color: theme.text }]}>
                {orderNumber}
              </Text>
              <Copy size={20} color={theme.primaryLight} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.warning }]}
            onPress={onConfirm}
          >
            <Text style={styles.primaryButtonText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={onCancel}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Go Back
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  orderNumber: {
    fontSize: fontSize.xl,
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
