import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductGenerator from './components/ProductGenerator';
import ProductDisplay from './components/ProductDisplay';
import AboutPage from './components/AboutPage.tsx';
import PopularProductsPage from './components/PopularProductsPage';
import SettingsPage, { BaseTheme, AccentColor } from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import CartPage from './components/CartPage';
import HomePage from './components/HomePage'; // Import the new HomePage component
import { generateProductImage, generateProductTitle } from './services/geminiService';

export type Page = 'home' | 'create' | 'popular' | 'about' | 'settings' | 'login' | 'cart';

export interface Product {
  title: string;
  price: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  id: number; // Use a unique identifier, like a timestamp
}


function App() {
  const [page, setPage] = useState<Page>('home'); // Default to the new home page
  const [redirectPage, setRedirectPage] = useState<Page | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('isLoggedIn'));

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Theme state
  const [baseTheme, setBaseTheme] = useState<BaseTheme>(() => (localStorage.getItem('baseTheme') as BaseTheme) || 'system');
  const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'indigo');

  useEffect(() => {
    localStorage.setItem('baseTheme', baseTheme);
    const root = window.document.documentElement;
    const systemThemeDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (baseTheme === 'system') {
            root.classList.toggle('dark', e.matches);
        }
    };
    
    if (baseTheme === 'system') {
      root.classList.toggle('dark', systemThemeDark.matches);
      systemThemeDark.addEventListener('change', handleSystemThemeChange);
    } else {
      root.classList.toggle('dark', baseTheme === 'dark');
    }

    return () => {
        systemThemeDark.removeEventListener('change', handleSystemThemeChange);
    };
  }, [baseTheme]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    const root = document.documentElement;
    root.classList.remove('theme-indigo', 'theme-sunset', 'theme-ocean');
    root.classList.add(`theme-${accentColor}`);
  }, [accentColor]);
  
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    setPage(redirectPage || 'create');
    setRedirectPage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setPage('home'); // Redirect to home on logout
  };
  
  const handleAddToCart = (product: Product) => {
    const newItem: CartItem = {
      ...product,
      id: Date.now() // Simple unique ID
    };
    setCart(prevCart => [...prevCart, newItem]);
  };
  
  const handleRemoveFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
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

  const handleGenerate = async (currentPrompt: string) => {
    if (!currentPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedTitle(null);

    try {
      const [imageUrl, title] = await Promise.all([
        generateProductImage(currentPrompt, selectedStyle),
        generateProductTitle(currentPrompt)
      ]);
      
      setGeneratedImage(imageUrl);
      setGeneratedTitle(title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setGeneratedImage(null);
    setGeneratedTitle(null);
    setError(null);
    setPrompt('');
  };

  const renderPage = () => {
    switch(page) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'create':
        return (
          <div className="space-y-8">
            <ProductGenerator
              prompt={prompt}
              setPrompt={setPrompt}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            {(isLoading || error || generatedImage) && (
              <ProductDisplay
                imageUrl={generatedImage}
                title={generatedTitle}
                isLoading={isLoading}
                error={error}
                onStartOver={handleStartOver}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
        );
      case 'popular':
        return <PopularProductsPage onAddToCart={handleAddToCart} />;
      case 'about':
        return <AboutPage />;
      case 'settings':
        return <SettingsPage baseTheme={baseTheme} setBaseTheme={setBaseTheme} accentColor={accentColor} setAccentColor={setAccentColor} />;
      case 'login':
        const reason = redirectPage === 'cart' ? "Please sign in to view your cart." : undefined;
        return <LoginPage onLogin={handleLogin} reason={reason} />;
      case 'cart':
        return <CartPage cartItems={cart} onRemoveFromCart={handleRemoveFromCart} onNavigate={navigate} />;
      default:
        return <div>Page not found</div>
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Header page={page} setPage={navigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} cartItemCount={cart.length} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
