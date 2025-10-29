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
      '/cart': 'cart'
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
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Header page={page} setPage={navigate} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage onNavigate={navigate} />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/popular" element={<PopularProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route 
            path="/settings" 
            element={isLoggedIn ? <SettingsPage /> : <LoginPage onLogin={handleLogin} reason="Please sign in to access settings" onNavigate={navigate} />} 
          />
          <Route 
            path="/login" 
            element={<LoginPage onLogin={handleLogin} reason={redirectPage === 'cart' ? "Please sign in to view your cart." : undefined} onNavigate={navigate} />} 
          />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/cart" 
            element={isLoggedIn ? <CartPage onNavigate={navigate} /> : <LoginPage onLogin={handleLogin} reason="Please sign in to view your cart" onNavigate={navigate} />} 
          />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default AppLayout;
