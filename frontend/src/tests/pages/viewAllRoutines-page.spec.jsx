import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ViewAllRoutines from '../../modules/app/pages/viewAllRoutines-page';
import { UserContext } from '../../modules/app/components/common/user-provider';

const mockViewAllRoutines = jest.fn();
const mockDeleteRoutine = jest.fn();
const mockModifyRoutine = jest.fn();

jest.mock('../../backend', () => ({
  routineService: {
    viewAllRoutines: (...args) => mockViewAllRoutines(...args),
    deleteRoutine: (...args) => mockDeleteRoutine(...args),
    modifyRoutine: (...args) => mockModifyRoutine(...args),
  },
}));

const createRoutine = (overrides = {}) => {
  const creator = Object.assign(new String('coach'), { id: 99, userName: 'coach' });

  return {
    id: 1,
    name: 'Full Body',
    duration: 45,
    isPublic: true,
    creator,
    exercises: [
      { id: 1, name: 'Push Up', grupoMuscular: 'PECHO' },
      { id: 2, name: 'Squat', grupoMuscular: 'PIERNAS' },
    ],
    ...overrides,
  };
};

const renderWithUser = (user) =>
  render(
    <UserContext.Provider value={{ user }}>
      <MemoryRouter>
        <ViewAllRoutines />
      </MemoryRouter>
    </UserContext.Provider>
  );

describe('ViewAllRoutines page', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockViewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [createRoutine()], existMoreItems: false });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('carga y renderiza rutinas con capacidades de edición para usuarios admin', async () => {
    mockModifyRoutine.mockImplementation((id, name, exercises, duration, isPublic, onSuccess) => {
      onSuccess(
        createRoutine({
          id,
          name,
          duration,
          exercises: exercises.map((exerciseId) => ({
            id: exerciseId,
            name: `Exercise ${exerciseId}`,
            grupoMuscular: 'PECHO',
          })),
        })
      );
    });

    renderWithUser({ id: 1, role: 'ADMIN', userName: 'admin' });

    await waitFor(() => {
      expect(screen.getByText('Rutinas disponibles')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar'));

    const nameInput = screen.getByPlaceholderText('Nombre de la rutina');
    fireEvent.change(nameInput, { target: { value: 'Updated Routine' } });

    const durationInput = screen.getByPlaceholderText('Duración (min)');
    fireEvent.change(durationInput, { target: { value: '60' } });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mockModifyRoutine).toHaveBeenCalledWith(
        1,
        'Updated Routine',
        [1, 2],
        60,
        true,
        expect.any(Function),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/actualizada exitosamente/)).toBeInTheDocument();
      expect(screen.getByText('Updated Routine')).toBeInTheDocument();
    });

    act(() => {
      jest.runAllTimers();
    });
  });

  it('permite eliminar rutinas después de confirmación', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockDeleteRoutine.mockImplementation((id, onSuccess) => onSuccess());

    renderWithUser({ id: 99, role: 'ADMIN', userName: 'admin' });

    await waitFor(() => {
      expect(screen.getByText('Full Body')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Eliminar'));

    await waitFor(() => {
      expect(mockDeleteRoutine).toHaveBeenCalledWith(1, expect.any(Function), expect.any(Function));
    });

    await waitFor(() => {
      expect(screen.queryByText('Full Body')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Todavía no hay rutinas disponibles')).toBeInTheDocument();
    });

    act(() => {
      jest.runAllTimers();
    });

    confirmSpy.mockRestore();
  });

  it('muestra error cuando falla la carga de rutinas', async () => {
    mockViewAllRoutines.mockImplementationOnce((params, onSuccess, onError) => {
      onError('Error al cargar rutinas');
    });

    renderWithUser({ id: 1, role: 'ADMIN', userName: 'admin' });

    await waitFor(() => {
      expect(screen.getByText('Error al cargar rutinas')).toBeInTheDocument();
    });
  });
});

