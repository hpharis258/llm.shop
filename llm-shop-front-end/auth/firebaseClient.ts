// firebaseClient.ts
import { initializeApp } from "firebase/app";
import {signOut, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";

// Vite exposes env vars via import.meta.env and requires a VITE_ prefix for client-visible variables.
// Ensure your .env.local contains VITE_FIREBASE_API_KEY, VITE_AUTH_DOMAIN, VITE_PROJECT_ID, VITE_STORAGE_BUCKET, etc.
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_STORAGE_BUCKET as string | undefined,
  // optional: messagingSenderId, appId, etc. as VITE_ prefixed envs
};

// Debug: Log available env vars (remove this in production)
console.log('Available env vars:', {
  VITE_FIREBASE_API_KEY: !!env.VITE_FIREBASE_API_KEY,
  VITE_AUTH_DOMAIN: !!env.VITE_AUTH_DOMAIN,
  VITE_PROJECT_ID: !!env.VITE_PROJECT_ID,
  VITE_STORAGE_BUCKET: !!env.VITE_STORAGE_BUCKET
});

// Helpful runtime checks so missing envs fail fast with a clear message
const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  // Don't crash the bundler — throw at runtime so the developer sees the error in the browser console.
  console.error(`Missing Firebase env vars: ${missing.join(', ')}. Make sure they are set in .env.local with the VITE_ prefix and restart the dev server.`);
}

console.log('Firebase config loaded (keys hidden)');
export const app = initializeApp({
  apiKey: firebaseConfig.apiKey || '',
  authDomain: firebaseConfig.authDomain || '',
  projectId: firebaseConfig.projectId || '',
  storageBucket: firebaseConfig.storageBucket || '',
});
export const auth = getAuth(app);

// Firebase error codes and their user-friendly messages
const AUTH_ERROR_MESSAGES: { [key: string]: string } = {
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
  'auth/weak-password': 'Password is too weak. It must be at least 6 characters long and contain a non-alphanumeric character.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-credential': 'Invalid login credentials',
  'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'PASSWORD_DOES_NOT_MEET_REQUIREMENTS': 'Password must contain at least one non-alphanumeric character (e.g., !@#$%^&*)'
};

// Helper function to get user-friendly error message
function getAuthErrorMessage(error: any): string {
  console.error('Auth error:', error);
  
  // Handle specific Firebase error codes
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  
  // Handle password requirement errors
  if (error.message?.includes('PASSWORD_DOES_NOT_MEET_REQUIREMENTS')) {
    return AUTH_ERROR_MESSAGES['PASSWORD_DOES_NOT_MEET_REQUIREMENTS'];
  }

  // Default error message
  return 'An error occurred during authentication. Please try again.';
}

// sign up with enhanced error handling
export async function signUp(email: string, password: string) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return { 
      user: userCred.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: getAuthErrorMessage(error)
    };
  }
}

// sign in with enhanced error handling
export async function signIn(email: string, password: string) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCred.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: getAuthErrorMessage(error)
    };
  }
}

// get the current ID token (refreshes automatically if expired)
export async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  // forceRefresh = false -> returns cached token if valid, otherwise refreshes
  return await user.getIdToken(/* forceRefresh= */ false);
}

// Example API call helper
export async function callApi(path: string, body?: any) {
  const token = await getIdToken();
  const res = await fetch(`/api${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    // Option: you can set provider.addScope('profile') / provider.addScope('email') if needed
    const userCred = await signInWithPopup(auth, provider);
    return {
      user: userCred.user,
      error: null
    };
  } catch (error: any) {
    // Fallback: if popup blocked you could use signInWithRedirect(auth, provider)
    return {
      user: null,
      error: getAuthErrorMessage(error)
    };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'sign_out_failed' };
  }
}

export async function resetPassword(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (e: any) {
    const msg =
      e?.code === 'auth/user-not-found'
        ? 'No user found with that email.'
        : e?.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : 'Could not send reset email. Please try again.';
    return { ok: false, error: msg };
  }
}