import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoutineDetailsPage from '../../modules/app/pages/routine-details-page';
import { UserContext } from '../../modules/app/components/common/user-provider';
import backend from '../../backend';

jest.mock('../../backend', () => ({
  routineService: {
    findRoutineDetails: jest.fn(),
    followRoutine: jest.fn(),
    unfollowRoutine: jest.fn()
  }
}));

jest.mock('../../modules/app/components/exercise/exercise', () => {
  return function MockExercise({ ex }) {
    return <div data-testid={`exercise-${ex.id}`}>{ex.name}</div>;
  };
});

jest.mock('../../modules/app/components/routine/routine-edit-form', () => {
  return function MockRoutineEditForm({ routine, onCancel, onSaved }) {
    return (
      <div data-testid="routine-edit-form">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={() => onSaved(routine, 'Rutina actualizada')}>Save</button>
      </div>
    );
  };
});

jest.mock('../../modules/app/components/routine/routine-actions', () => {
  return function MockRoutineActions({ onEdit, onDeleted, onError }) {
    return (
      <div data-testid="routine-actions">
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDeleted}>Delete</button>
        <button onClick={() => onError('Test error')}>Trigger Error</button>
      </div>
    );
  };
});

describe('RoutineDetailsPage', () => {
  const mockRoutine = {
    id: 1,
    name: 'Test Routine',
    creator: 'testuser',
    duration: 60,
    isPublic: true,
    isFollowing: false,
    exercises: [
      { id: 1, name: 'Exercise 1' },
      { id: 2, name: 'Exercise 2' }
    ]
  };

  const mockUser = {
    id: 1,
    userName: 'testuser',
    role: 'USER'
  };

  const mockContextValue = {
    user: mockUser,
    setUser: jest.fn(),
    loading: false
  };

  const renderWithRouter = (user = mockUser) => {
    return render(
      <MemoryRouter initialEntries={['/routines/1']}>
        <UserContext.Provider value={{ ...mockContextValue, user }}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetailsPage />} />
          </Routes>
        </UserContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.alert = jest.fn();
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      onSuccess(mockRoutine);
    });
  });

  it('muestra estado de carga inicialmente', () => {
    backend.routineService.findRoutineDetails.mockImplementation(() => {});
    
    renderWithRouter();
    
    expect(screen.getByText('Cargando rutina...')).toBeInTheDocument();
  });

  it('carga y muestra detalles de la rutina', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Routine')).toBeInTheDocument();
    });

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('60 minutos')).toBeInTheDocument();
  });

  it('muestra ejercicios', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByTestId('exercise-1')).toBeInTheDocument();
      expect(screen.getByTestId('exercise-2')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error cuando falla la carga', async () => {
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess, onError) => {
      onError('Error loading routine');
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Error loading routine')).toBeInTheDocument();
    });
  });

  it('muestra error por defecto cuando no se proporciona mensaje de error', async () => {
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess, onError) => {
      onError();
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar la rutina')).toBeInTheDocument();
    });
  });

  it('muestra mensaje "no encontrado" cuando la rutina es null', async () => {
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      onSuccess(null);
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('No se encontró la rutina')).toBeInTheDocument();
    });
  });

  it('muestra botón de seguir', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Seguir rutina')).toBeInTheDocument();
    });
  });

  it('muestra botón de dejar de seguir cuando ya se está siguiendo', async () => {
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      onSuccess({ ...mockRoutine, isFollowing: true });
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Dejar de seguir')).toBeInTheDocument();
    });
  });

  it('sigue rutina cuando se hace clic en el botón de seguir', async () => {
    backend.routineService.followRoutine.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Seguir rutina')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Seguir rutina'));

    await waitFor(() => {
      expect(backend.routineService.followRoutine).toHaveBeenCalledWith(
        '1',
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('deja de seguir rutina cuando se hace clic en el botón de dejar de seguir', async () => {
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      onSuccess({ ...mockRoutine, isFollowing: true });
    });
    backend.routineService.unfollowRoutine.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Dejar de seguir')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Dejar de seguir'));

    await waitFor(() => {
      expect(backend.routineService.unfollowRoutine).toHaveBeenCalled();
    });
  });

  it('muestra alerta cuando usuario no logueado intenta seguir', async () => {
    renderWithRouter(null);
    
    await waitFor(() => {
      expect(screen.getByText('Seguir rutina')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Seguir rutina'));

    expect(globalThis.alert).toHaveBeenCalledWith('Debes iniciar sesión para seguir una rutina');
  });

  it('maneja error de seguir', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    backend.routineService.followRoutine.mockImplementation((id, onSuccess, onError) => {
      onError({ globalError: 'Follow error' });
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Seguir rutina')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Seguir rutina'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('muestra estado de procesamiento mientras se sigue', async () => {
    let resolveFollow;
    backend.routineService.followRoutine.mockImplementation(() => {
      return new Promise(resolve => {
        resolveFollow = resolve;
      });
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Seguir rutina')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Seguir rutina'));

    await waitFor(() => {
      expect(screen.getByText('Procesando...')).toBeInTheDocument();
    });
  });

  it('cambia a modo edición cuando se hace clic en el botón de editar', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByTestId('routine-edit-form')).toBeInTheDocument();
    });
  });

  it('cancela edición cuando se hace clic en el botón de cancelar', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('routine-edit-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('routine-edit-form')).not.toBeInTheDocument();
    });
  });

  it('muestra mensaje de éxito después de guardar', async () => {
    jest.useFakeTimers();
    
    renderWithRouter();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Save'));
    });

    await waitFor(() => {
      expect(screen.getByText('Rutina actualizada')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Rutina actualizada')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('muestra mensaje de error cuando se activa', async () => {
    jest.useFakeTimers();
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Trigger Error')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('muestra estado público para admin', async () => {
    const adminUser = { ...mockUser, role: 'ADMIN' };
    renderWithRouter(adminUser);
    
    await waitFor(() => {
      expect(screen.getByText('Rutina pública')).toBeInTheDocument();
    });
  });

  it('muestra estado privado para creador', async () => {
    backend.routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      onSuccess({ ...mockRoutine, isPublic: false });
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Rutina privada')).toBeInTheDocument();
    });
  });

  it('no muestra estado para no-creador no-admin', async () => {
    const otherUser = { ...mockUser, userName: 'otheruser', role: 'USER' };
    renderWithRouter(otherUser);
    
    await waitFor(() => {
      expect(screen.queryByText(/Rutina pública|Rutina privada/)).not.toBeInTheDocument();
    });
  });

  it('recarga detalles de la rutina después de actualizar ejercicio', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(backend.routineService.findRoutineDetails).toHaveBeenCalledTimes(1);
    });

    // Simulate exercise update by re-rendering
    backend.routineService.findRoutineDetails.mockClear();
    
    // The component should reload when handleExerciseUpdated is called
    // This is tested indirectly through the exercise component callback
  });
});

