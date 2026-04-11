/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/firebase / 클라이언트 초기화
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Firebase App 싱글톤 + Auth + Firestore 인스턴스.
 * 환경변수 미설정 시 null 반환 — 앱은 로컬 모드로 정상 동작.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/* ════════════════════════════════
   1. 환경변수 수집
   ════════════════════════════════ */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** 환경변수 전부 있는지 체크 — 하나라도 없으면 로컬 모드 */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

/* ════════════════════════════════
   2. 싱글톤 인스턴스 (lazy)
   ════════════════════════════════ */

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (_app) return _app;
  _app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  if (!app) return null;
  _auth = getAuth(app);
  return _auth;
}

export function getFirebaseDb(): Firestore | null {
  if (_db) return _db;
  const app = getFirebaseApp();
  if (!app) return null;
  _db = getFirestore(app);
  return _db;
}
