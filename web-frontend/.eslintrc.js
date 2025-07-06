module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  rules: {
    // Code quality rules
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    'no-unused-expressions': ['error', {
      allowShortCircuit: true,
      allowTernary: true
    }],
    'prefer-const': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-alert': 'warn',
    
    // React specific rules
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-unused-state': 'error',
    
    // Import/Export rules
    'import/no-unused-modules': 'off', // Can be enabled later
    'import/order': ['warn', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'never'
    }],
    
    // Style consistency (basic)
    'jsx-quotes': ['warn', 'prefer-double'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['warn', 'never']
  },
  overrides: [
    {
      files: ['src/**/*.{js,jsx}'],
      rules: {
        // Additional rules for source files
        'no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^React$',
          ignoreRestSiblings: true
        }]
      }
    },
    {
      files: ['src/**/*.test.{js,jsx}', 'src/**/*.spec.{js,jsx}'],
      rules: {
        // Test file specific rules
        'no-unused-expressions': 'off'
      }
    }
  ]
};
