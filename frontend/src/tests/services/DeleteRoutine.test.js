import { deleteRoutine } from '../../backend/routineService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn()
}));

describe('deleteRoutine service', () => {
  const mockOnSuccess = jest.fn();
  const mockOnErrors = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockReturnValue({ method: 'DELETE', headers: {} });
  });

  test('llamar a appFetch con parámetros correctos para eliminación válida de rutina', () => {
    const routineId = 1;

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(fetchConfig).toHaveBeenCalledWith('DELETE');
    expect(appFetch).toHaveBeenCalledWith(
      `/routines/deleteRoutine/${routineId}`,
      { method: 'DELETE', headers: {} },
      mockOnSuccess,
      mockOnErrors
    );
  });

  test('Rutina Eliminada Correctamente', () => {
    const routineId = 1;

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onSuccess();
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnErrors).not.toHaveBeenCalled();
  });

  test('manejar error de rutina no encontrada', () => {
    const routineId = 999;
    const mockError = { globalError: 'Routine not found' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar error de permisos', () => {
    const routineId = 1;
    const mockError = { globalError: 'Permission denied' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar excepción de permisos del backend', () => {
    const routineId = 1;
    const mockError = { globalError: 'project.exceptions.PermissionException' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar excepción de instancia no encontrada del backend', () => {
    const routineId = 999;
    const mockError = { globalError: 'project.exceptions.InstanceNotFoundException' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('manejar error de red', () => {
    const routineId = 1;
    const networkError = new Error('Network error');

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      throw networkError;
    });

    expect(() => {
      deleteRoutine(routineId, mockOnSuccess, mockOnErrors);
    }).toThrow('Network error');
  });

  test('manejar error del servidor', () => {
    const routineId = 1;
    const mockError = { globalError: 'Internal server error' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('eliminar diferentes IDs de rutina correctamente', () => {
    const testCases = [1, 5, 10, 100, 999];

    testCases.forEach(routineId => {
      deleteRoutine(routineId, mockOnSuccess, mockOnErrors);
      
      expect(fetchConfig).toHaveBeenCalledWith('DELETE');
      expect(appFetch).toHaveBeenCalledWith(
        `/routines/deleteRoutine/${routineId}`,
        { method: 'DELETE', headers: {} },
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  test('manejar eliminación con mensaje de error personalizado', () => {
    const routineId = 1;
    const mockError = { globalError: 'Cannot delete routine with active sessions' };

    appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
      onErrors(mockError);
    });

    deleteRoutine(routineId, mockOnSuccess, mockOnErrors);

    expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
