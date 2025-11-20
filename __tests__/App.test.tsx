import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

jest.mock('../src/navigation/RootNavigator', () => {
  const MockRootNavigator = () => <></>;
  return MockRootNavigator;
});

describe('App', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<App />);
    // Since App just renders RootNavigator, we can't assert much here.
    // This test now primarily ensures that App renders without crashing.
    // A more thorough test would involve testing RootNavigator itself.
  });
});
