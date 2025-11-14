import { useTheme } from '@/hooks/useTheme';
import { AlertTriangle, Check, Info, X } from 'lucide-react-native';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface Alert {
  id: number;
  title: string;
  message?: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (title: string, message?: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used inside AlertProvider');
  return ctx;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (
    title: string,
    message?: string,
    type: AlertType = 'info'
  ) => {
    const id = Date.now();
    const newAlert: Alert = { id, title, message, type };
    setAlerts((prev) => [...prev, newAlert]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  };

  const handleAlertDismiss = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <View style={styles.container}>
        {alerts.map((alert) => (
          <Toast key={alert.id} alert={alert} onDismiss={handleAlertDismiss} />
        ))}
      </View>
    </AlertContext.Provider>
  );
};

const matteColors: Record<AlertType, string> = {
  success: '#2E7D32',
  error: '#C62828',
  warning: '#F9A825',
  info: '#1565C0',
};

const Toast = ({
  alert,
  onDismiss,
}: {
  alert: Alert;
  onDismiss: (id: number) => void;
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  const iconColor = matteColors[alert.type] || matteColors.info;

  const IconComponent = {
    success: Check,
    error: X,
    warning: AlertTriangle,
    info: Info,
  }[alert.type];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: theme.card,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View className="flex flex-row items-center gap-5">
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            className="mr-4 w-10 h-10 justify-center items-center rounded-md"
            style={{ backgroundColor: theme.background }}
          >
            <IconComponent color={iconColor} size={20} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              {alert.title}
            </Text>
            {alert.message ? (
              <Text style={[styles.message, { color: theme.textSecondary }]}>
                {alert.message}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDismiss(alert.id)}
          className="w-10 h-10 flex justify-center items-center"
        >
          <X size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  textContainer: {
    flex: 1,
  },

  toast: {
    width: '100%',
    maxWidth: 380,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',

    letterSpacing: 0.3,
  },
  message: {
    fontSize: 13,

    marginTop: 4,
    lineHeight: 18,
  },
});
