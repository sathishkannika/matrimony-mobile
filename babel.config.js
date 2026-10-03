module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Must run before the RN preset's modules-commonjs: zod v4 uses `export * as`.
    '@babel/plugin-transform-export-namespace-from',
  ],
  env: {
    production: {
      plugins: [
        '@babel/plugin-transform-export-namespace-from',
        'transform-remove-console',
      ],
    },
  },
};
