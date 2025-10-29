import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


console.log('Vite config loaded');
console.log('Environment Variables:', {
  API_KEY: process.env.API_KEY ? '***' : 'MISSING',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'MISSING',
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ? '***' : 'MISSING',
  VITE_AUTH_DOMAIN: process.env.VITE_AUTH_DOMAIN ? '***' : 'MISSING',
  VITE_PROJECT_ID: process.env.VITE_PROJECT_ID ? '***' : 'MISSING',
  VITE_STORAGE_BUCKET: process.env.VITE_STORAGE_BUCKET ? '***' : 'MISSING',
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY),
        'process.env.VITE_AUTH_DOMAIN': JSON.stringify(env.AUTH_DOMAIN),
        'process.env.VITE_PROJECT_ID': JSON.stringify(env.PROJECT_ID),
        'process.env.VITE_STORAGE_BUCKET': JSON.stringify(env.STORAGE_BUCKET),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
