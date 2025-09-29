import { Tabs } from 'expo-router';
import {
  Home,
  ShoppingCart,
  Grid3x3,
  User,
  History,
  Mailbox,
  HandPlatter,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          height: 80,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <Home
              color={color}
              fill={focused ? `${theme.primary}50` : 'none'}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, focused, size }) => (
            <HandPlatter
              color={color}
              fill={focused ? `${theme.primary}50` : 'none'}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused, size }) => (
            <ShoppingCart
              color={color}
              fill={focused ? `${theme.primary}50` : 'none'}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="order_history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused, size }) => (
            <Mailbox
              color={color}
              fill={focused ? `${theme.primary}50` : 'none'}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <User
              color={color}
              fill={focused ? `${theme.primary}50` : 'none'}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
