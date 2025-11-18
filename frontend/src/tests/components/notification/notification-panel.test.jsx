import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationPanel from '../../../modules/app/components/notification/NotificationPanel';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  notificationService: {
    getNotifications: jest.fn()
  }
}));

jest.mock('../../../modules/app/components/notification/NotificationItem', () => {
  return function MockNotificationItem({ notification, onClick }) {
    return (
      <div data-testid={`notification-${notification.id}`} onClick={() => onClick(notification)}>
        {notification.message}
      </div>
    );
  };
});

jest.mock('../../../modules/app/components/common/pager', () => {
  return function MockPager({ back, next }) {
    return (
      <div data-testid="pager">
        <button onClick={back.onClick} disabled={!back.enabled}>Back</button>
        <button onClick={next.onClick} disabled={!next.enabled}>Next</button>
      </div>
    );
  };
});

jest.mock('../../../modules/app/components/common/spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('NotificationPanel', () => {
  const mockOnNotificationClick = jest.fn();
  const mockOnClose = jest.fn();

  const mockNotifications = {
    items: [
      { id: 1, message: 'Notification 1', read: false, date: '2024-01-01' },
      { id: 2, message: 'Notification 2', read: true, date: '2024-01-02' },
      { id: 3, message: 'Notification 3', read: false, date: '2024-01-03' }
    ],
    existMoreItems: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      onSuccess(mockNotifications);
    });
  });

  it('renderiza panel con notificaciones', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
      expect(screen.getByText('Notification 3')).toBeInTheDocument();
    });
  });

  it('muestra spinner mientras carga', async () => {
    let resolveNotifications;
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      return new Promise(resolve => {
        resolveNotifications = () => {
          onSuccess(mockNotifications);
          resolve();
        };
      });
    });

    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  it('muestra mensaje vacío cuando no hay notificaciones', async () => {
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay notificaciones')).toBeInTheDocument();
    });
  });

  it('llama onNotificationClick cuando se hace clic en notificación', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Notification 1')).toBeInTheDocument();
    });

    const notification = screen.getByTestId('notification-1');
    fireEvent.click(notification);

    expect(mockOnNotificationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, message: 'Notification 1' })
    );
  });

  it('recarga notificaciones después de hacer clic en notificación', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Notification 1')).toBeInTheDocument();
    });

    const notification = screen.getByTestId('notification-1');
    fireEvent.click(notification);

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledTimes(2);
    });
  });

  it('renderiza paginador cuando existen notificaciones', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });
  });

  it('no renderiza paginador cuando está cargando', async () => {
    let resolveNotifications;
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      return new Promise(resolve => {
        resolveNotifications = () => {
          onSuccess(mockNotifications);
          resolve();
        };
      });
    });

    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    // Mientras carga, el paginador no debe estar presente
    expect(screen.queryByTestId('pager')).not.toBeInTheDocument();
  });

  it('no renderiza paginador cuando no hay notificaciones', async () => {
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay notificaciones')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('pager')).not.toBeInTheDocument();
  });

  it('deshabilita botón atrás en primera página', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back');
    expect(backButton).toBeDisabled();
  });

  it('habilita botón siguiente cuando existen más elementos', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('carga siguiente página cuando se hace clic en botón siguiente', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledWith(
        { page: 1, size: 5 },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('carga página anterior cuando se hace clic en botón atrás', async () => {
    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });

    // Navegar a página 1 primero
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledWith(
        { page: 1, size: 5 },
        expect.any(Function),
        expect.any(Function)
      );
    });

    // Ahora el botón atrás debe estar habilitado
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalledWith(
        { page: 0, size: 5 },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('maneja error al cargar notificaciones', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.notificationService.getNotifications.mockImplementation((params, onSuccess, onError) => {
      onError(new Error('Network error'));
    });

    render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar notificaciones:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('usa forwardRef correctamente', () => {
    const ref = React.createRef();
    
    render(
      <NotificationPanel
        ref={ref}
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('aplica clases de estilo correctas', async () => {
    const { container } = render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const panel = container.querySelector('.absolute.right-0');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveClass('bg-[#1a1a1a]');
    });
  });

  it('tiene área de notificaciones desplazable', async () => {
    const { container } = render(
      <NotificationPanel
        onNotificationClick={mockOnNotificationClick}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const scrollArea = container.querySelector('.max-h-\\[400px\\].overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });
  });
});

