import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Tag, Copy, Check, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { usePromoCodesStore } from '@/stores/promoCodesStore';
import { useAlert } from '@/providers/AlertProvider';
import * as Clipboard from 'expo-clipboard';

export default function CouponsScreen() {
  const { theme } = useTheme();
  const { promoCodes, loadPromoCodes, isLoading } = usePromoCodesStore();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPromoCodes();
    setRefreshing(false);
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    showAlert('Copied!', `Code ${code} copied to clipboard`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getExpiryText = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    if (daysLeft < 7) return `${daysLeft} days left`;
    return `Valid until ${expiry.toLocaleDateString()}`;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary]}
        className="flex-1"
      >
        <View
          className="flex-row items-center px-6 py-4 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: theme.card }}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Coupons & Deals
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
              Save more on your orders
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          <View className="px-6 py-6 gap-4">
            {promoCodes.map((promo) => {
              const isExpired = new Date(promo.expires_at) < new Date();
              const isLimitReached =
                promo.usage_limit && promo.used_count >= promo.usage_limit;
              const isInactive = !promo.is_active || isExpired || isLimitReached;

              return (
                <TouchableOpacity
                  key={promo.id}
                  className="rounded-2xl overflow-hidden border-2"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: isInactive ? theme.border : theme.primary,
                    opacity: isInactive ? 0.6 : 1,
                  }}
                  activeOpacity={isInactive ? 1 : 0.7}
                  disabled={isInactive}
                >
                  <LinearGradient
                    colors={
                      isInactive
                        ? [theme.card, theme.card]
                        : [theme.primary + '15', theme.primary + '05']
                    }
                    className="p-5"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center gap-2 mb-2">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{ backgroundColor: theme.primary + '20' }}
                          >
                            <Tag color={theme.primary} size={20} />
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-lg font-bold"
                              style={{ color: theme.text }}
                            >
                              {promo.code}
                            </Text>
                          </View>
                        </View>
                        <Text
                          className="text-sm leading-5"
                          style={{ color: theme.textSecondary }}
                        >
                          {promo.description}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleCopyCode(promo.code)}
                        className="px-4 py-2 rounded-xl"
                        style={{ backgroundColor: theme.primary }}
                        disabled={isInactive}
                      >
                        {copiedCode === promo.code ? (
                          <Check color="#fff" size={20} />
                        ) : (
                          <Copy color="#fff" size={20} />
                        )}
                      </TouchableOpacity>
                    </View>

                    <View className="pt-3 border-t" style={{ borderTopColor: theme.border }}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Clock color={theme.textSecondary} size={16} />
                          <Text className="text-xs" style={{ color: theme.textSecondary }}>
                            {getExpiryText(promo.expires_at)}
                          </Text>
                        </View>
                        {promo.min_order_value > 0 && (
                          <Text className="text-xs" style={{ color: theme.textSecondary }}>
                            Min. order ${promo.min_order_value}
                          </Text>
                        )}
                      </View>
                      {isLimitReached && (
                        <View className="flex-row items-center gap-2 mt-2">
                          <AlertCircle color={theme.error} size={16} />
                          <Text className="text-xs" style={{ color: theme.error }}>
                            Usage limit reached
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
