// src/lib/firestore.ts
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, Timestamp,
  onSnapshot, increment, serverTimestamp, DocumentSnapshot,
  QueryDocumentSnapshot, writeBatch, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { encryptData, decryptData } from './crypto';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  encryptedPassword?: string; // stored encrypted for admin view
  role: 'user' | 'admin';
  createdAt: Timestamp;
  lastLogin: Timestamp;
  totalCodes: number;
  avatar?: string;
  bio?: string;
  website?: string;
  isActive: boolean;
}

export interface CodeSnippet {
  id: string;
  encryptedId: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  authorId: string;
  authorUsername: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views: number;
  likes: string[];
  forks: number;
  version: number;
  commits: CodeCommit[];
}

export interface CodeCommit {
  id: string;
  message: string;
  code: string;
  timestamp: Timestamp;
  authorId: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCodes: number;
  publicCodes: number;
  privateCodes: number;
  activeToday: number;
}

// ── User Operations ────────────────────────────────────────────────────────────
export async function createUserProfile(uid: string, data: Partial<UserProfile>, rawPassword?: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData: Partial<UserProfile> = {
    ...data,
    uid,
    role: 'user',
    totalCodes: 0,
    isActive: true,
    createdAt: serverTimestamp() as Timestamp,
    lastLogin: serverTimestamp() as Timestamp,
  };
  if (rawPassword) {
    userData.encryptedPassword = encryptData(rawPassword);
  }
  await setDoc(userRef, userData);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...data });
}

export async function updateLastLogin(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { lastLogin: serverTimestamp() });
}

// Admin: get all users
export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => {
    const data = d.data() as UserProfile;
    // Decrypt password for admin view
    if (data.encryptedPassword) {
      data.encryptedPassword = decryptData(data.encryptedPassword);
    }
    return data;
  });
}

export async function deleteUserData(uid: string): Promise<void> {
  const batch = writeBatch(db);
  // Delete user codes
  const codesSnap = await getDocs(query(collection(db, 'codes'), where('authorId', '==', uid)));
  codesSnap.docs.forEach(d => batch.delete(d.ref));
  // Delete user profile
  batch.delete(doc(db, 'users', uid));
  await batch.commit();
}

// ── Code Operations ────────────────────────────────────────────────────────────
export async function createCode(data: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'forks' | 'version' | 'commits'>): Promise<string> {
  const ref = doc(collection(db, 'codes'));
  const commitId = ref.id + '_v1';
  const snippet: Omit<CodeSnippet, 'id'> = {
    ...data,
    views: 0,
    likes: [],
    forks: 0,
    version: 1,
    commits: [{
      id: commitId,
      message: 'Initial commit',
      code: data.code,
      timestamp: serverTimestamp() as Timestamp,
      authorId: data.authorId,
    }],
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  await setDoc(ref, { ...snippet, id: ref.id });
  await updateDoc(doc(db, 'users', data.authorId), { totalCodes: increment(1) });
  return ref.id;
}

export async function getCode(id: string): Promise<CodeSnippet | null> {
  const snap = await getDoc(doc(db, 'codes', id));
  if (!snap.exists()) return null;
  await updateDoc(snap.ref, { views: increment(1) });
  return snap.data() as CodeSnippet;
}

export async function updateCode(id: string, data: Partial<CodeSnippet>, commitMsg?: string, authorId?: string): Promise<void> {
  const updates: any = { ...data, updatedAt: serverTimestamp(), version: increment(1) };
  if (commitMsg && data.code && authorId) {
    const commit: CodeCommit = {
      id: `${id}_${Date.now()}`,
      message: commitMsg,
      code: data.code,
      timestamp: Timestamp.now(),
      authorId,
    };
    updates.commits = arrayUnion(commit);
  }
  await updateDoc(doc(db, 'codes', id), updates);
}

export async function deleteCode(id: string, authorId: string): Promise<void> {
  await deleteDoc(doc(db, 'codes', id));
  await updateDoc(doc(db, 'users', authorId), { totalCodes: increment(-1) });
}

export async function getUserCodes(uid: string): Promise<CodeSnippet[]> {
  const snap = await getDocs(
    query(collection(db, 'codes'), where('authorId', '==', uid), orderBy('updatedAt', 'desc'))
  );
  return snap.docs.map(d => d.data() as CodeSnippet);
}

export async function getPublicCodes(pageSize = 20, lastDoc?: QueryDocumentSnapshot): Promise<CodeSnippet[]> {
  let q = query(
    collection(db, 'codes'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as CodeSnippet);
}

export async function toggleLike(codeId: string, userId: string, liked: boolean): Promise<void> {
  await updateDoc(doc(db, 'codes', codeId), {
    likes: liked ? arrayUnion(userId) : arrayRemove(userId),
  });
}

// Admin: get all codes
export async function getAllCodes(): Promise<CodeSnippet[]> {
  const snap = await getDocs(query(collection(db, 'codes'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => d.data() as CodeSnippet);
}

// ── Admin Stats ────────────────────────────────────────────────────────────────
export async function getAdminStats(): Promise<AdminStats> {
  const [usersSnap, codesSnap, publicSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'codes')),
    getDocs(query(collection(db, 'codes'), where('isPublic', '==', true))),
  ]);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const activeToday = usersSnap.docs.filter(d => {
    const data = d.data();
    return data.lastLogin?.toDate() > yesterday;
  }).length;

  return {
    totalUsers: usersSnap.size,
    totalCodes: codesSnap.size,
    publicCodes: publicSnap.size,
    privateCodes: codesSnap.size - publicSnap.size,
    activeToday,
  };
}

// ── Feedback ───────────────────────────────────────────────────────────────────
export async function submitFeedback(uid: string, username: string, message: string, type: string): Promise<void> {
  const ref = doc(collection(db, 'feedback'));
  await setDoc(ref, {
    id: ref.id, uid, username, message, type,
    createdAt: serverTimestamp(),
    status: 'pending',
  });
}
