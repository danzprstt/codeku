// src/lib/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, User,
  deleteUser, reauthenticateWithCredential, EmailAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile, getUserProfile, updateLastLogin, deleteUserData, UserProfile } from './firestore';
import { checkRateLimit } from './crypto';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
        await updateLastLogin(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    if (!checkRateLimit(`login_${email}`, 5, 60000)) {
      throw new Error('Terlalu banyak percobaan login. Tunggu 1 menit.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(cred.user.uid);
    if (profile && !profile.isActive) throw new Error('Akun dinonaktifkan.');
    setUserProfile(profile);
  };

  const register = async (email: string, username: string, password: string) => {
    if (!checkRateLimit(`register_${email}`, 3, 300000)) {
      throw new Error('Terlalu banyak pendaftaran. Tunggu 5 menit.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await createUserProfile(cred.user.uid, { uid: cred.user.uid, username, email }, password);
    const profile = await getUserProfile(cred.user.uid);
    setUserProfile(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const deleteAccount = async (password: string) => {
    if (!user) throw new Error('Tidak ada user yang login.');
    const cred = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, cred);
    await deleteUserData(user.uid);
    await deleteUser(user);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout, deleteAccount, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
