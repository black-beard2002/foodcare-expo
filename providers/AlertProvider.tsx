import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react-native';
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
  showAlert: (title: string, message: string, type?: AlertType) => void;
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
    message: string,
    type: AlertType = 'info'
  ) => {
    const id = Date.now();
    const newAlert: Alert = { id, title, message, type };
    setAlerts((prev) => [...prev, newAlert]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <View style={styles.container}>
        {alerts.map((alert) => (
          <Toast key={alert.id} {...alert} />
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

const Toast = ({ title, message, type }: Alert) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const bgColor = matteColors[type] || matteColors.info;

  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

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
          backgroundColor: bgColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.row}>
        <IconComponent color="#F5F5F5" size={22} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },

  toast: {
    width: '100%',
    maxWidth: 380,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
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
    color: '#F5F5F5',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 4,
    lineHeight: 18,
  },
});
