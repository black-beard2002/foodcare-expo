import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '@/stores/orderStore';
import { useAlert } from '@/providers/AlertProvider';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

interface ScannedData {
  transaction_id: string;
  confirmation_code: string;
}

export default function QrScan() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { updateOrder, isLoading, confirmOrder } = useOrderStore();
  const { showAlert } = useAlert();
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!scanned) {
      try {
        const parsedData = JSON.parse(data) as ScannedData;
        setScanned(true);
        setScannedData(parsedData);
        if (parsedData.transaction_id && parsedData.confirmation_code) {
          const res = await updateOrder(parsedData.transaction_id, {
            status: 'COMPLETED',
            transaction_type: 'ORDER',
          });
          if (res.success) {
            showAlert('Success', res.message, 'success');
            if (res.data) {
              await confirmOrder(res.data.id, res.data.tenant_id!);
            }
          } else {
            showAlert('Error', res.message, 'error');
          }
          router.replace('/(tabs)/order_history');
        }
      } catch (err) {
        console.error('Invalid QR Code:', err);
      }
    }
  };

  // ✅ Properly render permission / camera UI
  if (!permission) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.messageText, { color: theme.text }]}>
          Requesting camera permission...
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, { color: theme.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
            We need access to your camera to scan QR codes.
          </Text>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={requestPermission}
          >
            <Text
              style={[
                styles.permissionButtonText,
                { color: theme.textInverse },
              ]}
            >
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {Platform.OS === 'android' && <StatusBar hidden />}

      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>Processing...</Text>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Scan QR Code
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Position the QR code within the frame
        </Text>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            <View
              style={[
                styles.overlaySection,
                { backgroundColor: theme.overlay },
              ]}
            />
            <View style={styles.middleSection}>
              <View
                style={[
                  styles.overlaySection,
                  { backgroundColor: theme.overlay },
                ]}
              />
              <View style={styles.scanArea}>
                <View
                  style={[styles.cornerTopLeft, { borderColor: theme.primary }]}
                />
                <View
                  style={[
                    styles.cornerTopRight,
                    { borderColor: theme.primary },
                  ]}
                />
                <View
                  style={[
                    styles.cornerBottomLeft,
                    { borderColor: theme.primary },
                  ]}
                />
                <View
                  style={[
                    styles.cornerBottomRight,
                    { borderColor: theme.primary },
                  ]}
                />
                {!scanned && (
                  <View style={styles.scanLineContainer}>
                    <View
                      style={[
                        styles.scanLine,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.overlaySection,
                  { backgroundColor: theme.overlay },
                ]}
              />
            </View>
            <View
              style={[
                styles.overlaySection,
                { backgroundColor: theme.overlay },
              ]}
            />
          </View>
        </CameraView>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.surface }]}>
        {scanned ? (
          <View style={styles.scannedContainer}>
            <Text style={[styles.scannedLabel, { color: theme.success }]}>
              ✓ Scanned Successfully
            </Text>
            <Text
              style={[styles.scannedData, { color: theme.textSecondary }]}
              numberOfLines={2}
              ellipsizeMode="middle"
            >
              {scannedData?.confirmation_code}
            </Text>
            <TouchableOpacity
              style={[
                styles.scanAgainButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => setScanned(false)}
            >
              <Text
                style={[
                  styles.scanAgainButtonText,
                  { color: theme.textInverse },
                ]}
              >
                Scan Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Align QR code within the frame to scan
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, textAlign: 'center' },
  cameraContainer: { flex: 1, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  overlaySection: { flex: 1, opacity: 0.6 },
  middleSection: { flexDirection: 'row', height: SCAN_AREA_SIZE },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLineContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    alignItems: 'center',
  },
  scanLine: { width: '80%', height: 2, opacity: 0.8 },
  footer: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  footerText: { fontSize: 14, textAlign: 'center' },
  scannedContainer: { alignItems: 'center', width: '100%' },
  scannedLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  scannedData: {
    fontSize: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  scanAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  scanAgainButtonText: { fontSize: 16, fontWeight: '600' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  permissionButtonText: { fontSize: 16, fontWeight: '600' },
  messageText: { fontSize: 16 },
});
