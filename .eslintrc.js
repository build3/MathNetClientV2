module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'indent': ['error', 4],
    'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
    'no-await-in-loop': 'off',
    'no-else-return': 'off',
    'prefer-destructuring': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
