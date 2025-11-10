import React from 'react';
import { Page } from '../types';
import { HeaderCartIcon } from './Icons';
import { useAuth, useCart } from './contexts';


interface HeaderProps {
    page: Page;
    setPage: (page: Page) => void;
    onLogout: () => void;
}

const NavLink: React.FC<{
    pageName: Page;
    currentPage: Page;
    setPage: (page: Page) => void;
    children: React.ReactNode;
    className?: string;
}> = ({ pageName, currentPage, setPage, children, className }) => {
    const isActive = pageName === currentPage;
    return (
        <button
            onClick={() => setPage(pageName)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                ? 'bg-[var(--color-primary-600)] text-white dark:bg-[var(--color-primary-500)]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            } ${className}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ page, setPage, onLogout }) => {
    const { isLoggedIn } = useAuth();
    const { cart } = useCart();
    const cartItemCount = cart.length;

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div 
                            className="flex-shrink-0 font-bold text-xl cursor-pointer text-slate-900 dark:text-white"
                            onClick={() => setPage('home')}
                        >
                            <span className="text-[var(--color-primary-500)]">your</span>choice<span className="text-slate-400">market</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink pageName="home" currentPage={page} setPage={setPage}>Home</NavLink>
                        <NavLink pageName="create" currentPage={page} setPage={setPage}>Create</NavLink>
                        <NavLink pageName="popular" currentPage={page} setPage={setPage}>Popular</NavLink>
                        <NavLink pageName="about" currentPage={page} setPage={setPage}>About</NavLink>
                        {/* {isLoggedIn && <NavLink pageName="settings" currentPage={page} setPage={setPage}>Settings</NavLink>} */}
                        
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                        <button onClick={() => setPage('cart')} className="relative p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <HeaderCartIcon className="h-6 w-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-xs font-bold text-white">
                                    {cartItemCount}
                                </span>
                            )}
                            <span className="sr-only">View cart</span>
                        </button>

                        {isLoggedIn ? (
                             <button
                                onClick={onLogout}
                                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => setPage('login')}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)]"
                            >
                                Login
                            </button>
                        )}
                    </div>
                    {/* Add mobile menu button here if needed */}
                </div>
            </div>
        </header>
    );
};

export default Header;
