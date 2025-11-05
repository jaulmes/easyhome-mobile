// This is a mock file for Firebase services.
// It contains a test to prevent Jest from throwing an error.

it('this is a mock file', () => {
  expect(true).toBe(true);
});


jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({
    onMessage: jest.fn(),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    requestPermission: jest.fn(() => Promise.resolve(true)),
  }),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => ({
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
    signOut: jest.fn(() => Promise.resolve()),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn(() => jest.fn()),
  }),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ role: 'locataire' }) })),
        onSnapshot: jest.fn(() => jest.fn()),
      })),
      where: jest.fn(() => ({
        onSnapshot: jest.fn(() => jest.fn()),
      })),
    })),
  }),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    hasPermission: jest.fn(() => Promise.resolve(true)),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
  }),
}));

jest.mock('@react-native-firebase/storage', () => ({
  __esModule: true,
  default: () => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(() => Promise.resolve()),
      getDownloadURL: jest.fn(() => Promise.resolve('mock-url')),
    })),
  }),
}));

jest.mock('react-native-gifted-chat', () => ({
  GiftedChat: () => null,
}));

jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
}));
