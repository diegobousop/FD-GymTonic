import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import MyRoutines from '../../modules/app/pages/my-routines-page';
import { UserContext } from '../../modules/app/components/common/user-provider';
import backend from '../../backend';

jest.mock('../../backend', () => ({
  routineService: {
    searchRoutines: jest.fn()
  }
}));

jest.mock('../../modules/app/components/common/pager', () => {
  return function MockPager({ back, next }) {
    return (
      <div data-testid="pager">
        <button onClick={back.onClick} disabled={!back.enabled} data-testid="back-button">
          Back
        </button>
        <button onClick={next.onClick} disabled={!next.enabled} data-testid="next-button">
          Next
        </button>
      </div>
    );
  };
});

jest.mock('../../modules/app/components/routine/routine-card', () => {
  return function MockRoutineCard({ routine }) {
    return <div data-testid={`routine-card-${routine.id}`}>{routine.name}</div>;
  };
});

describe('MyRoutines', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser',
    role: 'TRAINER'
  };

  const mockContextValue = {
    user: mockUser,
    setUser: jest.fn(),
    loading: false,
    handleLogout: jest.fn(),
    refreshUser: jest.fn(),
    pendingInvites: 0,
    setPendingInvites: jest.fn()
  };

  const mockRoutines = {
    items: [
      { id: 1, name: 'Routine 1', creator: 'testuser' },
      { id: 2, name: 'Routine 2', creator: 'testuser' },
      { id: 3, name: 'Routine 3', creator: 'testuser' }
    ],
    existMoreItems: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    backend.routineService.searchRoutines.mockImplementation((userId, search, params, onSuccess) => {
      onSuccess(mockRoutines);
    });
  });

  const renderMyRoutines = (user = mockUser) => {
    return render(
      <UserContext.Provider value={{ ...mockContextValue, user }}>
        <MemoryRouter>
          <MyRoutines />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('renderiza sin fallar', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('Routine 1')).toBeInTheDocument();
    });
  });

  it('obtiene rutinas al montar', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(backend.routineService.searchRoutines).toHaveBeenCalledWith(
        1,
        '',
        { page: 0, size: 4 },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('muestra estado de carga', () => {
    backend.routineService.searchRoutines.mockImplementation(() => {
      // Don't call onSuccess to keep loading state
    });

    renderMyRoutines();
    
    expect(screen.getByText('Cargando rutinas...')).toBeInTheDocument();
  });

  it('renderiza todas las rutinas', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('Routine 1')).toBeInTheDocument();
      expect(screen.getByText('Routine 2')).toBeInTheDocument();
      expect(screen.getByText('Routine 3')).toBeInTheDocument();
    });
  });

  it('renderiza tarjetas de rutina', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByTestId('routine-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('routine-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('routine-card-3')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error al fallar la obtención', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.routineService.searchRoutines.mockImplementation((userId, search, params, onSuccess, onError) => {
      onError('Network error');
    });

    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('muestra mensaje de error por defecto cuando el error es undefined', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.routineService.searchRoutines.mockImplementation((userId, search, params, onSuccess, onError) => {
      onError(undefined);
    });

    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('Error inesperado al cargar rutinas')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('muestra mensaje cuando no existen rutinas', async () => {
    backend.routineService.searchRoutines.mockImplementation((userId, search, params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('No has creado ninguna rutina')).toBeInTheDocument();
    });
  });

  it('renderiza componente de paginación', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });
  });

  it('deshabilita botón atrás en la primera página', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
    });
  });

  it('habilita botón siguiente cuando hay más elementos', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('obtiene siguiente página cuando se hace clic en el botón siguiente', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('Routine 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(backend.routineService.searchRoutines).toHaveBeenCalledWith(
        1,
        '',
        { page: 1, size: 4 },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('obtiene página anterior cuando se hace clic en el botón atrás', async () => {
    renderMyRoutines();
    
    await waitFor(() => {
      expect(screen.getByText('Routine 1')).toBeInTheDocument();
    });

    // Go to page 1 first
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(backend.routineService.searchRoutines).toHaveBeenLastCalledWith(
        1,
        '',
        { page: 1, size: 4 },
        expect.any(Function),
        expect.any(Function)
      );
    });

    // Go back to page 0
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(backend.routineService.searchRoutines).toHaveBeenLastCalledWith(
        1,
        '',
        { page: 0, size: 4 },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('no obtiene rutinas cuando el usuario es null', () => {
    renderMyRoutines(null);
    
    expect(backend.routineService.searchRoutines).not.toHaveBeenCalled();
  });

  it('vuelve a obtener rutinas cuando cambia el usuario', async () => {
    const { rerender } = renderMyRoutines();
    
    await waitFor(() => {
      expect(backend.routineService.searchRoutines).toHaveBeenCalledTimes(1);
    });

    const newUser = { ...mockUser, id: 2 };
    rerender(
      <UserContext.Provider value={{ ...mockContextValue, user: newUser }}>
        <MemoryRouter>
          <MyRoutines />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(backend.routineService.searchRoutines).toHaveBeenCalledWith(
        2,
        '',
        { page: 0, size: 4 },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('logs error to console when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.routineService.searchRoutines.mockImplementation((userId, search, params, onSuccess, onError) => {
      onError('API Error');
    });

    renderMyRoutines();
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error cargando rutinas:', 'API Error');
    });

    consoleErrorSpy.mockRestore();
  });
});

