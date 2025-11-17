import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate CSS-heavy dependencies into their own chunks
                    'leaflet': ['leaflet'],
                    'react-toastify': ['react-toastify'],
                    // Separate React-related chunks for better caching
                    'react-vendor': ['react', 'react-dom'],
                    'inertia': ['@inertiajs/react'],
                },
            },
        },
        // Optimize CSS loading
        cssCodeSplit: true,
        // Optimize asset handling
        assetsInlineLimit: 4096,
        // Optimize chunk size
        chunkSizeWarningLimit: 500,
    },
    // Add performance optimizations
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
        exclude: ['@vite/client', '@vite/env'],
    },
});
