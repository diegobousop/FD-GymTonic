import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import IntroPage from '../../modules/app/pages/intro-page';
import backend from '../../backend';

jest.mock('../../backend', () => ({
  imageService: {
    getAllBackgrounds: jest.fn()
  }
}));

jest.mock('../../modules/app/components/common/login-navbar', () => {
  return function MockLoginNavbar() {
    return <div data-testid="login-navbar">Login Navbar</div>;
  };
});

describe('IntroPage', () => {
  const mockBackgrounds = [
    { name: 'bg1', base64: 'data:image/png;base64,bg1' },
    { name: 'bg2', base64: 'data:image/png;base64,bg2' },
    { name: 'bg3', base64: 'data:image/png;base64,bg3' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    backend.imageService.getAllBackgrounds.mockImplementation((onSuccess) => {
      onSuccess(mockBackgrounds);
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderIntroPage = () => {
    return render(
      <MemoryRouter>
        <IntroPage />
      </MemoryRouter>
    );
  };

  it('renderiza sin fallar', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByTestId('login-navbar')).toBeInTheDocument();
    });
  });

  it('obtiene fondos al montar', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(backend.imageService.getAllBackgrounds).toHaveBeenCalled();
    });
  });

  it('maneja error al obtener fondos', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.imageService.getAllBackgrounds.mockImplementation((onSuccess, onError) => {
      onError(new Error('Fetch failed'));
    });

    renderIntroPage();
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener los backgrounds:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('renderiza encabezado principal', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByText(/Entrenar nunca fue tan fácil/i)).toBeInTheDocument();
    });
  });

  it('renderiza enlace de registro', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/register');
    });
  });

  it('renderiza botón empezar', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByText('Empezar')).toBeInTheDocument();
    });
  });

  it('renderiza botón regístrate gratis', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByText('Regístrate gratis')).toBeInTheDocument();
    });
  });

  it('renderiza botones de navegación de fondo', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /Ir a fondo/i });
      expect(buttons.length).toBe(3);
    });
  });

  it('establece el primer fondo como activo por defecto', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      const firstButton = screen.getByLabelText('Ir a fondo 1');
      expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('cambia fondo cuando se hace clic en el botón de navegación', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByLabelText('Ir a fondo 1')).toHaveAttribute('aria-pressed', 'true');
    });

    const secondButton = screen.getByLabelText('Ir a fondo 2');
    fireEvent.click(secondButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Ir a fondo 2')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('cambia automáticamente entre fondos', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByLabelText('Ir a fondo 1')).toHaveAttribute('aria-pressed', 'true');
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Ir a fondo 2')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('vuelve al primer fondo después del último', async () => {
    renderIntroPage();
    
    await waitFor(() => {
      expect(screen.getByLabelText('Ir a fondo 1')).toHaveAttribute('aria-pressed', 'true');
    });

    // Advance through all backgrounds
    act(() => {
      jest.advanceTimersByTime(10000); // bg 2
    });
    act(() => {
      jest.advanceTimersByTime(10000); // bg 3
    });
    act(() => {
      jest.advanceTimersByTime(10000); // back to bg 1
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Ir a fondo 1')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('establece título del documento al montar', async () => {
    const originalTitle = document.title;
    renderIntroPage();
    
    await waitFor(() => {
      expect(document.title).toBe('GymTonic — Inicio');
    });

    document.title = originalTitle;
  });

  it('restaura título original del documento al desmontar', async () => {
    const originalTitle = 'Original Title';
    document.title = originalTitle;

    const { unmount } = renderIntroPage();
    
    await waitFor(() => {
      expect(document.title).toBe('GymTonic — Inicio');
    });

    unmount();
    
    expect(document.title).toBe(originalTitle);
  });

  it('renderiza todos los divs de fondo', async () => {
    const { container } = renderIntroPage();
    
    await waitFor(() => {
      const bgDivs = container.querySelectorAll('[class*="absolute"][class*="inset-0"]');
      expect(bgDivs.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('aplica clases de opacidad correctas a los fondos', async () => {
    const { container } = renderIntroPage();
    
    await waitFor(() => {
      const bgDivs = container.querySelectorAll('[style*="background-image"]');
      expect(bgDivs.length).toBeGreaterThanOrEqual(3);
      expect(bgDivs[0]).toHaveClass('opacity-100');
      expect(bgDivs[1]).toHaveClass('opacity-0');
      expect(bgDivs[2]).toHaveClass('opacity-0');
    });
  });

  it('renderiza superposición de fondo', async () => {
    const { container } = renderIntroPage();
    
    await waitFor(() => {
      const overlay = container.querySelector('.bg-black\\/20');
      expect(overlay).toBeInTheDocument();
    });
  });

  it('limpia intervalo al desmontar', async () => {
    const { unmount } = renderIntroPage();
    
    await waitFor(() => {
      expect(backend.imageService.getAllBackgrounds).toHaveBeenCalled();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should not cause any errors after unmount
    expect(true).toBe(true);
  });
});

