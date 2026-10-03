import ReactNativeBiometrics from 'react-native-biometrics';

/**
 * App-level re-lock gate, independent of Keychain access (see secureStorage.ts for why). Shown
 * whenever the app is authenticated but was backgrounded — device owner must re-prove presence
 * before the UI un-blurs, similar to Instagram/WhatsApp's optional app-lock.
 */
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export const biometricLock = {
  async isSensorAvailable(): Promise<boolean> {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch {
      return false;
    }
  },

  async authenticate(promptMessage: string = 'Unlock Matrimony'): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({ promptMessage });
      return success;
    } catch {
      return false;
    }
  },
};
