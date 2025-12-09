module.exports = {
  ignorePatterns: ['src/_archived-from-bp-integration/**', 'assets/**', 'production/**'],
  extends: ['@nkzw', 'plugin:tailwindcss/recommended'],
  plugins: ['tailwindcss'],
  globals: {
    // WordPress globals
    'frsAdmin': 'readonly',
    'frsUsersAdmin': 'readonly',
    'wpApiSettings': 'readonly',
    'wp': 'readonly',
    'wordpressPluginBoilerplate': 'readonly',
    'lrhAdmin': 'readonly',
  },
  rules: {
    // Tailwind CSS rules
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',

    // Custom rules to catch responsive layout issues
    'tailwindcss/enforces-shorthand': 'warn',
    'tailwindcss/migration-from-tailwind-2': 'warn',
    'tailwindcss/no-arbitrary-value': 'off', // Allow arbitrary values like w-[156px]

    // Disable import/no-unresolved for path aliases (handled by TypeScript)
    'import/no-unresolved': 'off',

    // Reduce console to warning (common in development)
    'no-console': 'warn',

    // Reduce any to warning (gradual typing)
    '@typescript-eslint/no-explicit-any': 'warn',

    // Disable namespace import rule (common pattern)
    'import/no-namespace': 'off',

    // Reduce sort-keys to warning
    'sort-keys-fix/sort-keys-fix': 'warn',

    // Reduce consistent-function-scoping to warning
    'unicorn/consistent-function-scoping': 'warn',

    // Reduce prefer-number-properties to warning
    'unicorn/prefer-number-properties': 'warn',

    // Reduce extraneous dependencies to warning
    'import/no-extraneous-dependencies': 'warn',
  },
  settings: {
    tailwindcss: {
      // Match Tailwind config path
      config: 'tailwind.config.js',
      // Only scan source CSS files, not compiled assets
      cssFiles: ['src/**/*.css'],
      // Allow custom classes from shadcn/ui
      whitelist: ['frs-.*'],
      callees: ['cn', 'clsx', 'classnames'],
    },
  },
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        // Ensure TypeScript files are properly typed
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
      },
    },
  ],
};
