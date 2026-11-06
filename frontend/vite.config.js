import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Exactly one React instance, even if a dependency resolves its own copy.
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('xlsx')) {
              return 'vendor-export';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@faker-js')) {
              return 'vendor-faker';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('zustand')) {
              return 'vendor-core';
            }
            return 'vendor-misc';
          }
        },
      },
    },
  },
  // Pre-bundle every runtime dependency at startup. Otherwise Vite discovers some of them
  // mid-session (e.g. after login), re-optimizes, and an open tab can end up with two React
  // copies -> "Cannot read properties of null (reading 'useContext')".
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-dom/client', 'react-router-dom', 'zustand', 'zustand/middleware',
      'i18next', 'react-i18next', 'i18next-browser-languagedetector', 'sonner', 'clsx', 'tailwind-merge',
      'lucide-react', 'date-fns', 'recharts', 'framer-motion', 'qrcode.react', 'html5-qrcode', 'fuse.js',
      'papaparse', 'xlsx', 'jspdf', 'jspdf-autotable', 'html2canvas', 'zod', 'react-hook-form',
      '@hookform/resolvers/zod', '@tanstack/react-table', '@dnd-kit/core', '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
  server: {
    port: 5173,
    host: true,
  },
});
