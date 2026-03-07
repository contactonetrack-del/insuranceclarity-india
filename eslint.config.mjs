import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        ignores: [
            'coverage/**',
            'playwright-report/**',
            'test-results/**',
        ],
    },
    {
        rules: {
            'react/no-unescaped-entities': 'off',
            'react-hooks/set-state-in-effect': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'import/no-anonymous-default-export': 'off',
        },
    },
    {
        files: ['scripts/**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['**/*.test.{ts,tsx}', 'src/tests/**/*.{ts,tsx}'],
        rules: {
            'react/display-name': 'off',
            '@next/next/no-assign-module-variable': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]
