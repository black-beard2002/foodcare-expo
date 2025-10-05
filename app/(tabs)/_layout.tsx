import { Tabs } from 'expo-router';
import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  BookMarked,
  Settings,
} from 'lucide-react-native';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { theme } = useTheme();

  const renderIcon = (
    Icon: any,
    focused: boolean,
    color: string,
    size: number
  ) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 40,
      }}
    >
      <View style={{ position: 'relative' }}>
        <Icon
          color={focused ? theme.primary : theme.tabBarInactive}
          fill={focused ? theme.primary : 'none'}
          size={size}
          strokeWidth={focused ? 2.5 : 2}
        />
      </View>
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: -8, // Position dot below the icon without affecting layout
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.primary, // Use theme color for dot
          }}
        />
      )}
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(Home, focused, color, size),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(UtensilsCrossed, focused, color, size),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(ShoppingCart, focused, color, size),
        }}
      />
      <Tabs.Screen
        name="order_history"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(BookMarked, focused, color, size),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(Settings, focused, color, size),
        }}
      />
    </Tabs>
  );
}
