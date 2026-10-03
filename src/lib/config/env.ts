import Config from 'react-native-config';

/**
 * Native-injected at build time from .env* (see android/app/build.gradle's dotenv.gradle apply
 * and .env.example) — not JS-readable-and-tamperable at runtime the way a hardcoded constant or
 * an AsyncStorage-backed setting would be.
 */
export const API_BASE_URL: string = Config.API_BASE_URL ?? 'http://10.0.2.2:8080';

if (__DEV__ && !Config.API_BASE_URL) {
  console.warn('[env] API_BASE_URL missing from native config — falling back to local dev default. ' +
    'Did you rebuild the native app after adding/changing .env? (JS-only reload is not enough.)');
}
