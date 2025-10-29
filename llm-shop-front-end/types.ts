export type Page = 'home' | 'create' | 'popular' | 'about' | 'settings' | 'login' | 'cart' | 'signup';

export interface Product {
  title: string;
  price: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  id: number;
}

export type BaseTheme = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'sunset' | 'ocean';
