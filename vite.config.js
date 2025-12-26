import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  build: {
    // Enable source maps for debugging (optional, increases size)
    sourcemap: false,
    
    // Code splitting and optimization
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunk for React and core dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Redux chunk
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-saga', 'reselect'],
          
          // UI library chunk
          ui: ['reactstrap', 'bootstrap'],
          
          // Chart libraries chunk (when needed)
          charts: ['apexcharts', 'react-apexcharts', 'chart.js', 'react-chartjs-2'],
          
          // Utils chunk
          utils: ['lodash', 'moment', 'axios', 'classnames'],
          
          // Form libraries
          forms: ['formik', 'yup', 'react-select'],
        },
        
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
  
  // Define environment variables
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
  },
})
