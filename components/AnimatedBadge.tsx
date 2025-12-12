import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

// Animated Badge Component
const AnimatedBadge = ({ count, color }: { count: number; color: string }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: color,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
};
export default AnimatedBadge;
