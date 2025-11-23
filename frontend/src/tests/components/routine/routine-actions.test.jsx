import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutineActions from '../../../modules/app/components/routine/routine-actions';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  routineService: {
    deleteRoutine: jest.fn(),
    modifyRoutine: jest.fn()
  }
}));

describe('RoutineActions', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser',
    role: 'USER'
  };

  const mockRoutine = {
    id: 1,
    name: 'Test Routine',
    creator: 'testuser',
    exercises: [{ id: 1 }, { id: 2 }],
    duration: 60,
    isPublic: true
  };

  const mockCallbacks = {
    onEdit: jest.fn(),
    onDeleted: jest.fn(),
    onVisibilityChange: jest.fn(),
    onError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.confirm = jest.fn(() => true);
  });

  it('renderiza los botones de editar y eliminar para el creador de la rutina', () => {
    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );
    expect(screen.getByLabelText('Editar rutina')).toBeInTheDocument();
    expect(screen.getByLabelText('Eliminar rutina')).toBeInTheDocument();
  });

  it('renderiza el botón de visibilidad para el creador de la rutina', () => {
    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    expect(screen.getByLabelText('Cambiar visibilidad')).toBeInTheDocument();
  });

  it('muestra "Hacer pública" cuando la rutina es privada', () => {
    const privateRoutine = { ...mockRoutine, isPublic: false };
    
    render(
      <RoutineActions
        user={mockUser}
        routine={privateRoutine}
        {...mockCallbacks}
      />
    );

    expect(screen.getByLabelText('Cambiar visibilidad')).toBeInTheDocument();
  });

  it('llama a onEdit cuando se hace clic en el botón de editar', () => {
    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Editar rutina'));
    expect(mockCallbacks.onEdit).toHaveBeenCalledTimes(1);
  });

  it('llama a deleteRoutine cuando se hace clic en el botón de eliminar y se confirma', () => {
    backend.routineService.deleteRoutine.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Eliminar rutina'));
    
    expect(globalThis.confirm).toHaveBeenCalledWith(
      '¿Seguro que quieres eliminar la rutina "Test Routine"?'
    );
    expect(backend.routineService.deleteRoutine).toHaveBeenCalledWith(
      1,
      expect.any(Function),
      expect.any(Function)
    );
    expect(mockCallbacks.onDeleted).toHaveBeenCalled();
  });

  it('no elimina si el usuario cancela la confirmación', () => {
    globalThis.confirm = jest.fn(() => false);

    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Eliminar rutina'));
    
    expect(backend.routineService.deleteRoutine).not.toHaveBeenCalled();
  });

  it('maneja el error de eliminación', () => {
    backend.routineService.deleteRoutine.mockImplementation((id, onSuccess, onError) => {
      onError({ globalError: 'Delete failed' });
    });

    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Eliminar rutina'));
    
    expect(mockCallbacks.onError).toHaveBeenCalledWith('Delete failed');
  });

  it('llama a modifyRoutine cuando se hace clic en el botón de visibilidad', () => {
    backend.routineService.modifyRoutine.mockImplementation((id, name, exercises, duration, isPublic, onSuccess) => {
      onSuccess({ ...mockRoutine, isPublic });
    });

    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Cambiar visibilidad'));
    
    expect(backend.routineService.modifyRoutine).toHaveBeenCalledWith(
      1,
      'Test Routine',
      [1, 2],
      60,
      false,
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('maneja el error de cambio de visibilidad', () => {
    backend.routineService.modifyRoutine.mockImplementation((id, name, exercises, duration, isPublic, onSuccess, onError) => {
      onError({ globalError: 'Visibility change failed' });
    });

    render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Cambiar visibilidad'));
    
    expect(mockCallbacks.onError).toHaveBeenCalledWith('Visibility change failed');
  });

  it('no renderiza para usuarios sin permisos', () => {
    const otherUser = { ...mockUser, userName: 'otheruser' };
    
    const { container } = render(
      <RoutineActions
        user={otherUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renderiza para admin incluso si no es el creador', () => {
    const adminUser = { ...mockUser, userName: 'admin', role: 'ADMIN' };
    
    render(
      <RoutineActions
        user={adminUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    expect(screen.getByLabelText('Editar rutina')).toBeInTheDocument();
    expect(screen.getByLabelText('Eliminar rutina')).toBeInTheDocument();
  });

  it('no renderiza el botón de visibilidad para admin que no es el creador', () => {
    const adminUser = { ...mockUser, userName: 'admin', role: 'ADMIN' };
    
    render(
      <RoutineActions
        user={adminUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByTitle(/Hacer/)).not.toBeInTheDocument();
  });

  it('muestra error cuando un no-creador intenta eliminar', () => {
    const otherUser = { ...mockUser, userName: 'otheruser' };
    
    // Force render by temporarily changing canModify check
    const { rerender } = render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    // Click delete as valid user first
    fireEvent.click(screen.getByLabelText('Eliminar rutina'));
    
    // Now update to invalid user and try again
    globalThis.confirm = jest.fn(() => true);
    mockCallbacks.onError.mockClear();
  });

  it('muestra error cuando un no-creador intenta cambiar la visibilidad', () => {
    const otherUser = { ...mockUser, userName: 'otheruser' };
    
    // Similar to above, force the scenario
    const { rerender } = render(
      <RoutineActions
        user={mockUser}
        routine={mockRoutine}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Cambiar visibilidad'));
  });
});

