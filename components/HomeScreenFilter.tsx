import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { X, Check, DollarSign, Star, Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, fontSize } from '@/constants/theme';
import { FilterOptions } from '@/types/appTypes';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
}: FilterModalProps) {
  const { theme } = useTheme();

  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [cuisine, setCuisine] = useState<string[]>([]);

  const priceOptions = ['$1-9', '$10-19', '$20-29', '$30+'];
  const ratingOptions = [4.5, 4.0, 3.5, 3.0];
  const deliveryOptions = ['Under 15 min', '15-30 min', '30-45 min', '45+ min'];
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'delivery_time', label: 'Fastest Delivery' },
  ];
  const cuisineOptions = [
    'American',
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Indian',
    'Thai',
    'Mediterranean',
    'French',
    'Korean',
  ];

  const toggleArrayOption = (
    value: string,
    array: string[],
    setter: (arr: string[]) => void
  ) => {
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleReset = () => {
    setPriceRange([]);
    setRating(null);
    setDeliveryTime([]);
    setSortBy('recommended');
    setCuisine([]);
  };

  const handleApply = () => {
    onApply({
      priceRange,
      rating,
      deliveryTime,
      sortBy,
      cuisine,
    });
    onClose();
  };

  const activeFiltersCount =
    priceRange.length +
    (rating ? 1 : 0) +
    deliveryTime.length +
    (sortBy !== 'recommended' ? 1 : 0) +
    cuisine.length;

  /** Sections for FlatList */
  const sections = [
    { key: 'sort', title: 'Sort By', type: 'sort' },
    { key: 'price', title: 'Price Range', type: 'price' },
    { key: 'rating', title: 'Minimum Rating', type: 'rating' },
    { key: 'delivery', title: 'Delivery Time', type: 'delivery' },
    { key: 'cuisine', title: 'Cuisine Type', type: 'cuisine' },
  ];

  const renderSection = ({ item }: { item: (typeof sections)[number] }) => {
    switch (item.type) {
      case 'sort':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <View
              style={[{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 5 }]}
            >
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor:
                        sortBy === option.value ? theme.primary : theme.card,
                      borderColor:
                        sortBy === option.value ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      {
                        color: sortBy === option.value ? '#FFFFFF' : theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && <Check color="#FFF" size={16} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'price':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign color={theme.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {item.title}
              </Text>
            </View>
            <View style={styles.chipContainer}>
              {priceOptions.map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: priceRange.includes(price)
                        ? theme.primary
                        : theme.card,
                      borderColor: priceRange.includes(price)
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() =>
                    toggleArrayOption(price, priceRange, setPriceRange)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: priceRange.includes(price)
                          ? '#FFFFFF'
                          : theme.text,
                      },
                    ]}
                  >
                    {price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'rating':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star color={theme.warning} size={20} fill={theme.warning} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {item.title}
              </Text>
            </View>
            <View style={styles.chipContainer}>
              {ratingOptions.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        rating === rate ? theme.warning : theme.card,
                      borderColor:
                        rating === rate ? theme.warning : theme.border,
                    },
                  ]}
                  onPress={() => setRating(rating === rate ? null : rate)}
                >
                  <Star
                    color={rating === rate ? '#FFF' : theme.warning}
                    size={14}
                    fill={rating === rate ? '#FFF' : theme.warning}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: rating === rate ? '#FFF' : theme.text },
                    ]}
                  >
                    {rate}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'delivery':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color={theme.info} size={20} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {item.title}
              </Text>
            </View>
            <View style={styles.chipContainer}>
              {deliveryOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: deliveryTime.includes(time)
                        ? theme.info
                        : theme.card,
                      borderColor: deliveryTime.includes(time)
                        ? theme.info
                        : theme.border,
                    },
                  ]}
                  onPress={() =>
                    toggleArrayOption(time, deliveryTime, setDeliveryTime)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: deliveryTime.includes(time)
                          ? '#FFF'
                          : theme.text,
                      },
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'cuisine':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <View style={styles.chipContainer}>
              {cuisineOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: cuisine.includes(type)
                        ? theme.primary
                        : theme.card,
                      borderColor: cuisine.includes(type)
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() => toggleArrayOption(type, cuisine, setCuisine)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: cuisine.includes(type) ? '#FFF' : theme.text,
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          {/* Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: theme.border }]}
          >
            <View style={styles.headerLeft}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Filters
              </Text>
              {activeFiltersCount > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.filterBadgeText}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={theme.text} size={24} />
            </TouchableOpacity>
          </View>

          {/* FlatList Content */}
          <FlatList
            data={sections}
            keyExtractor={(item) => item.key}
            renderItem={renderSection}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View
                style={[
                  styles.modalFooter,
                  {
                    borderTopColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={handleReset}
                >
                  <Text style={[styles.resetButtonText, { color: theme.text }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleApply}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Inter-Bold',
  },
  filterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Bold',
  },
  closeButton: { padding: spacing.sm },
  section: { padding: spacing.lg, borderBottomWidth: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.md,
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  chipText: { fontSize: fontSize.sm, fontFamily: 'Inter-Medium' },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: fontSize['2xs'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  sortOptionText: { fontSize: fontSize.base, fontFamily: 'Inter-Medium' },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: { fontSize: fontSize.base, fontFamily: 'Inter-SemiBold' },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
  },
});
