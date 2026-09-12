import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Every area of this repo runs somewhere different. A single
// `globals.browser` block used to apply to all of them, so api/,
// scripts/, desktop/ and extension/ each failed `no-undef` on their own
// runtime globals — 125 phantom errors that made `npm run lint` exit
// non-zero no matter what, and buried the real ones.
export default defineConfig([
  globalIgnores(['dist', 'dist-ssr', 'coverage', '**/node_modules']),

  // Browser app (src/) — the default.
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Without this, `no-unused-vars` cannot see a binding that is only
      // referenced from JSX — so a component passed as a prop and rendered
      // as <Icon /> reads as dead. It was reporting several of those.
      // (jsx-uses-react is not needed: the automatic JSX runtime is in use.)
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      // `catch {}` is this codebase's deliberate best-effort idiom: clipboard
      // writes, localStorage in a private window, SpeechRecognition, optional
      // Firestore reads. A failure there must not break the flow, and there is
      // nothing useful to log. Empty if/for/while blocks stay errors, because
      // those are bugs rather than intent.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // Vercel serverless functions, build scripts, config files — Node.
  {
    files: ['api/**/*.js', 'scripts/**/*.{js,mjs}', '*.config.js', 'vite.config.js', 'vitest.config.js'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { sourceType: 'module' },
    },
    rules: {
      // These are servers, not components.
      'react-refresh/only-export-components': 'off',
    },
  },

  // Electron main + preload — Node and browser globals, CommonJS.
  {
    files: ['desktop/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      sourceType: 'commonjs',
      parserOptions: { sourceType: 'commonjs' },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Browser extension — MV3 service worker + content scripts.
  {
    files: ['extension/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Context modules — the provider component and its consumer hook belong
  // together. Splitting useAuth out of AuthContext.jsx would touch 34 files to
  // satisfy a Fast Refresh hint, so the hook names are allowed instead. This
  // is the rule's own escape hatch: editing the provider still triggers a full
  // reload, editing anything else does not.
  {
    files: ['src/context/*.jsx'],
    rules: {
      'react-refresh/only-export-components': ['error', {
        allowExportNames: ['useAuth', 'useTheme', 'useToast'],
      }],
    },
  },

  // Test files — Vitest globals.
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'src/test-setup.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.vitest },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
