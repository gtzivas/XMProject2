// T003/T005: babel.config.js
// NOTE: react-native-reanimated/plugin MUST be listed last.
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@database': './src/database',
          '@navigation': './src/navigation',
          '@utils': './src/utils',
        },
      },
    ],
    'react-native-reanimated/plugin', // MUST be last
  ],
};
