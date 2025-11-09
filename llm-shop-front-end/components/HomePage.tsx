import React, { useEffect, useState } from 'react';
// Fix: Correct the import path for the Page type.
import { Page } from '../types';
import { PencilIcon, SparklesIcon, ShoppingBagIcon } from './Icons';
import { fetchProducts, type ProductWithTitle } from '../services/fireStoreService';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<ProductWithTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchProducts(4);
        console.log('Fetched products:', items);
        if (mounted) setProducts(items);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const placeholder = (text: string) =>
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="#475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16px" fill="#e2e8f0">${text}</text></svg>`
    );

  return (
    <div className="space-y-20 sm:space-y-28 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Imagine It. <span className="text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)]">Create It.</span> Own It.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300">
          Welcome to the first marketplace powered by your imagination. Describe any product, and our AI will bring it to life, ready for you to purchase.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
          >
            Start Creating Now
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-12">
          As Easy As One, Two, Three
        </h2>
        <div className="grid dark:text-white md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900-50)] mx-auto mb-4">
              <PencilIcon className="w-8 h-8 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
            </div>
            <h3 className="text-xl font-bold">1. Describe Your Idea</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Simply write what you want to create. Be as specific or as creative as you like!
            </p>
          </div>
          <div className="text-center">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900-50)] mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
            </div>
            <h3 className="text-xl font-bold">2. AI-Powered Generation</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Our advanced AI generates a unique, high-quality product image based on your description.
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900-50)] mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
            </div>
            <h3 className="text-xl font-bold">3. Purchase & Ship</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Love your creation? Add it to your cart and we'll produce and ship your one-of-a-kind item.
            </p>
          </div>
        </div>
      </div>

      {/* Showcase Section */}
      <div>
        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-12">
         Latest Creations From Our Community
        </h2>

        {err && (
          <p className="text-center text-sm text-red-500">{err}</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(loading ? Array.from({ length: 4 }) : products).map((p: any, idx: number) => {
            const title = loading ? 'Loading…' : (p.title || p.name || 'Product');
            const src = loading
              ? placeholder('Loading…')
              : (p.printfulMockupUrl
 || placeholder(title));
            const key = loading ? idx : p.id || idx;
            return (
              <div key={key} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                <img src={src} alt={title} className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;