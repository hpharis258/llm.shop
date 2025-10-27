import React from 'react';
import { CartItem, Page } from '../App';
import { TrashIcon } from './Icons';

interface CartPageProps {
  cartItems: CartItem[];
  onRemoveFromCart: (id: number) => void;
  onNavigate: (page: Page) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, onRemoveFromCart, onNavigate }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price), 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Your Cart is Empty</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Looks like you haven't added any creations yet. Let's find something for you!
        </p>
        <button
          onClick={() => onNavigate('popular')}
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
        >
          Browse Popular Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">Your Shopping Cart</h2>
      <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
          {cartItems.map((item) => (
            <li key={item.id} className="flex p-4 sm:p-6">
              <div className="flex-shrink-0">
                <img className="w-24 h-24 sm:w-32 sm:h-32 rounded-md object-cover" src={item.imageUrl} alt={item.title} />
              </div>
              <div className="ml-4 sm:ml-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.title}</h3>
                </div>
                <div className="flex-1 flex items-end justify-between text-sm">
                  <p className="text-xl font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">${item.price}</p>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.id)}
                      className="font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors p-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Shipping and taxes calculated at checkout.</p>
          <div className="mt-6">
            <button
              className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
            >
              Checkout
            </button>
          </div>
          <div className="mt-6 flex justify-center text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              or{' '}
              <button
                type="button"
                onClick={() => onNavigate('create')}
                className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)] dark:hover:text-[var(--color-primary-300)]"
              >
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;