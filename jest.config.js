module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@react-native|react-native|@react-native-community|@react-navigation|@react-native-firebase|react-native-gifted-chat|autolinker)',
  ],
  setupFilesAfterEnv: ['./__tests__/firebase-mock.js'],
  testMatch: ['**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__tests__/styleMock.js',
  },
};