import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, initializeAuth } from 'firebase/auth';
// @ts-expect-error - getReactNativePersistence is exported by the RN build that Metro
// resolves at runtime, but the shipped types for this import path don't declare it.
import { getReactNativePersistence } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyA_Avgffid_W3vNna8ZPwLh0nRScIcNZ6o',
  authDomain: 'hairquick-8f72b.firebaseapp.com',
  projectId: 'hairquick-8f72b',
  storageBucket: 'hairquick-8f72b.appspot.com',
  messagingSenderId: '975215169664',
  appId: '1:975215169664:web:21440a5fd697c641741665',
  measurementId: 'G-P5XKHEF4WJ',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// initializeAuth throws if called more than once for the same app (e.g. on Fast
// Refresh re-executing this module), so fall back to the already-initialized instance.
export const auth = (() => {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
})();

export const db = getFirestore(app);
export const storage = getStorage(app);

// The device needs the dev machine's actual address to reach the local Firebase
// emulators — "localhost" on a physical device means the phone itself. Expo's dev
// server URI (e.g. "192.168.1.5:8081") already carries whichever IP the device
// used to load the JS bundle, so reuse that when it's a real IP (not a tunnel
// hostname, which can't proxy arbitrary emulator ports). FALLBACK_LAN_IP is used
// when that URI isn't available — update it if the dev machine's address changes.
const FALLBACK_LAN_IP = '192.168.1.105';

function resolveEmulatorHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  const isIPv4 = !!host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (isIPv4) return host;

  if (Platform.OS === 'android' && !Device.isDevice) {
    return '10.0.2.2'; // Android emulator's alias for the host loopback interface.
  }

  // Physical devices have no route to "localhost" (that's the phone itself).
  return FALLBACK_LAN_IP;
}

const EMULATOR_HOST = resolveEmulatorHost();

if (__DEV__) {
  console.log('[firebase] Connecting to emulators at', EMULATOR_HOST, '(hostUri:', Constants.expoConfig?.hostUri, ')');

  // Both throw if called more than once on the same instance (e.g. Fast Refresh
  // re-executing this module), so swallow that specific case.
  try {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
  } catch {}
  try {
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
  } catch {}
  try {
    connectStorageEmulator(storage, EMULATOR_HOST, 9199);
  } catch {}
}