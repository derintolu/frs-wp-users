/**
 * Shared Vite Build Optimization Config
 *
 * Reduces bundle sizes through:
 * - Code splitting
 * - Tree shaking
 * - Minification
 * - Manual chunking of vendor code
 */

export const optimizationConfig = {
  build: {
    // Target modern browsers for smaller code
    target: 'es2015',

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: ['console.debug'], // Remove console.debug calls
      },
      format: {
        comments: false, // Remove comments
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 600,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunking strategy
        manualChunks: (id) => {
          // Split large dependencies into separate chunks

          // UI Libraries
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }

          // React ecosystem
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }

          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'react-forms';
          }

          // State management
          if (id.includes('node_modules/jotai')) {
            return 'jotai';
          }

          // Utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-fns';
          }

          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }

          // Charts
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }

          // Other large node_modules
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },

        // Naming pattern for chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Source maps for debugging (disable in production for smaller size)
    sourcemap: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    exclude: [
      '@wordpress/block-editor',
      '@wordpress/blocks',
    ],
  },
};

/**
 * WordPress-specific optimizations
 * Externalizes WordPress globals that are already loaded by WordPress
 */
export const wordpressExternals = {
  build: {
    rollupOptions: {
      external: [
        // Don't bundle these - WordPress already provides them
        // Only use if you're sure they're enqueued by WP
        // 'react',
        // 'react-dom',
      ],
    },
  },
};
