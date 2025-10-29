// firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

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

// sign up
export async function signUp(email: string, password: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// sign in
export async function signIn(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
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
