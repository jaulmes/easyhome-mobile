jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    // your mock methods
  })),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    currentUser: {
      uid: 'test-uid',
      displayName: 'Test User'
    },
    signOut: jest.fn().mockResolvedValue(undefined)
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ role: 'tenant' }) }),
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
        onSnapshot: jest.fn(() => () => {}),
        collection: jest.fn(() => ({
          add: jest.fn().mockResolvedValue({ id: 'test-id' }),
          onSnapshot: jest.fn(() => () => {}),
        }))
      })),
      where: jest.fn(() => ({
        onSnapshot: jest.fn(() => () => {}),
      })),
      add: jest.fn().mockResolvedValue({ id: 'test-id' })
    }))
  })),
  FieldValue: {
    serverTimestamp: jest.fn(),
  }
}));

jest.mock('@react-native-firebase/storage', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    ref: jest.fn(() => ({
      putFile: jest.fn().mockResolvedValue(undefined),
      getDownloadURL: jest.fn().mockResolvedValue('http://mock-url.com/image.jpg'),
    }))
  }))
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');