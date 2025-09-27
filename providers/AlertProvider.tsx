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

    // Auto dismiss after 3s
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

const Toast = ({ title, message, type }: Alert) => {
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start above the screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start fully transparent

  const bgColor =
    type === 'success'
      ? '#4CAF50'
      : type === 'error'
      ? '#F44336'
      : type === 'warning'
      ? '#FFC107'
      : '#2196F3';

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to original position
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide up and fade out after 3.5s
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
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  },
  toast: {
    minWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
    elevation: 90,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  message: {
    fontSize: 14,
    color: 'white',
    marginTop: 2,
  },
});
