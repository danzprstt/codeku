// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Anti-devtools in production
    if (process.env.NODE_ENV === 'production') {
      // Disable right click
      document.addEventListener('contextmenu', e => e.preventDefault());
      // Disable common devtools shortcuts
      document.addEventListener('keydown', (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'U')
        ) e.preventDefault();
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toaster-container',
            style: {
              background: 'var(--grid-card)',
              color: 'var(--grid-text)',
              border: '1px solid var(--grid-card-border)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.875rem',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
