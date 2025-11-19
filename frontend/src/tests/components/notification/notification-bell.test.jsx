import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import NotificationBell from '../../../modules/app/components/notification/NotificationBell';
import { UserContext } from '../../../modules/app/components/common/user-provider';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    readNotification: jest.fn(),
    unreadNotification: jest.fn()
  }
}));

jest.mock('../../../modules/app/components/notification/NotificationPanel', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ onNotificationClick, onClose }, ref) => (
      <div ref={ref} data-testid="notification-panel">
        <button onClick={() => onNotificationClick({ id: 1, read: false })}>
          Mark as Read
        </button>
        <button onClick={() => onNotificationClick({ id: 2, read: true })}>
          Mark as Unread
        </button>
        <button onClick={onClose}>Close Panel</button>
      </div>
    ))
  };
});

describe('NotificationBell', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser'
  };

  const mockContextValue = {
    user: mockUser,
    setUser: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      onSuccess({
        items: [
          { id: 1, message: 'Notification 1', read: false },
          { id: 2, message: 'Notification 2', read: false },
          { id: 3, message: 'Notification 3', read: true }
        ]
      });
    });
  });

  it('retorna null cuando no hay usuario logueado', () => {
    const { container } = render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: null, loading: false }}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renderiza botón de campana de notificaciones', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      const button = screen.getByLabelText('Notificaciones');
      expect(button).toBeInTheDocument();
    });
  });

  it('carga conteo de no leídas al montar', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledWith(
        { page: 0, size: 5 },
        expect.any(Function),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('muestra insignia con conteo de no leídas', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-600');
    });
  });

  it('muestra 99+ para conteos mayores a 99', async () => {
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      onSuccess({
        items: Array(150).fill({ id: 1, message: 'Test', read: false })
      });
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  it('alterna panel de notificaciones al hacer clic en botón', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
    });
  });

  it('cierra panel cuando se hace clic fuera', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <div data-testid="outside">
            <NotificationBell />
          </div>
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
    });
  });

  it('marca notificación no leída como leída cuando se hace clic', async () => {
    backend.notificationService.readNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(backend.notificationService.readNotification).toHaveBeenCalledWith(
        1,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('marca notificación leída como no leída cuando se hace clic', async () => {
    backend.notificationService.unreadNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsUnreadButton = screen.getByText('Mark as Unread');
    fireEvent.click(markAsUnreadButton);

    await waitFor(() => {
      expect(backend.notificationService.unreadNotification).toHaveBeenCalledWith(
        2,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('decrements unread count when marking as read', async () => {
    backend.notificationService.readNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(backend.notificationService.readNotification).toHaveBeenCalled();
    });
  });

  it('increments unread count when marking as unread', async () => {
    backend.notificationService.unreadNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsUnreadButton = screen.getByText('Mark as Unread');
    fireEvent.click(markAsUnreadButton);

    await waitFor(() => {
      expect(backend.notificationService.unreadNotification).toHaveBeenCalled();
    });
  });

  it('maneja error al cargar notificaciones', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess, onError) => {
      onError(new Error('Network error'));
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('maneja error al marcar notificación como leída', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.notificationService.readNotification.mockImplementation((id, onSuccess, onError) => {
      onError(new Error('Network error'));
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('maneja error al marcar notificación como no leída', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.notificationService.unreadNotification.mockImplementation((id, onSuccess, onError) => {
      onError(new Error('Network error'));
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsUnreadButton = screen.getByText('Mark as Unread');
    fireEvent.click(markAsUnreadButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('cierra panel después de marcar notificación como leída', async () => {
    backend.notificationService.readNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
    });
  });

  it('recarga notificaciones después de marcar como leída', async () => {
    backend.notificationService.readNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NotificationBell />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledTimes(1);
    });

    const button = screen.getByLabelText('Notificaciones');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledTimes(2);
    });
  });
});

