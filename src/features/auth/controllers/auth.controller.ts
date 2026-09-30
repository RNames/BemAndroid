import { useState, useEffect, useCallback } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { UserProfile } from '../models/User.model';

const GOOGLE_WEB_CLIENT_ID =
  '8000692687-lo37deu66jaij1fc0qvt6236bcb3goea.apps.googleusercontent.com';

// Konfigurasi Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authenticating: boolean;
  error: string | null;
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUserProfile: (data: {
    displayName?: string;
    photoUrl?: string;
  }) => Promise<boolean>;
}

// ─── Module-Level Singleton Cache & Synchronizer ────────────
let cachedUser: FirebaseAuthTypes.User | null = auth().currentUser;
let cachedUserProfile: UserProfile | null = null;
let cachedLoading: boolean = !!cachedUser && !cachedUserProfile;
let authListenerInitialized = false;

const authSubscribers = new Set<() => void>();

function notifyAuthSubscribers() {
  authSubscribers.forEach(callback => callback());
}

async function syncUserProfileGlobal(fbUser: FirebaseAuthTypes.User) {
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'admin_users', fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    const now = Date.now();

    if (userDoc.exists()) {
      const existingData = userDoc.data() as UserProfile;
      updateDoc(userDocRef, { lastLogin: now }).catch(console.error);

      cachedUserProfile = {
        ...existingData,
        displayName: fbUser.displayName || existingData.displayName || 'User',
        email: fbUser.email || existingData.email || '',
        photoUrl: fbUser.photoURL || existingData.photoUrl,
        lastLogin: now,
      };
    } else {
      const newProfile: UserProfile = {
        id: fbUser.uid,
        displayName: fbUser.displayName || 'User',
        email: fbUser.email || '',
        photoUrl: fbUser.photoURL || undefined,
        role: 'user',
        createdAt: now,
        lastLogin: now,
      };

      await setDoc(userDocRef, newProfile);
      cachedUserProfile = newProfile;
    }
  } catch (err) {
    console.error('[AuthController] Sync user profile error:', err);
  } finally {
    cachedLoading = false;
    notifyAuthSubscribers();
  }
}

function initAuthGlobalListener() {
  if (authListenerInitialized) {
    return;
  }
  authListenerInitialized = true;

  auth().onAuthStateChanged(async fbUser => {
    cachedUser = fbUser;
    if (fbUser) {
      cachedLoading = !cachedUserProfile;
      notifyAuthSubscribers();
      await syncUserProfileGlobal(fbUser);
    } else {
      cachedUserProfile = null;
      cachedLoading = false;
      notifyAuthSubscribers();
    }
  });

  if (cachedUser && !cachedUserProfile) {
    syncUserProfileGlobal(cachedUser);
  }
}

export const useAuthController = (): [AuthState, AuthActions] => {
  initAuthGlobalListener();

  const [, setTick] = useState(0);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    authSubscribers.add(update);
    return () => {
      authSubscribers.delete(update);
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthenticating(true);
      setError(null);

      // Pastikan Play Services tersedia
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Ambil credential Google Sign In
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken;
      let accessToken: string | undefined;

      try {
        const tokens = await GoogleSignin.getTokens();
        idToken = idToken || tokens.idToken;
        accessToken = tokens.accessToken;
      } catch (tokenErr) {
        console.warn('[AuthController] getTokens warning:', tokenErr);
      }

      if (!idToken) {
        throw new Error('Gagal mendapatkan ID Token dari Google.');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      if (userCredential.user) {
        cachedUser = userCredential.user;
        cachedLoading = true;
        notifyAuthSubscribers();
        await syncUserProfileGlobal(userCredential.user);
      }
    } catch (err: any) {
      const message =
        err?.message || 'Terjadi kesalahan saat masuk dengan Google.';
      console.error('[AuthController] signInWithGoogle error:', err);
      if (err?.code !== 'ASYNC_OP_IN_PROGRESS' && err?.code !== '12501') {
        setError(message);
      }
    } finally {
      setAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      cachedLoading = true;
      notifyAuthSubscribers();
      await GoogleSignin.signOut().catch(() => {});
      await auth().signOut();
      cachedUser = null;
      cachedUserProfile = null;
    } catch (err) {
      console.error('[AuthController] signOut error:', err);
    } finally {
      cachedLoading = false;
      notifyAuthSubscribers();
    }
  }, []);

  const updateUserProfile = useCallback(
    async (data: { displayName?: string; photoUrl?: string }): Promise<boolean> => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('Pengguna belum masuk.');
        }

        const updates: { displayName?: string; photoURL?: string } = {};
        if (data.displayName !== undefined) {
          updates.displayName = data.displayName;
        }
        if (data.photoUrl !== undefined) {
          updates.photoURL = data.photoUrl;
        }

        // 1. Update Firebase Auth Profile
        await currentUser.updateProfile(updates);

        // 2. Update Firestore document /admin_users/{userId}
        const db = getFirestore();
        const userDocRef = doc(db, 'admin_users', currentUser.uid);
        const firestoreUpdates: Record<string, any> = {
          updatedAt: Date.now(),
        };
        if (data.displayName !== undefined) {
          firestoreUpdates.displayName = data.displayName;
        }
        if (data.photoUrl !== undefined) {
          firestoreUpdates.photoUrl = data.photoUrl;
        }

        await updateDoc(userDocRef, firestoreUpdates);

        // 3. Update cached state and notify subscribers
        if (cachedUserProfile) {
          cachedUserProfile = {
            ...cachedUserProfile,
            ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
            ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
          };
        }
        cachedUser = auth().currentUser;
        notifyAuthSubscribers();
        return true;
      } catch (err: any) {
        console.error('[AuthController] updateUserProfile error:', err);
        setError(err?.message || 'Gagal memperbarui profil.');
        return false;
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return [
    {
      user: cachedUser,
      userProfile: cachedUserProfile,
      loading: cachedLoading,
      authenticating,
      error,
    },
    { signInWithGoogle, signOut, clearError, updateUserProfile },
  ];
};
