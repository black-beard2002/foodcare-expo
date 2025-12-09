import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ColorValue,
  Share,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import {
  TransactionBase,
  OrderItem,
  TransactionStatus,
  AddOn,
} from '@/types/appTypes';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Receipt,
  ScanQrCode,
  Share2,
  User,
  ShoppingBag,
  Eye,
  LockKeyholeIcon,
  EyeClosed,
  TimerIcon,
  CalendarCheck,
  Plus,
  X,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { formatPrice, handleImageSrc } from '@/utils/helpers';
import * as images from '@/constants/images';
import { useOrderStore } from '@/stores/orderStore';
import { useCameraPermissions } from 'expo-camera';
import { useAlert } from '@/providers/AlertProvider';
import { useAuthStore } from '@/stores/authStore';
import { TSX_WEBSOCKET_URL } from '@/constants/api_constants';
import { formatDateTime } from '@/utils/formatters';

export default function OrderDetailsScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useOrderStore();
  const { showAlert } = useAlert();
  const { user } = useAuthStore();
  const { updateLocalOrder } = useOrderStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [codeHidden, setCodeHidden] = useState(true);
  const [order, setOrder] = useState<TransactionBase | null>(null);
  useEffect(() => {
    const foundOrder = orders.find((o) => o.id === id);
    console.log('Found Offer:', foundOrder);

    setOrder(foundOrder || null);
  }, [id]);
  // Status configuration
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: theme.success,
          icon: CheckCircle2,
          bgColor: theme.successLight,
          label: 'Completed',
        };
      case 'PENDING':
        return {
          color: theme.warning,
          icon: Clock,
          bgColor: theme.warningLight,
          label: 'Pending',
        };
      case 'DELIVERED':
        return {
          color: theme.info,
          icon: Truck,
          bgColor: theme.infoLight,
          label: 'Delivered',
        };
      case 'CANCELLED':
        return {
          color: theme.error,
          icon: XCircle,
          bgColor: theme.errorLight,
          label: 'Cancelled',
        };
      case 'PROCESSING':
        return {
          color: theme.info,
          icon: TimerIcon,
          bgColor: theme.infoLight,
          label: 'Processing',
        };
      default:
        return {
          color: theme.textSecondary,
          icon: AlertCircle,
          bgColor: theme.border,
          label: 'Unknown',
        };
    }
  };
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

  const getPaymentStatusConfig = (status?: string) => {
    switch (status) {
      case 'PAID':
        return { color: theme.success, label: 'Paid' };
      case 'PENDING':
        return { color: theme.warning, label: 'Pending' };
      case 'FAILED':
        return { color: theme.error, label: 'Failed' };
      case 'REFUNDED':
        return { color: theme.info, label: 'Refunded' };
      case 'PARTIALLY_PAID':
        return { color: theme.warning, label: 'Partially Paid' };
      default:
        return { color: theme.textSecondary, label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(order?.status);
  const paymentConfig = getPaymentStatusConfig(order?.payment_status);
  const StatusIcon = statusConfig.icon;
  // Render selected properties for an item
  const renderSelectedProperties = (item: OrderItem) => {
    if (
      !item.selectedProperties ||
      Object.keys(item.selectedProperties).length === 0
    ) {
      return null;
    }

    const properties = item.item.custom_properties;
    if (!properties) return null;

    const elements: React.ReactNode[] = [];

    Object.entries(item.selectedProperties).forEach(([key, value]) => {
      const property = properties[key];
      if (!property) return;

      // Handle different property types
      if (property.type === 'exclude' || property.type === 'multiexclude') {
        // Show excluded items
        if (Array.isArray(value) && value.length > 0) {
          elements.push(
            <View
              key={key}
              className="flex-row flex-wrap items-center gap-1 mt-2"
            >
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                No:
              </Text>
              {(value as string[]).map((excluded, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center gap-0.5 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: theme.error + '15' }}
                >
                  <X size={8} color={theme.error} strokeWidth={3} />
                  <Text
                    className="text-[10px] capitalize"
                    style={{ color: theme.error, fontFamily: 'PoppinsMedium' }}
                  >
                    {excluded}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
      } else if (property.type === 'addon') {
        // Show addons
        if (Array.isArray(value) && value.length > 0) {
          elements.push(
            <View
              key={key}
              className="flex-row flex-wrap items-center gap-1 mt-2"
            >
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                Add-ons:
              </Text>
              {(value as AddOn[]).map((addon, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center gap-0.5 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: theme.success + '15' }}
                >
                  <Plus size={8} color={theme.success} strokeWidth={3} />
                  <Text
                    className="text-[10px]"
                    style={{
                      color: theme.success,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    {addon.name} (+${addon.price.toFixed(2)})
                  </Text>
                </View>
              ))}
            </View>
          );
        }
      } else if (
        property.type === 'select' ||
        property.type === 'multiselect'
      ) {
        // Show selected options
        const displayValue = Array.isArray(value)
          ? (value as string[]).join(', ')
          : String(value);

        if (displayValue) {
          elements.push(
            <View key={key} className="flex-row items-center gap-1 mt-2">
              <View
                className="flex-row items-center gap-1 px-1.5 py-0.5 rounded"
                style={{ backgroundColor: theme.primary + '15' }}
              >
                <Text
                  className="text-[10px]"
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  {property.label}:
                </Text>
                <Text
                  className="text-[10px] capitalize"
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  {displayValue}
                </Text>
              </View>
            </View>
          );
        }
      }
    });

    if (elements.length === 0) return null;

    return (
      <View
        className="mt-2 pt-2 border-t"
        style={{ borderTopColor: theme.border + '20' }}
      >
        <View className="flex-row flex-wrap gap-1">{elements}</View>
      </View>
    );
  };

  function handleQrScan() {
    requestPermission();
    const isPermissionGranted = Boolean(permission?.granted);
    if (!isPermissionGranted) {
      requestPermission();
    } else {
      router.replace('/(in_app_screens)/qrScan');
    }
  }

  async function handleShareOrder() {
    if (!order) return;

    const itemLines = order.items
      ?.map(
        (i) =>
          `• ${i.item.title} (x${i.quantity}) — ${formatPrice(i.total)} ${
            order.currency
          }`
      )
      .join('\n');

    const message = `
🧾 *Order Details*
━━━━━━━━━━━━━━
📦 *Order ID:* ${order.id.toUpperCase()}
🔖 *Status:* ${order.status}
💰 *Total:* ${formatPrice(order.total_price ?? 0)} ${order.currency}
⏱ *Created At:* ${formatDateTime(order.created_at ?? '')}

🛍 *Items*
${itemLines}

🔑 *Confirmation Code:* ${
      order.confirmation_code || order.id.slice(0, 8).toUpperCase()
    }

👤 *Customer*
${order.client_data?.first_name} ${order.client_data?.last_name}
📞 ${order.client_data?.phone_number}
📍 ${order.client_data?.address}

━━━━━━━━━━━━━━
Shared from FoodForLess App
  `.trim();

    try {
      await Share.share({ message });
    } catch (error) {
      console.log('Share Error:', error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,

          paddingVertical: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.backgroundSecondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ArrowLeft color={theme.text} size={22} />
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 20,
                  fontFamily: 'FredokaMedium',
                }}
              >
                Order Details
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                #{order?.id.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.backgroundSecondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleShareOrder();
              }}
            >
              <Share2 color={theme.text} size={20} />
            </TouchableOpacity>

            {order?.status === 'PENDING' && (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.backgroundSecondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleQrScan();
                }}
              >
                <ScanQrCode color={theme.text} size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Status Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={{ paddingHorizontal: 20, marginTop: 20 }}
        >
          <LinearGradient
            colors={[
              statusConfig.bgColor as ColorValue,
              (statusConfig.bgColor + '80') as ColorValue,
            ]}
            style={{
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: statusConfig.color + '30',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: statusConfig.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <StatusIcon color={statusConfig.color} size={24} />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                    }}
                  >
                    {statusConfig.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      fontFamily: 'PoppinsLight',
                    }}
                  >
                    Order Status
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: statusConfig.color + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: statusConfig.color,
                    fontSize: 12,
                    fontFamily: 'FredokaMedium',
                  }}
                >
                  {order?.transaction_type || 'ORDER'}
                </Text>
              </View>
            </View>

            {order?.updated_at && (
              <View
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CalendarCheck color={theme.textSecondary} size={16} />
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  Confirmed: {formatDateTime(order?.updated_at)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </MotiView>

        {/* Confirmation Code */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <LockKeyholeIcon color={theme.primary} size={20} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'FredokaMedium',
                color: theme.text,
              }}
            >
              Confirmation Code
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              padding: 10,
              borderColor: theme.border,
            }}
          >
            <View className="flex flex-row items-center gap-10">
              <Text
                className="flex-1 text-3xl text-center tracking-wider"
                style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
              >
                {codeHidden
                  ? '••••••••'
                  : order?.confirmation_code ||
                    order?.id.slice(0, 8).toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setCodeHidden(!codeHidden)}>
                {codeHidden ? (
                  <EyeClosed color={theme.primary} size={24} />
                ) : (
                  <Eye color={theme.primary} size={24} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <ShoppingBag color={theme.primary} size={20} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'FredokaMedium',
                color: theme.text,
              }}
            >
              Order Items {order?.items ? `(${order.items.length})` : ''}
            </Text>
          </View>

          <View
            style={{
              overflow: 'hidden',
            }}
          >
            {order?.items?.map((orderItem: OrderItem, index: number) => (
              <View
                key={index}
                style={{
                  backgroundColor: theme.card,
                  marginVertical: 6,
                  borderRadius: 16,
                  borderColor: theme.border,
                  padding: 14,
                }}
              >
                {/* ITEM ROW */}
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  {/* Image */}
                  <Image
                    source={
                      orderItem.item.main_image
                        ? { uri: handleImageSrc(orderItem.item.main_image) }
                        : images.OFFER_PLACEHOLDER_IMAGE
                    }
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 14,
                      backgroundColor: theme.backgroundSecondary,
                    }}
                    resizeMode="cover"
                  />

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'PoppinsMedium',
                        color: theme.text,
                        marginBottom: 2,
                      }}
                      numberOfLines={2}
                    >
                      {orderItem.item.title}
                    </Text>

                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 13,
                        fontFamily: 'PoppinsMedium',
                        marginBottom: 6,
                      }}
                    >
                      Quantity: {orderItem.quantity}
                    </Text>

                    {/* Price */}
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: theme.primary + '20',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 10,
                        marginTop: 'auto',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          fontFamily: 'PoppinsMedium',
                          color: theme.primary,
                        }}
                      >
                        ${formatPrice(orderItem.total)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Properties */}
                <View>{renderSelectedProperties(orderItem)}</View>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Information */}
        {order?.client_data && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <User color={theme.primary} size={20} />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Customer Information
              </Text>
            </View>

            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 16,
                padding: 16,
                gap: 16,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <User color={theme.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Full Name
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                    }}
                  >
                    {order?.client_data.first_name}{' '}
                    {order?.client_data.last_name}
                  </Text>
                </View>
              </View>

              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Phone color={theme.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Phone Number
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${order?.client_data?.phone_number}`)
                    }
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: 'PoppinsMedium',
                        color: theme.primary,
                      }}
                    >
                      {order?.client_data.phone_number}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Mail color={theme.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Email Address
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`mailto:${order?.client_data?.email}`)
                    }
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: 'PoppinsMedium',
                        color: theme.primary,
                      }}
                      numberOfLines={1}
                    >
                      {order?.client_data.email}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <MapPin color={theme.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Delivery Address
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                      lineHeight: 20,
                    }}
                  >
                    {order?.client_data.address}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <CreditCard color={theme.primary} size={20} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'FredokaMedium',
                color: theme.text,
              }}
            >
              Payment Details
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  fontFamily: 'FredokaMedium',
                }}
              >
                Payment Method
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'PoppinsMedium',
                  color: theme.text,
                }}
              >
                {order?.payment_method?.replace('_', ' ') || 'N/A'}
              </Text>
            </View>

            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                Payment Status
              </Text>
              <View
                style={{
                  backgroundColor: paymentConfig.color + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: paymentConfig.color,
                  }}
                >
                  {paymentConfig.label}
                </Text>
              </View>
            </View> */}

            <View
              style={{
                height: 1,
                backgroundColor: theme.border,
                marginVertical: 4,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  fontFamily: 'FredokaMedium',
                }}
              >
                Subtotal
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'PoppinsMedium',
                  color: theme.text,
                }}
              >
                ${formatPrice(order?.total_price || 0)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTopWidth: 2,
                borderTopColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'PoppinsMedium',
                  color: theme.primary,
                }}
              >
                ${formatPrice(order?.total_price || 0)}{' '}
                {order?.currency || 'USD'}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Receipt color={theme.primary} size={20} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'FredokaMedium',
                color: theme.text,
              }}
            >
              Order Timeline
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {order?.created_at && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.primary,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Order Created
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                    }}
                  >
                    {formatDateTime(order?.created_at)}
                  </Text>
                </View>
              </View>
            )}

            {order?.date_trx && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.success,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Transaction Date
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.text,
                    }}
                  >
                    {formatDateTime(order?.date_trx)}
                  </Text>
                </View>
              </View>
            )}

            {order?.updated_at && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.info,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Delivered/Completed
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                    }}
                  >
                    {formatDateTime(order?.updated_at)}
                  </Text>
                </View>
              </View>
            )}

            {order?.expiry && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.warning,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Expires On
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                    }}
                  >
                    {formatDateTime(order?.expiry)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* QR Code Section */}
        {/* {order?.qr_code_url && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Order QR Code
              </Text>
              <Image
                source={{ uri: handleImageSrc(order?.qr_code_url) }}
                style={{ width: 200, height: 200, borderRadius: 12 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: theme.textSecondary,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                Show this QR code for verification
              </Text>
            </View>
          </View>
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
}
