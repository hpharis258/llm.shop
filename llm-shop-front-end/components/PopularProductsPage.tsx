import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { useCart } from './contexts';
import {
  fetchProductsPage,
  type ProductWithTitle,
  type ProductsPageCursor,
} from '../services/fireStoreService';

function placeholderSvg(text: string) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23475569" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20px" fill="%23e2e8f0">${text}</text></svg>`;
}

const PAGE_SIZE = 6;

const PopularProductsPage: React.FC = () => {
  const { addToCart } = useCart();

  const [items, setItems] = useState<ProductWithTitle[]>([]);
  const [cursor, setCursor] = useState<ProductsPageCursor>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const toCardProduct = (p: ProductWithTitle): Product => ({
    title: p.title || p.name || 'Product',
    price: String(p.price ?? ''),
    description: p.description ?? '',
    imageUrl: p.printfulMockupUrl || (p as any).printfulMockupUrl || placeholderSvg(p.title || p.name || 'Product'),
  });

  const loadFirstPage = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchProductsPage(PAGE_SIZE);
      setItems(res.items);
      setCursor(res.cursor);
      setHasMore(res.hasMore);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setErr(null);
    try {
      const res = await fetchProductsPage(PAGE_SIZE, cursor);
      setItems(prev => [...prev, ...res.items]);
      setCursor(res.cursor);
      setHasMore(res.hasMore);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load more products');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const products: Product[] = items.map(toCardProduct);
  const skeletons = Array.from({ length: PAGE_SIZE });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <h2 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-4">
        Popular Creations
      </h2>
      <p className="text-center text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
        Discover and purchase unique products imagined by our community.
      </p>

      {err && <p className="text-center text-sm text-red-500 mb-4">{err}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 animate-pulse bg-slate-200 dark:bg-slate-700" />
            ))
          : products.map((product) => (
              <ProductCard
                key={`${product.title}-${product.imageUrl}`}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
      </div>

      {!loading && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PopularProductsPage;