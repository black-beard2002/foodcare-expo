import React, { useEffect, useState, useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { TimerIcon } from 'lucide-react-native';
import { formatCountdown, getCountdownColor } from '@/utils/helpers';

interface CountdownTimerProps {
  pickupStartTime: string;
  pickupEndTime: string;
  theme: any;
}

// Memoized countdown component to prevent unnecessary re-renders
const CountdownTimer = memo(
  ({ pickupStartTime, pickupEndTime, theme }: CountdownTimerProps) => {
    const end = useMemo(
      () => new Date(pickupEndTime).getTime(),
      [pickupEndTime]
    );
    const start = useMemo(
      () => new Date(pickupStartTime).getTime(),
      [pickupStartTime]
    );
    const totalDuration = useMemo(() => end - start, [end, start]);

    const [remaining, setRemaining] = useState(() => end - Date.now());

    useEffect(() => {
      // Initial check
      if (remaining <= 0) return;

      // Determine optimal update interval based on remaining time
      const getUpdateInterval = (ms: number) => {
        const minutes = ms / (1000 * 60);
        if (minutes <= 1) return 1000; // Update every second when < 1 min
        if (minutes <= 30) return 10000; // Every 10 seconds when urgent
        return 60000; // Every minute otherwise
      };

      let intervalId: number;

      const updateCountdown = () => {
        const newRemaining = end - Date.now();
        setRemaining(newRemaining);

        // Stop if expired
        if (newRemaining <= 0) {
          clearInterval(intervalId);
          return;
        }

        // Adjust interval if needed (e.g., when crossing thresholds)
        const currentInterval = getUpdateInterval(newRemaining);
        const nextInterval = getUpdateInterval(newRemaining - currentInterval);

        if (currentInterval !== nextInterval) {
          clearInterval(intervalId);
          intervalId = setInterval(updateCountdown, nextInterval);
        }
      };

      // Set initial interval
      intervalId = setInterval(updateCountdown, getUpdateInterval(remaining));

      return () => clearInterval(intervalId);
    }, [end]);

    const isExpired = remaining <= 0;
    const isUrgent = remaining <= 30 * 60 * 1000; // < 30 min

    // Memoize color and progress to avoid recalculation
    const color = useMemo(
      () => getCountdownColor(remaining, theme),
      [remaining, theme]
    );
    const progress = useMemo(
      () => Math.max(0, Math.min(1, remaining / totalDuration)),
      [remaining, totalDuration]
    );

    return (
      <MotiView
        from={{ opacity: 1 }}
        animate={{
          opacity: isUrgent && !isExpired ? [1, 0.3, 1] : 1,
        }}
        transition={{
          loop: isUrgent && !isExpired,
          duration: 800,
        }}
        style={{
          width: 90,
          padding: 8,
          borderRadius: 12,
          backgroundColor: color + '20',
          alignItems: 'center',
        }}
      >
        {/* Countdown */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <TimerIcon size={14} color={color} />
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'PoppinsMedium',
              color,
            }}
          >
            {formatCountdown(remaining)}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          style={{
            marginTop: 6,
            width: '100%',
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              backgroundColor: color,
            }}
          />
        </View>
      </MotiView>
    );
  }
);

CountdownTimer.displayName = 'CountdownTimer';

export default CountdownTimer;
