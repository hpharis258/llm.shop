import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CreatePage from './components/CreatePage';
import PopularProductsPage from './components/PopularProductsPage';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import CartPage from './components/CartPage';
import HomePage from './components/HomePage';
import SignUp from './components/SignUpPage';
import { useAuth } from './components/contexts';
import { Page } from './types';
import CheckoutPage from './components/checkoutPage';

function AppLayout() {
  const [page, setPage] = useState<Page>('home');
  const [redirectPage, setRedirectPage] = useState<Page | null>(null);
  const { isLoggedIn, login, logout } = useAuth();
  const routerNavigate = useNavigate();
  const location = useLocation();

  // Sync URL with state
  useEffect(() => {
    const pathToPage: { [key: string]: Page } = {
      '/': 'home',
      '/create': 'create',
      '/popular': 'popular',
      '/about': 'about',
      '/settings': 'settings',
      '/login': 'login',
      '/signup': 'signup',
      '/cart': 'cart',
      '/checkout': 'checkout'
    };
    setPage(pathToPage[location.pathname] || 'home');
  }, [location]);

  const handleLogin = () => {
    login();
    const targetPage = redirectPage || 'create';
    setPage(targetPage);
    routerNavigate(`/${targetPage}`);
    setRedirectPage(null);
  };

  const handleLogout = () => {
    logout();
    setPage('home');
    routerNavigate('/');
  };

  const navigate = (targetPage: Page) => {
    const protectedPages: Page[] = ['settings', 'cart'];
    if (protectedPages.includes(targetPage) && !isLoggedIn) {
      setRedirectPage(targetPage);
      console.log('Redirecting to login page');
      setPage('login');
      routerNavigate('/login');
    } else {
      console.log(`Navigating to ${targetPage} page`);
      setPage(targetPage);
      routerNavigate(targetPage === 'home' ? '/' : `/${targetPage}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header page={page} setPage={navigate} onLogout={handleLogout} />
      <main className="flex-1 px-4 py-8">
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'create' && <CreatePage />}
        {page === 'popular' && <PopularProductsPage />}
        {page === 'about' && <AboutPage />}
        {page === 'cart' && <CartPage onNavigate={navigate} />}
        {page === 'settings' && <SettingsPage />}
        {page === 'login' && <LoginPage onNavigate={navigate} onLogin={() => setPage('home')} />}
        {page === 'signup' && <SignUp onNavigate={navigate} onSignUp={() => setPage('home')} />}
        {page === 'checkout' && <CheckoutPage setPage={setPage} />}
        {!(page === 'home' ||
           page === 'create' ||
           page === 'popular' ||
           page === 'about' ||
           page === 'cart' ||
           page === 'settings' ||
           page === 'login' ||
           page === 'signup' ||
           page === 'checkout') && (
             <p className="text-center text-sm text-red-500">Page not found.</p>
        )}
      </main>
    </div>
  );
}

export default AppLayout;
