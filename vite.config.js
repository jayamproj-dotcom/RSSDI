import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html'; // ✅ Correct import

const isProduction = process.env.NODE_ENV === 'production';
const APP_VERSION = JSON.stringify(Date.now().toString());

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          APP_VERSION,
        },
      },
    }),
  ],
  css: {
    devSourcemap: true,
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.APP_VERSION': APP_VERSION,
  },
  server: {
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true,
    sourcemap: false,
    minify: 'terser',
    emptyOutDir: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1600,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  preview: {
    port: 5000,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  },
});
