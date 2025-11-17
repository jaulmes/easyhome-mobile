// __tests__/firebase-mock.js

// Mock de @react-native-firebase/app
jest.mock('@react-native-firebase/app', () => {
  return () => ({
    onReady: jest.fn(() => Promise.resolve(true)),
    // Ajoutez d'autres méthodes/propriétés de 'app' si nécessaire
  });
});

// Mock de @react-native-firebase/auth
jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn(() => jest.fn()), // Retourne une fonction de désinscription
    currentUser: {
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com',
      updateProfile: jest.fn(() => Promise.resolve()),
    },
  });
});

// Mock de @react-native-firebase/firestore
jest.mock('@react-native-firebase/firestore', () => {
  const mockDoc = {
    exists: true,
    data: () => ({ role: 'tenant', name: 'Test User' }),
    get: jest.fn(() => Promise.resolve(mockDoc)),
    onSnapshot: jest.fn(() => () => {}), // Retourne une fonction de désinscription
    update: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  };
  const mockCollection = {
    doc: jest.fn(() => mockDoc),
    where: jest.fn(() => mockCollection),
    get: jest.fn(() => Promise.resolve({
      docs: [mockDoc],
      forEach: (callback) => callback(mockDoc),
    })),
    onSnapshot: jest.fn(() => () => {}),
    add: jest.fn(() => Promise.resolve(mockDoc)),
  };
  return () => ({
    collection: jest.fn(() => mockCollection),
    doc: jest.fn(() => mockDoc),
  });
});

// Mock de @react-native-firebase/functions
jest.mock('@react-native-firebase/functions', () => {
  return () => ({
    httpsCallable: jest.fn((functionName) => {
      return jest.fn((data) => {
        // Simulez une réponse basée sur le nom de la fonction
        if (functionName === 'suggestProperties') {
          return Promise.resolve({ data: [{ id: 'sugg1', title: 'Suggestion 1' }] });
        }
        if (functionName === 'findSimilarProperties') {
          return Promise.resolve({ data: [{ id: 'sim1', title: 'Similar 1' }] });
        }
        return Promise.resolve({ data: {} });
      });
    }),
  });
});


// Mock de @react-native-firebase/storage
jest.mock('@react-native-firebase/storage', () => {
    return () => ({
      ref: jest.fn(() => ({
        putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
        getDownloadURL: jest.fn(() => Promise.resolve('http://mockurl.com/image.jpg')),
      })),
    });
  });

  // Mock de @react-native-google-signin/google-signin
  jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn(() => Promise.resolve(true)),
      signIn: jest.fn(() => Promise.resolve({ idToken: 'mock-id-token' })),
      revokeAccess: jest.fn(() => Promise.resolve()),
      signOut: jest.fn(() => Promise.resolve()),
    },
  }));

  // Mock de react-native-splash-screen
  jest.mock('react-native-splash-screen', () => ({
    hide: jest.fn(),
  }));

  // Test factice pour que le fichier soit considéré comme un fichier de test
  it('firebase mocks are loaded', () => {
    expect(true).toBe(true);
  });

jest.mock('react-native-gifted-chat', () => ({
  GiftedChat: () => null,
}));
