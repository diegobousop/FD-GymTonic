 import { modifyRoutine } from '../../backend/routineService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn()
}));

describe('modifyRoutine service', () => {
  const mockOnSuccess = jest.fn();
  const mockOnErrors = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockReturnValue({ method: 'PUT', headers: {} });
  });

  test('llamar a appFetch con parámetros correctos para modificación válida de rutina', () => {
    const routineId = 1;
    const name = 'Updated Routine';
    const exercises = [1, 2, 3];
    const duration = 60;

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(fetchConfig).toHaveBeenCalledWith('PUT', { name, exercises, duration });
    expect(appFetch).toHaveBeenCalledWith(
      `/routines/modifyRoutine/${routineId}`,
      { method: 'PUT', headers: {} },
      mockOnSuccess,
      mockOnErrors
    );
  });

  test('Rutina Modificada Correctamente', () => {
    const routineId = 1;
    const name = 'Updated Routine';
    const exercises = [1, 2, 3];
    const duration = 60;
    const mockUpdatedRoutine = {
      id: 1,
      name: 'Updated Routine',
      exercises: [
        { id: 1, name: 'Push Up', grupoMuscular: 'PECHO' },
        { id: 2, name: 'Squat', grupoMuscular: 'PIERNA' },
        { id: 3, name: 'Pull Up', grupoMuscular: 'ESPALDA' }
      ],
      duration: 60,
      creator: 'testuser'
    };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onSuccess(mockUpdatedRoutine);
    });

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(mockOnSuccess).toHaveBeenCalledWith(mockUpdatedRoutine);
    expect(mockOnErrors).not.toHaveBeenCalled();
  });

  test('manejar error de rutina no encontrada', () => {
    const routineId = 999;
    const name = 'Updated Routine';
    const exercises = [1, 2, 3];
    const duration = 60;
    const mockError = { globalError: 'Routine not found' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar error de permisos', () => {
    const routineId = 1;
    const name = 'Updated Routine';
    const exercises = [1, 2, 3];
    const duration = 60;
    const mockError = { globalError: 'Permission denied' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar error de nombre de rutina inválido', () => {
    const routineId = 1;
    const name = '';
    const exercises = [1, 2, 3];
    const duration = 60;
    const mockError = { globalError: 'project.exceptions.InvalidRoutineNameException' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar error de duración de rutina inválida', () => {
    const routineId = 1;
    const name = 'Valid Name';
    const exercises = [1, 2, 3];
    const duration = 0;
    const mockError = { globalError: 'project.exceptions.InvalidRoutineDurationException' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar error de red', () => {
    const routineId = 1;
    const name = 'Updated Routine';
    const exercises = [1, 2, 3];
    const duration = 60;
    const networkError = new Error('Network error');

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      throw networkError;
    });

    expect(() => {
      modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);
    }).toThrow('Network error');
  });

  test('modificar rutina con array de ejercicios vacío', () => {
    const routineId = 1;
    const name = 'Routine without exercises';
    const exercises = [];
    const duration = 30;

    modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);

    expect(fetchConfig).toHaveBeenCalledWith('PUT', { name, exercises, duration });
    expect(appFetch).toHaveBeenCalledWith(
      `/routines/modifyRoutine/${routineId}`,
      { method: 'PUT', headers: {} },
      mockOnSuccess,
      mockOnErrors
    );
  });

  test('modificar rutina con diferentes valores de duración', () => {
    const testCases = [
      { routineId: 1, name: 'Short Routine', exercises: [1], duration: 15 },
      { routineId: 2, name: 'Medium Routine', exercises: [1, 2], duration: 45 },
      { routineId: 3, name: 'Long Routine', exercises: [1, 2, 3], duration: 120 }
    ];

    testCases.forEach(({ routineId, name, exercises, duration }) => {
      modifyRoutine(routineId, name, exercises, duration, mockOnSuccess, mockOnErrors);
      
      expect(fetchConfig).toHaveBeenCalledWith('PUT', { name, exercises, duration });
      expect(appFetch).toHaveBeenCalledWith(
        `/routines/modifyRoutine/${routineId}`,
        { method: 'PUT', headers: {} },
        mockOnSuccess,
        mockOnErrors
      );
    });
  });
});
