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
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      primary: '#FF6B35',
      fill: '#ff6b35d3',
      background: '#FFFFFF',
      text: '#1A1A1A',
      inactive: '#8E8E93',
    },
    dark: {
      primary: '#FF6B35',
      fill: '#ff6b35d2',
      background: '#000000',
      text: '#FFFFFF',
      inactive: '#8E8E93',
    },
  };

  const theme = colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
          height: 80,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.inactive,
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
              fill={focused ? theme.fill : 'none'}
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
              fill={focused ? theme.fill : 'none'}
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
              fill={focused ? theme.fill : 'none'}
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
              fill={focused ? theme.fill : 'none'}
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
              fill={focused ? theme.fill : 'none'}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
