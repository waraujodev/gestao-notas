import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React rules (disabled for Next.js)
      'react/prop-types': 'off', // TypeScript já faz essa verificação
      'react/react-in-jsx-scope': 'off', // Next.js não precisa importar React

      // Code quality
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
    },
  },
]

export default eslintConfig
