import { DeviceEventEmitter, EmitterSubscription } from 'react-native';

export const AUTH_EVENTS = {
  TOKEN_REFRESHED: 'auth:token_refreshed',
  LOGOUT: 'auth:logout',
} as const;

export const emitAuthEvent = (eventName: string, data?: any): void => {
  DeviceEventEmitter.emit(eventName, data);
};

export const subscribeToAuthEvents = (
  eventName: string,
  callback: (data: any) => void
): (() => void) => {
  const subscription: EmitterSubscription = DeviceEventEmitter.addListener(
    eventName,
    callback
  );

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};
