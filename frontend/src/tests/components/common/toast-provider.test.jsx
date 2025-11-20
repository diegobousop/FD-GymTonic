import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../../../modules/app/components/common/toast-provider';

jest.mock('../../../modules/app/components/common/toast', () => {
  function MockToast({ message, type, onClose }) {
    return (
      <div data-testid="toast">
        <span>{message}</span>
        <span>{type}</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
  return MockToast;
});

describe('ToastProvider', () => {
  const TestComponent = () => {
    const { showToast } = useToast();
    
    return (
      <div>
        <button onClick={() => showToast('Success message', 'success')}>
          Show Success
        </button>
        <button onClick={() => showToast('Error message', 'error')}>
          Show Error
        </button>
        <button onClick={() => showToast('Default message')}>
          Show Default
        </button>
      </div>
    );
  };

  it('renderiza hijos', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Test Child</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('muestra toast cuando se llama showToast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('muestra toast con tipo correcto', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  it('usa tipo éxito por defecto cuando no se proporciona tipo', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Default'));

    await waitFor(() => {
      expect(screen.getByText('Default message')).toBeInTheDocument();
      expect(screen.getByText('success')).toBeInTheDocument();
    });
  });

  it('elimina toast cuando se llama onClose', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });
  });

  it('muestra múltiples toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      const toasts = screen.getAllByTestId('toast');
      expect(toasts.length).toBe(2);
    });
  });

  it('lanza error cuando useToast se usa fuera del provider', () => {
    // Suprimir console.error para este test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const BadComponent = () => {
      useToast();
      return <div>Bad</div>;
    };

    expect(() => {
      render(<BadComponent />);
    }).toThrow('useToast debe usarse dentro de ToastProvider');

    consoleError.mockRestore();
  });

  it('renderiza contenedor de toast con estilos correctos', () => {
    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const toastContainer = container.querySelector('.fixed.top-5.right-5.z-50.space-y-2');
    expect(toastContainer).toBeInTheDocument();
  });
});

