module.exports = {
  extends: ['@nkzw', 'plugin:tailwindcss/recommended'],
  plugins: ['tailwindcss'],
  rules: {
    // Tailwind CSS rules
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',

    // Custom rules to catch responsive layout issues
    'tailwindcss/enforces-shorthand': 'warn',
    'tailwindcss/migration-from-tailwind-2': 'warn',
    'tailwindcss/no-arbitrary-value': 'off', // Allow arbitrary values like w-[156px]
  },
  settings: {
    tailwindcss: {
      // Match Tailwind config path
      config: 'tailwind.config.js',
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
