import { useState, useEffect } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setUser(cred.user);
      return cred.user;
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(cred.user);
      return cred.user;
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setUser(cred.user);
      return cred.user;
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(err);
      setError(msg);
    }
  };

  return {
    user,
    loading,
    error,
    setError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  };
}

function getFriendlyErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled in Firebase Console. Please use Email/Password.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this corporate email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In popup was closed before completion.';
      case 'auth/popup-blocked':
        return 'Google Sign-In popup was blocked by browser. Please enable popups.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Check your internet connectivity.';
      default:
        return (err as { message?: string }).message || 'Authentication failed. Please try again.';
    }
  }
  return 'An unexpected authentication error occurred.';
}
