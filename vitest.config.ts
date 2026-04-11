/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        testTimeout: 15000,
        env: {
            NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS: 'true'
        },
        setupFiles: ['./src/tests/setup.tsx'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', '.next'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.{ts,tsx}',
                'src/**/index.ts',
            ],
            thresholds: {
                statements: 24,
                branches: 18,
                functions: 23,
                lines: 24,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
