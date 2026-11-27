import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getRemoteConfig } from 'firebase/remote-config';
import { initializeAppCheck, CustomProvider, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dev-placeholder-key-not-secret',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fieldguard-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fieldguard-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fieldguard-ai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here'
);

// Enable debug token for local development when configured
if (typeof window !== 'undefined' && import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
  // @ts-expect-error FIREBASE_APPCHECK_DEBUG_TOKEN exists on window in dev
  window.FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN === 'true'
      ? true
      : import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize App Check immediately after app initialization (before auth, db, and ai)
// DEV mode: use debug token from .env.local  |  PROD mode: use reCAPTCHA v3
if (typeof window !== 'undefined') {
  try {
    if (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
      // Development: Firebase SDK debug-token flow
      initializeAppCheck(app, {
        provider: new CustomProvider({
          getToken: () =>
            Promise.resolve({
              token: 'debug-token-active',
              expireTimeMillis: Date.now() + 60 * 60 * 1000,
            }),
        }),
        isTokenAutoRefreshEnabled: true,
      });
    } else if (import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY) {
      // Production: reCAPTCHA v3 provider for live site
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (err) {
    console.warn('App Check init skipped in current context:', err);
  }
}

export const auth = getAuth(app);
function createDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // Firestore was already initialized (e.g. Vite hot reload): reuse it.
    return getFirestore(app);
  }
}

export const db = createDb();
export const remoteConfig = getRemoteConfig(app);

// Initialize Firebase AI Logic with Gemini Developer API backend
export const ai = getAI(app, { backend: new GoogleAIBackend() });
