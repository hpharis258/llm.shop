import React from 'react';
import { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { title, price, imageUrl } = product;
  return (
    <div className="group relative bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex-grow">
          {title}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xl font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">${price}</p>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="bg-[var(--color-primary-600)] text-white p-2 rounded-full hover:bg-[var(--color-primary-700)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] dark:focus:ring-offset-slate-900"
            aria-label={`Add ${title} to cart`}
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
       <a href="#" onClick={(e) => { e.preventDefault(); onAddToCart(product); }} className="absolute inset-0" aria-label={`View ${title}`}></a>
    </div>
  );
};

export default ProductCard;