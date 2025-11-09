import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Product } from '../types';

interface ProductDisplayProps {
  imageUrl: string | null;
  title: string | null;
  isLoading: boolean;
  error: string | null;
  onStartOver: () => void;
  onAddToCart: (product: Product) => void;
  description?: string;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ imageUrl, title, isLoading, error, onStartOver, onAddToCart, description }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
        <h3 className="text-2xl font-bold text-red-800 dark:text-red-200">Oh no! Something went wrong.</h3>
        <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={onStartOver}
          className="mt-6 inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!imageUrl || !title) {
    return null;
  }
  
  const product: Product = {
      title,
      imageUrl,
      price: "29.99"
  }

  return (
    <div className=" ml-40 mr-40 bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
      <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-6">Your Creation is Ready!</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-3xl font-extrabold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] mt-2">${product.price}</p>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            {description}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => onAddToCart(product)}
                className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]">
              Add to Cart
            </button>
            <button
              onClick={onStartOver}
              className="w-full inline-flex items-center justify-center px-8 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
