import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserProvider, UserContext } from '../../../modules/app/components/common/user-provider';


jest.mock('../../../backend/userService', () => ({
  tryLoginFromServiceToken: jest.fn(),
}));

// Import after mocking
const userService = require('../../../backend/userService');

describe('UserProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    userService.tryLoginFromServiceToken.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const TestComponent = () => {
    const context = React.useContext(UserContext);
    return (
      <div>
        <div data-testid="loading">{context.loading ? 'loading' : 'not-loading'}</div>
        <div data-testid="user">{context.user ? JSON.stringify(context.user) : 'no-user'}</div>
        <div data-testid="pending-invites">{context.pendingInvites}</div>
        <button onClick={() => context.setUser({ id: 1, userName: 'testuser' })}>Set User</button>
        <button onClick={() => context.setPendingInvites(5)}>Set Invites</button>
        <button onClick={context.handleLogout}>Logout</button>
        <button onClick={context.refreshUser}>Refresh</button>
      </div>
    );
  };

  it('renderiza hijos', () => {
    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onError();
    });

    render(
      <UserProvider>
        <div>Test Child</div>
      </UserProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('carga usuario de localStorage si está disponible', async () => {
    const storedUser = { id: 1, userName: 'stored-user', avatar: 'test.png' };
    localStorage.setItem('user', JSON.stringify(storedUser));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('stored-user');
  });

  it('intenta login desde token de servicio cuando no hay usuario en localStorage', async () => {
    const authenticatedUser = {
      user: { id: 2, userName: 'token-user', avatar: 'avatar.png' }
    };

    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onSuccess(authenticatedUser);
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(userService.tryLoginFromServiceToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('usa avatar por defecto si el usuario no tiene avatar', async () => {
    const authenticatedUser = {
      user: { id: 2, userName: 'no-avatar-user' }
    };

    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onSuccess(authenticatedUser);
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-avatar-user');
    });

    await waitFor(() => {
      const userText = screen.getByTestId('user').textContent;
      const userData = JSON.parse(userText);
      expect(userData.avatar).toContain('imagekit.io');
    });
  });

  it('maneja error de autenticación', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onError();
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Reauthentication required');
    consoleErrorSpy.mockRestore();
  });

  it('allows setting user through context', async () => {
    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onError();
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByText('Set User'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('allows setting pending invites through context', async () => {
    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onError();
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pending-invites')).toHaveTextContent('0');
    });

    fireEvent.click(screen.getByText('Set Invites'));

    await waitFor(() => {
      expect(screen.getByTestId('pending-invites')).toHaveTextContent('5');
    });
  });

  it('maneja logout correctamente', async () => {
    const storedUser = { id: 1, userName: 'stored-user' };
    localStorage.setItem('user', JSON.stringify(storedUser));
    sessionStorage.setItem('userRole', 'TRAINER');
    sessionStorage.setItem('serviceToken', 'test-token');

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('stored-user');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(localStorage.getItem('user')).toBeNull();
    expect(sessionStorage.getItem('userRole')).toBeNull();
    expect(sessionStorage.getItem('serviceToken')).toBeNull();
  });

  it('refreshUser llama tryLoginFromServiceToken y actualiza usuario', async () => {
    const updatedUser = {
      user: { id: 3, userName: 'refreshed-user', avatar: 'new-avatar.png' }
    };

    userService.tryLoginFromServiceToken.mockImplementation((onSuccess, onError) => {
      onSuccess(updatedUser);
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(userService.tryLoginFromServiceToken).toHaveBeenCalledTimes(2);
    });
  });

  it('maneja error de refreshUser', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    userService.tryLoginFromServiceToken
      .mockImplementationOnce((onSuccess, onError) => {
        onError();
      })
      .mockImplementationOnce((onSuccess, onError) => {
        onError();
      });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error refreshing user data');
    });

    consoleErrorSpy.mockRestore();
  });
});

