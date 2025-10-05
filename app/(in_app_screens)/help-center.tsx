// app/(tabs)/profile/help-center.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      action: () => Linking.openURL('mailto:support@foodapp.com'),
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call our support team',
      details: '+1 (555) 123-4567',
      action: () => Linking.openURL('tel:+15551234567'),
    },
    // {
    //   icon: MessageCircle,
    //   title: 'Live Chat',
    //   description: '24/7 live chat support',
    //   details: 'Available now',
    //   action: () => console.log('Open live chat'),
    // },
  ];

  const resources = [
    {
      icon: FileText,
      title: 'Terms of Service',
      action: () => Linking.openURL('https://yourapp.com/terms'),
    },
    {
      icon: FileText,
      title: 'Privacy Policy',
      action: () => Linking.openURL('https://yourapp.com/privacy'),
    },
    {
      icon: FileText,
      title: 'Community Guidelines',
      action: () => Linking.openURL('https://yourapp.com/guidelines'),
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Help Center
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Methods */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Get Help
        </Text>
        <View style={styles.contactGrid}>
          {contactMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.contactCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={method.action}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: `${theme.border}` },
                ]}
              >
                <method.icon color={theme.primary} size={24} />
              </View>
              <Text style={[styles.contactTitle, { color: theme.text }]}>
                {method.title}
              </Text>
              <Text
                style={[
                  styles.contactDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {method.description}
              </Text>
              <View style={styles.contactDetails}>
                <Text
                  style={[styles.contactDetailsText, { color: theme.primary }]}
                >
                  {method.details}
                </Text>
                <ExternalLink color={theme.primary} size={16} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text
          style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}
        >
          Frequently Asked Questions
        </Text>
        <View
          style={[
            styles.faqContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFaq(index)}
              >
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  {faq.question}
                </Text>
                {expandedFaq === index ? (
                  <Minus color={theme.primary} size={20} />
                ) : (
                  <Plus color={theme.primary} size={20} />
                )}
              </TouchableOpacity>
              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text
                    style={[
                      styles.faqAnswerText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {faq.answer}
                  </Text>
                </View>
              )}
              {index < faqs.length - 1 && (
                <View
                  style={[styles.faqDivider, { backgroundColor: theme.border }]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Resources */}
        <Text
          style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}
        >
          Resources
        </Text>
        <View
          style={[
            styles.resourcesContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              disabled
              style={[
                styles.resourceItem,
                index < resources.length - 1 && [
                  styles.resourceBorder,
                  { borderBottomColor: theme.border },
                ],
              ]}
              onPress={resource.action}
            >
              <View style={styles.resourceLeft}>
                <View
                  style={[
                    styles.resourceIconContainer,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <resource.icon color={theme.primary} size={20} />
                </View>
                <Text style={[styles.resourceText, { color: theme.text }]}>
                  {resource.title}
                </Text>
              </View>
              <ExternalLink color={theme.textSecondary} size={16} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  contactGrid: {
    gap: 12,
  },
  contactCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactDetailsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  faqContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    padding: 20,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  faqDivider: {
    height: 1,
    marginHorizontal: 20,
  },
  resourcesContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 60,
    elevation: 3,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  resourceBorder: {
    borderBottomWidth: 1,
  },
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
});
