import { Tabs } from 'expo-router';
import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  BookMarked,
  Settings,
} from 'lucide-react-native';
import { View, Text, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/appStore';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const { cart } = useAppStore();

  const renderIcon = (
    Icon: any,
    focused: boolean,
    color: string,
    size: number,
    badge?: string,
    label?: string
  ) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 6,
      }}
    >
      <View style={{ position: 'relative' }}>
        <MotiView
          animate={{
            scale: focused ? 1 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
          }}
        >
          <Icon
            color={focused ? theme.primary : theme.tabBarInactive}
            size={26}
            fill={focused ? theme.primary : 'none'}
            strokeWidth={focused ? 2.5 : 2}
          />
        </MotiView>

        {badge && (
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            style={{
              position: 'absolute',
              top: -6,
              right: -8,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 5,
              borderWidth: 2,
              borderColor: theme.tabBarBackground,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {badge}
            </Text>
          </MotiView>
        )}
      </View>

      {/* Active Indicator Dot */}
      {focused && (
        <View
          style={{
            width: 5,
            position: 'absolute',
            bottom: -5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: theme.primary,
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
          position: 'absolute',
          bottom: 20,
          width: '90%',
          backgroundColor: theme.tabBarBackground + 'FF',
          height: 65,
          borderRadius: 24,
          marginHorizontal: '5%',
          borderTopWidth: 0,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
          paddingBottom: 10,
          paddingTop: 10,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              borderRadius: 24,
              overflow: 'hidden',
            }}
          >
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={isDark ? 80 : 40}
                tint={isDark ? 'dark' : 'light'}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}
          </View>
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(Home, focused, color, size, undefined, 'Home'),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(
              UtensilsCrossed,
              focused,
              color,
              size,
              undefined,
              'Menu'
            ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(
              ShoppingCart,
              focused,
              color,
              size,
              cart.length > 0 ? String(cart.length) : undefined,
              'Cart'
            ),
        }}
      />
      <Tabs.Screen
        name="order_history"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(BookMarked, focused, color, size, undefined, 'Orders'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            renderIcon(Settings, focused, color, size, undefined, 'Settings'),
        }}
      />
    </Tabs>
  );
}
