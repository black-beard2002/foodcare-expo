import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';

export default function HelpCenterScreen() {
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'To reset your password, go to the login screen and tap "Forgot Password". Follow the instructions sent to your email to create a new password.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'You can track your order in the "Order History" section. Each order has a tracking status that shows its current delivery stage.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept credit/debit cards, digital wallets, and cash on delivery. All payments are processed securely.',
    },
    {
      question: 'How do I cancel an order?',
      answer:
        'Orders can be cancelled within 30 minutes of placement from the Order History section. After that, please contact support.',
    },
    {
      question: 'Is my personal information secure?',
      answer:
        'Yes, we use industry-standard encryption and security measures to protect your personal and payment information.',
    },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      details: 'support@foodapp.com',
      color: '#3B82F6',
      action: () => Linking.openURL('mailto:support@foodapp.com'),
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call our support team',
      details: '+1 (555) 123-4567',
      color: '#10B981',
      action: () => Linking.openURL('tel:+15551234567'),
    },
  ];

  const resources = [
    {
      icon: FileText,
      title: 'Terms of Service',
      color: '#8B5CF6',
      action: () => Linking.openURL('https://yourapp.com/terms'),
    },
    {
      icon: FileText,
      title: 'Privacy Policy',
      color: '#EC4899',
      action: () => Linking.openURL('https://yourapp.com/privacy'),
    },
    {
      icon: FileText,
      title: 'Community Guidelines',
      color: '#F59E0B',
      action: () => Linking.openURL('https://yourapp.com/guidelines'),
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4 border-b"
        style={{ borderBottomColor: theme.border }}
      >
        <TouchableOpacity
          className="p-1"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color={theme.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold flex-1 text-center"
          style={{ color: theme.text }}
        >
          Help Center
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="my-6 rounded-3xl p-6 border shadow-sm"
          style={{
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}30`,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-14 h-14 rounded-2xl justify-center items-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <HelpCircle color={theme.primary} size={28} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: theme.text }}
              >
                How can we help?
              </Text>
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                We're here to assist you
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Contact Methods */}
        <Text
          className="text-sm font-semibold mb-3 uppercase tracking-wider px-1"
          style={{ color: theme.textSecondary }}
        >
          Get Help
        </Text>
        <View className="gap-3 mb-8">
          {contactMethods.map((method, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300, delay: index * 100 }}
            >
              <TouchableOpacity
                className="rounded-2xl p-5 border shadow-sm"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-4 mb-3">
                  <View
                    className="w-12 h-12 rounded-xl justify-center items-center"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    <method.icon
                      color={method.color}
                      size={24}
                      strokeWidth={2}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold mb-0.5"
                      style={{ color: theme.text }}
                    >
                      {method.title}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      {method.description}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between px-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: method.color }}
                  >
                    {method.details}
                  </Text>
                  <ExternalLink
                    color={method.color}
                    size={18}
                    strokeWidth={2}
                  />
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* FAQ Section */}
        <Text
          className="text-sm font-semibold mb-3 uppercase tracking-wider px-1"
          style={{ color: theme.textSecondary }}
        >
          Frequently Asked Questions
        </Text>
        <View
          className="rounded-2xl overflow-hidden border shadow-sm mb-8"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                className="flex-row justify-between items-center p-5"
                onPress={() => toggleFaq(index)}
                activeOpacity={0.7}
              >
                <Text
                  className="text-base font-semibold flex-1 mr-4"
                  style={{ color: theme.text }}
                >
                  {faq.question}
                </Text>
                <View
                  className="w-8 h-8 rounded-full justify-center items-center"
                  style={{
                    backgroundColor:
                      expandedFaq === index
                        ? `${theme.primary}20`
                        : theme.inputBackground,
                  }}
                >
                  {expandedFaq === index ? (
                    <Minus color={theme.primary} size={18} strokeWidth={2.5} />
                  ) : (
                    <Plus
                      color={theme.textSecondary}
                      size={18}
                      strokeWidth={2.5}
                    />
                  )}
                </View>
              </TouchableOpacity>
              <AnimatePresence>
                {expandedFaq === index && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'timing', duration: 200 }}
                    className="px-5 pb-5"
                  >
                    <View
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: `${theme.primary}08` }}
                    >
                      <Text
                        className="text-sm leading-6"
                        style={{ color: theme.textSecondary }}
                      >
                        {faq.answer}
                      </Text>
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
              {index < faqs.length - 1 && (
                <View
                  className="h-px mx-5"
                  style={{ backgroundColor: theme.border }}
                />
              )}
            </View>
          ))}
        </View>

        {/* Resources */}
        <Text
          className="text-sm font-semibold mb-3 uppercase tracking-wider px-1"
          style={{ color: theme.textSecondary }}
        >
          Resources
        </Text>
        <View
          className="rounded-2xl overflow-hidden border shadow-sm mb-8"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          {resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row justify-between items-center p-5 ${
                index < resources.length - 1 ? 'border-b' : ''
              }`}
              style={
                index < resources.length - 1
                  ? { borderBottomColor: theme.border }
                  : {}
              }
              onPress={resource.action}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1 gap-3">
                <View
                  className="w-10 h-10 rounded-xl justify-center items-center"
                  style={{ backgroundColor: `${resource.color}15` }}
                >
                  <resource.icon
                    color={resource.color}
                    size={20}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  className="text-base font-semibold flex-1"
                  style={{ color: theme.text }}
                >
                  {resource.title}
                </Text>
              </View>
              <ExternalLink
                color={theme.textSecondary}
                size={18}
                strokeWidth={2}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Info Card */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 500 }}
          className="mb-8 rounded-2xl p-5 border"
          style={{
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}30`,
          }}
        >
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: theme.text }}
          >
            Still need help?
          </Text>
          <Text
            className="text-xs leading-5"
            style={{ color: theme.textSecondary }}
          >
            Our support team is available 24/7 to assist you with any questions
            or concerns you may have.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
