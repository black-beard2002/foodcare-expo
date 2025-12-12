import { ColorTheme } from '@/constants/theme';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Text, View } from 'react-native';

// Network Status Banner
const NetworkStatusBanner = ({
  isOffline,
  syncStatus,
  theme,
}: {
  isOffline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  theme: ColorTheme;
}) => {
  if (!isOffline && syncStatus === 'idle') return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -50 }}
      transition={{ type: 'timing', duration: 300 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 25,
        paddingBottom: 5,
        paddingHorizontal: 20,
        backgroundColor: isOffline ? theme.error : theme.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {isOffline ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <WifiOff color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Offline Mode - Using cached data
          </Text>
        </View>
      ) : syncStatus === 'syncing' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <RefreshCw color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Syncing data...
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Wifi color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Back online - Data synced!
          </Text>
        </View>
      )}
    </MotiView>
  );
};
export default NetworkStatusBanner;
