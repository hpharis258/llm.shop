import React, { useState } from 'react';
import Header from './components/Header';
import CreatePage from './components/CreatePage';
import PopularProductsPage from './components/PopularProductsPage';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import CartPage from './components/CartPage';
import HomePage from './components/HomePage';
import { useAuth } from './components/contexts';
import { Page } from './types';

function AppLayout() {
  const [page, setPage] = useState<Page>('home');
  const [redirectPage, setRedirectPage] = useState<Page | null>(null);
  const { isLoggedIn, login, logout } = useAuth();

  const handleLogin = () => {
    login();
    setPage(redirectPage || 'create');
    setRedirectPage(null);
  };

  const handleLogout = () => {
    logout();
    setPage('home');
  };

  const navigate = (targetPage: Page) => {
    const protectedPages: Page[] = ['settings', 'cart'];
    if (protectedPages.includes(targetPage) && !isLoggedIn) {
      setRedirectPage(targetPage);
      setPage('login');
    } else {
      setPage(targetPage);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'create':
        return <CreatePage />;
      case 'popular':
        return <PopularProductsPage />;
      case 'about':
        return <AboutPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        const reason = redirectPage === 'cart' ? "Please sign in to view your cart." : undefined;
        return <LoginPage onLogin={handleLogin} reason={reason} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Header page={page} setPage={navigate} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default AppLayout;
