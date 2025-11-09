import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  startAfter,            // add
  QueryDocumentSnapshot, // add
  DocumentData           // add
} from 'firebase/firestore';
import { app, auth } from '../auth/firebaseClient';

const db = getFirestore(app);
const PRODUCTS_COL = 'products';

export type Product = {
  id: string;

  // Core fields
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  createdByUserId?: string;
  createdAt?: Date;

  // Category matching (optional)
  categoryId?: number | string | null;
  categoryConfidence?: number | null;

  // Printful (optional)
  printfulProductId?: number;
  printfulVariantId?: number;
  printfulSyncProductId?: string;
  printfulMockupUrl?: string;

  attributes?: Record<string, string>;
};

// If some places use `title`, expose it as a getter
export type ProductWithTitle = Product & { title?: string };

// Timestamp helper
function tsToDate(v: any): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Timestamp) return v.toDate();
  if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);
  return undefined;
}

// Map a Firestore document to Product
function mapDoc(d: any): ProductWithTitle {
  const data = d.data?.() ?? d.data ?? {};
  const imageUrl =
    data.imageUrl ?? data.ImageUrl ??
    data.printfulMockupUrl ?? data.PrintfulMockupUrl ?? '';

  const p: ProductWithTitle = {
    id: d.id,
    name: data.name ?? data.Name ?? data.title ?? '',
    description: data.description ?? data.Description,
    imageUrl,
    price: data.price ?? data.Price,
    createdByUserId: data.createdByUserId ?? data.CreatedByUserId,
    createdAt: tsToDate(data.createdAt ?? data.CreatedAt),

    categoryId: data.categoryId ?? data.CategoryId ?? null,
    categoryConfidence: data.categoryConfidence ?? data.CategoryConfidence ?? null,

    printfulProductId: data.printfulProductId ?? data.PrintfulProductId,
    printfulVariantId: data.printfulVariantId ?? data.PrintfulVariantId,
    printfulSyncProductId: data.printfulSyncProductId ?? data.PrintfulSyncProductId,
    printfulMockupUrl: data.printfulMockupUrl ?? data.PrintfulMockupUrl,

    attributes: data.attributes ?? data.Attributes ?? {},
  };

  p.title = p.name;
  return p;
}

// Fetch all products (newest first) with fallbacks
export async function fetchProducts(max: number = 50): Promise<ProductWithTitle[]> {
  try {
    // Prefer PascalCase since your backend writes CreatedAt
    let q1 = query(collection(db, PRODUCTS_COL), orderBy('CreatedAt', 'desc'), limit(max));
    let snap = await getDocs(q1);
    if (!snap.empty) return snap.docs.map(mapDoc);

    // Fallback to lower camel
    let q2 = query(collection(db, PRODUCTS_COL), orderBy('createdAt', 'desc'), limit(max));
    snap = await getDocs(q2);
    if (!snap.empty) return snap.docs.map(mapDoc);

    // Last resort: unordered
    const all = await getDocs(collection(db, PRODUCTS_COL));
    return all.docs.slice(0, max).map(mapDoc);
  } catch {
    const all = await getDocs(collection(db, PRODUCTS_COL));
    return all.docs.slice(0, max).map(mapDoc);
  }
}

// Fetch by category with fallbacks
export async function fetchProductsByCategory(
  categoryId: number | string,
  max: number = 50
): Promise<ProductWithTitle[]> {
  try {
    let q1 = query(
      collection(db, PRODUCTS_COL),
      where('categoryId', '==', categoryId),
      orderBy('CreatedAt', 'desc'),
      limit(max)
    );
    let snap = await getDocs(q1);
    if (!snap.empty) return snap.docs.map(mapDoc);

    let q2 = query(
      collection(db, PRODUCTS_COL),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    snap = await getDocs(q2);
    if (!snap.empty) return snap.docs.map(mapDoc);

    // Equality-only fallback
    const q3 = query(collection(db, PRODUCTS_COL), where('categoryId', '==', categoryId), limit(max));
    snap = await getDocs(q3);
    return snap.docs.map(mapDoc);
  } catch {
    const q = query(collection(db, PRODUCTS_COL), where('categoryId', '==', categoryId), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  }
}

// Get a single product
export async function fetchProduct(id: string): Promise<ProductWithTitle | null> {
  const ref = doc(db, PRODUCTS_COL, id);
  const snap = await getDoc(ref);
  return snap.exists() ? mapDoc(snap) : null;
}

// Create a product
export async function addProduct(input: Partial<Product>): Promise<string> {
  const colRef = collection(db, PRODUCTS_COL);
  const payload = {
    // normalize to lowerCamelCase for writes
    name: input.name ?? '',
    description: input.description ?? '',
    imageUrl: input.imageUrl ?? '',
    price: input.price ?? 0,
    createdByUserId: input.createdByUserId ?? auth.currentUser?.uid ?? '',
    createdAt: serverTimestamp(),

    categoryId: input.categoryId ?? null,
    categoryConfidence: input.categoryConfidence ?? null,

    printfulProductId: input.printfulProductId ?? null,
    printfulVariantId: input.printfulVariantId ?? null,
    printfulSyncProductId: input.printfulSyncProductId ?? '',
    printfulMockupUrl: input.printfulMockupUrl ?? '',
    attributes: input.attributes ?? {},
  };

  const res = await addDoc(colRef, payload);
  return res.id;
}

// Update a product
export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, id);
  const payload: Record<string, any> = {
    ...patch,
    // when updating createdAt, keep it as date (don’t override unless provided)
  };
  await updateDoc(ref, payload);
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, id);
  await deleteDoc(ref);
}

// Realtime list subscription (prefer CreatedAt)
export function subscribeProducts(
  onUpdate: (products: ProductWithTitle[]) => void,
  max: number = 50
) {
  try {
    const q1 = query(collection(db, PRODUCTS_COL), orderBy('CreatedAt', 'desc'), limit(max));
    return onSnapshot(
      q1,
      (snap) => onUpdate(snap.docs.map(mapDoc)),
      (err) => {
        console.error('subscribeProducts error:', err);
      }
    );
  } catch {
    // Unordered fallback
    const q = query(collection(db, PRODUCTS_COL), limit(max));
    return onSnapshot(q, (snap) => onUpdate(snap.docs.map(mapDoc)));
  }
}

// Realtime single product subscription
export function subscribeProduct(
  id: string,
  onUpdate: (product: ProductWithTitle | null) => void
) {
  const ref = doc(db, PRODUCTS_COL, id);
  return onSnapshot(
    ref,
    (snap) => onUpdate(snap.exists() ? mapDoc(snap) : null),
    (err) => console.error('subscribeProduct error:', err)
  );
}

export type ProductsPageCursor = QueryDocumentSnapshot<DocumentData> | null;

export async function fetchProductsPage(
  pageSize = 6,
  cursor?: ProductsPageCursor
): Promise<{ items: ProductWithTitle[]; cursor: ProductsPageCursor; hasMore: boolean }> {
  try {
    // Prefer PascalCase CreatedAt (your backend writes this)
    let q1 = query(
      collection(db, PRODUCTS_COL),
      orderBy('CreatedAt', 'desc'),
      limit(pageSize)
    );
    if (cursor) q1 = query(q1, startAfter(cursor));
    let snap = await getDocs(q1);
    if (!snap.empty) {
      const items = snap.docs.map(mapDoc);
      const last = snap.docs[snap.docs.length - 1] ?? null;
      return { items, cursor: last, hasMore: snap.size === pageSize };
    }

    // Fallback to lower camel
    let q2 = query(
      collection(db, PRODUCTS_COL),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    if (cursor) q2 = query(q2, startAfter(cursor));
    snap = await getDocs(q2);
    const items2 = snap.docs.map(mapDoc);
    const last2 = snap.docs[snap.docs.length - 1] ?? null;
    return { items: items2, cursor: last2, hasMore: snap.size === pageSize };
  } catch {
    // Unordered fallback (no reliable pagination)
    const snap = await getDocs(query(collection(db, PRODUCTS_COL), limit(pageSize)));
    const items = snap.docs.map(mapDoc);
    const last = snap.docs[snap.docs.length - 1] ?? null;
    return { items, cursor: last, hasMore: false };
  }
}