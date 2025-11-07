module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    test: {
      presets: ['babel-preset-jest', 'module:@react-native/babel-preset'],
    },
  },
};
