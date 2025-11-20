import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from '../../../modules/app/components/common/toast';

describe('Toast', () => {
  let onCloseMock;

  beforeEach(() => {
    jest.useFakeTimers();
    onCloseMock = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renderiza mensaje', () => {
    render(<Toast message="Test message" type="success" onClose={onCloseMock} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renderiza icono de éxito', () => {
    const { container } = render(
      <Toast message="Success" type="success" onClose={onCloseMock} />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renderiza icono de error', () => {
    const { container } = render(
      <Toast message="Error" type="error" onClose={onCloseMock} />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renderiza icono de rechazado', () => {
    const { container } = render(
      <Toast message="Declined" type="declined" onClose={onCloseMock} />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renderiza icono de cancelado', () => {
    const { container } = render(
      <Toast message="Canceled" type="canceled" onClose={onCloseMock} />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('usa icono de error por defecto para tipo desconocido', () => {
    const { container } = render(
      <Toast message="Unknown" type="unknown" onClose={onCloseMock} />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('llama onClose cuando se hace clic en botón cerrar', async () => {
    render(<Toast message="Test" type="success" onClose={onCloseMock} />);
    
    const closeButton = screen.getByRole('button');
    
    fireEvent.click(closeButton);

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('se cierra automáticamente después de 3 segundos', async () => {
    render(<Toast message="Test" type="success" onClose={onCloseMock} />);
    
    expect(onCloseMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('establece isExiting a true antes de cerrar', async () => {
    const { container } = render(
      <Toast message="Test" type="success" onClose={onCloseMock} />
    );
    
    const toastDiv = container.querySelector('.animate-slide-in');
    expect(toastDiv).toBeInTheDocument();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      const toastDivExiting = container.querySelector('.animate-slide-out');
      expect(toastDivExiting).toBeInTheDocument();
    });
  });

  it('limpia timer al desmontar', () => {
    const { unmount } = render(
      <Toast message="Test" type="success" onClose={onCloseMock} />
    );
    
    unmount();

    jest.advanceTimersByTime(3300);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('renderiza con clases de estilo correctas', () => {
    const { container } = render(
      <Toast message="Test" type="success" onClose={onCloseMock} />
    );
    
    const toastDiv = container.querySelector('.fixed.bottom-5.right-5');
    expect(toastDiv).toBeInTheDocument();
    expect(toastDiv).toHaveClass('bg-[#161616]');
    expect(toastDiv).toHaveClass('text-white');
  });

  it('renderiza icono de botón cerrar', () => {
    render(
      <Toast message="Test" type="success" onClose={onCloseMock} />
    );
    
    const closeButton = screen.getByRole('button');
    const closeIcon = closeButton.querySelector('svg');
    expect(closeIcon).toBeInTheDocument();
  });
});

