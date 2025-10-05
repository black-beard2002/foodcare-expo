import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Leaf, Zap, Clock, Plus, Heart } from 'lucide-react-native';
import { dummyItems } from '@/data/dummyData';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Item } from '@/types/appTypes';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const { theme } = useTheme();
  const { isFavorite, addToFavorites, removeFromFavorites } =
    useFavoritesStore();

  useEffect(() => {
    const foundItem = dummyItems.find((i) => i.id === id);
    setItem(foundItem || null);
  }, [id]);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Item not found
        </Text>
      </View>
    );
  }

  const handleFavoritePress = () => {
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(item);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ArrowLeft color={theme.textSecondary} size={24} />
        </TouchableOpacity>
      </View>
      <LinearGradient
        style={[{ flex: 1 }]}
        colors={[theme.background, theme.backgroundSecondary]}
        start={{ x: 0, y: 0 }} // top-left
        end={{ x: 1, y: 1 }} // bottom-right
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Image
            resizeMode="cover"
            source={item.image_url}
            style={styles.itemImage}
          />

          <TouchableOpacity
            onPress={handleFavoritePress}
            style={[
              {
                position: 'absolute',
                top: 10,
                right: 40,
                backgroundColor: isFavorite(id) ? theme.accent : theme.card,
                padding: 10,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Heart fill={isFavorite(id) ? 'white' : 'gray'} strokeWidth={0} />
          </TouchableOpacity>

          <View
            style={[styles.detailsContainer, { backgroundColor: theme.card }]}
          >
            <View style={styles.titleSection}>
              <Text style={[styles.itemName, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemPrice, { color: theme.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>

            <Text
              style={[styles.itemDescription, { color: theme.textSecondary }]}
            >
              {item.description}
            </Text>

            <View style={styles.badgesContainer}>
              {item.is_vegetarian && (
                <View
                  style={[styles.badge, { backgroundColor: theme.primary }]}
                >
                  <Leaf color={theme.primaryDark} size={16} />
                  <Text style={[styles.badgeText, { color: theme.text }]}>
                    Vegetarian
                  </Text>
                </View>
              )}
              {item.is_vegan && (
                <View
                  style={[styles.badge, { backgroundColor: theme.primary }]}
                >
                  <Leaf color={theme.primaryDark} size={16} />
                  <Text style={[styles.badgeText, { color: theme.text }]}>
                    Vegan
                  </Text>
                </View>
              )}
              {item.is_gluten_free && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: theme.text }]}>
                    Gluten Free
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.primary,
                  },
                ]}
              >
                <Zap color={theme.primaryDark} size={16} />
                <Text style={[styles.badgeText, { color: theme.text }]}>
                  {item.spice_level}
                </Text>
              </View>
            </View>

            <View style={styles.quickInfoContainer}>
              <View
                style={[
                  styles.quickInfoCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Clock color={theme.primary} size={24} />
                <Text
                  style={[
                    styles.quickInfoLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Prep Time
                </Text>
                <Text style={[styles.quickInfoValue, { color: theme.text }]}>
                  {item.prep_time} min
                </Text>
              </View>
              <View
                style={[
                  styles.quickInfoCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Zap color={theme.primary} size={24} />
                <Text
                  style={[
                    styles.quickInfoLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Calories
                </Text>
                <Text style={[styles.quickInfoValue, { color: theme.text }]}>
                  {item.calories}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Ingredients
              </Text>
              <View style={styles.ingredientsList}>
                {item.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    style={[
                      styles.ingredientItem,
                      {
                        backgroundColor: theme.secondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.ingredientText, { color: theme.text }]}
                    >
                      {ingredient}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Nutrition Facts
              </Text>
              <View
                style={[
                  styles.nutritionCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text
                      style={[
                        styles.nutritionLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Protein
                    </Text>
                    <Text
                      style={[styles.nutritionValue, { color: theme.text }]}
                    >
                      {item.nutrition_facts.protein}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text
                      style={[
                        styles.nutritionLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Carbs
                    </Text>
                    <Text
                      style={[styles.nutritionValue, { color: theme.text }]}
                    >
                      {item.nutrition_facts.carbs}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text
                      style={[
                        styles.nutritionLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Fat
                    </Text>
                    <Text
                      style={[styles.nutritionValue, { color: theme.text }]}
                    >
                      {item.nutrition_facts.fat}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text
                      style={[
                        styles.nutritionLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Fiber
                    </Text>
                    <Text
                      style={[styles.nutritionValue, { color: theme.text }]}
                    >
                      {item.nutrition_facts.fiber}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text
                      style={[
                        styles.nutritionLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Sugar
                    </Text>
                    <Text
                      style={[styles.nutritionValue, { color: theme.text }]}
                    >
                      {item.nutrition_facts.sugar}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text
                      style={[
                        styles.nutritionLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Sodium
                    </Text>
                    <Text
                      style={[styles.nutritionValue, { color: theme.text }]}
                    >
                      {item.nutrition_facts.sodium}mg
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  itemImage: {
    width: 250,
    height: 250,
    borderRadius: 100,
    marginHorizontal: 'auto',
  },
  detailsContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 30,
    padding: 24,
    paddingBottom: 10,
  },
  titleSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    flex: 1,
    lineHeight: 36,
  },
  itemPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  itemDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  quickInfoCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  quickInfoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  allergensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  allergenText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  nutritionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  nutritionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 100,
  },
});
