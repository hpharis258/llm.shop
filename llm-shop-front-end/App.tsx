import React from 'react';
import { ThemeProvider, AuthProvider, CartProvider } from './components/contexts';
import AppLayout from './AppLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
