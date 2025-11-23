import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../modules/app/components/App';

jest.mock('../../modules/app/components/common/user-provider', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>
}));

jest.mock('../../modules/app/components/common/toast-provider', () => ({
  ToastProvider: ({ children }) => <div data-testid="toast-provider">{children}</div>
}));

jest.mock('../../modules/app/components/Body', () => {
  return function MockBody() {
    return <div data-testid="body">Body Component</div>;
  };
});

describe('App', () => {
  it('renderiza sin fallar', () => {
    render(<App />);
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });

  it('envuelve componentes en UserProvider', () => {
    render(<App />);
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
  });

  it('envuelve componentes en ToastProvider', () => {
    render(<App />);
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
  });

  it('renderiza componente Body', () => {
    render(<App />);
    expect(screen.getByText('Body Component')).toBeInTheDocument();
  });

  it('tiene jerarquía de providers correcta', () => {
    const { container } = render(<App />);
    const userProvider = screen.getByTestId('user-provider');
    const toastProvider = screen.getByTestId('toast-provider');
    const body = screen.getByTestId('body');

    expect(userProvider).toContainElement(toastProvider);
    expect(toastProvider).toContainElement(body);
  });
});

