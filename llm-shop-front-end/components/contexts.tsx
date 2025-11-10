import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { BaseTheme, AccentColor, Product, CartItem } from '../types';
import { signOutUser } from '../auth/firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../auth/firebaseClient';

// --- Theme Context ---
interface ThemeContextType {
  baseTheme: BaseTheme;
  setBaseTheme: (theme: BaseTheme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseTheme, setBaseTheme] = useState<BaseTheme>(() => (localStorage.getItem('baseTheme') as BaseTheme) || 'system');
  const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'indigo');

  useEffect(() => {
    localStorage.setItem('baseTheme', baseTheme);
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Define a stable listener function to handle system theme changes.
    const systemThemeListener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Clean up any existing listener before applying the new theme.
    mediaQuery.removeEventListener('change', systemThemeListener);

    // Apply the correct theme based on the current state.
    if (baseTheme === 'light') {
      root.classList.remove('dark');
    } else if (baseTheme === 'dark') {
      root.classList.add('dark');
    } else { // baseTheme is 'system'
      // Set the theme based on the current system preference.
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      // Add a listener to handle future system preference changes.
      mediaQuery.addEventListener('change', systemThemeListener);
    }
    
    // The cleanup function runs when the component unmounts or `baseTheme` changes.
    // It ensures the listener is removed if it was active.
    return () => {
      mediaQuery.removeEventListener('change', systemThemeListener);
    };
  }, [baseTheme]);


  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    const root = document.documentElement;
    root.classList.remove('theme-indigo', 'theme-sunset', 'theme-ocean');
    root.classList.add(`theme-${accentColor}`);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ baseTheme, setBaseTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- Auth Context ---
interface AuthCtx {
  user: any | null;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// --- Cart Context ---
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    const newItem: CartItem = {
      ...product,
      id: Date.now()
    };
    setCart(prevCart => [...prevCart, newItem]);
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};