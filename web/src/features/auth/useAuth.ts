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
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export type TeamRole = 'manager' | 'member';
export type UserProfile = {
  uid: string;
  email: string;
  role: TeamRole;
  teamId: string | null;
  teamName: string | null;
  status: 'active' | 'disabled';
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let stopProfile: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      stopProfile?.();
      stopProfile = undefined;
      setProfile(null);
      if (currentUser) {
        stopProfile = onSnapshot(
          doc(db, 'users', currentUser.uid),
          (snapshot) => {
            setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null);
          },
          () => setProfile(null)
        );
      }
      setLoading(false);
    });
    return () => {
      stopProfile?.();
      unsubscribe();
    };
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
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email || email,
        role: 'member',
        teamId: null,
        teamName: null,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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

  const registerCorporate = async (email: string, pass: string, teamName: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const teamId = cred.user.uid;
      const inviteCode = Array.from(crypto.getRandomValues(new Uint8Array(5)))
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      await setDoc(doc(db, 'teams', teamId), {
        name: teamName.trim(),
        managerUid: cred.user.uid,
        inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'teamInvites', inviteCode), {
        teamId,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email || email,
        role: 'manager',
        teamId,
        teamName: teamName.trim(),
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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

  const joinTeam = async (email: string, pass: string, inviteCode: string) => {
    setError(null);
    setLoading(true);
    try {
      const code = inviteCode.trim().toUpperCase();
      const inviteSnap = await getDoc(doc(db, 'teamInvites', code));
      if (!inviteSnap.exists()) throw new Error('This team invite code is invalid.');
      const invite = inviteSnap.data();
      if (!invite.active || typeof invite.teamId !== 'string') {
        throw new Error('This team invite is no longer active.');
      }
      const teamSnap = await getDoc(doc(db, 'teams', invite.teamId));
      if (!teamSnap.exists()) throw new Error('The team for this invite could not be found.');
      const team = teamSnap.data();

      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email || email,
        role: 'member',
        teamId: invite.teamId,
        teamName: typeof team.name === 'string' ? team.name : null,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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
      const profileRef = doc(db, 'users', cred.user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid: cred.user.uid,
          email: cred.user.email || '',
          role: 'member',
          teamId: null,
          teamName: null,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
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
    profile,
    setError,
    loginWithEmail,
    registerWithEmail,
    registerCorporate,
    joinTeam,
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
