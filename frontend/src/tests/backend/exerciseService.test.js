import * as exerciseService from '../../backend/exerciseService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('exerciseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appFetch.mockImplementation((path, options, onSuccess) => {
      if (onSuccess) onSuccess({});
    });
    fetchConfig.mockImplementation((method, body) => ({ method, body }));
  });

  describe('addExercise', () => {
    it('llama appFetch con parámetros correctos', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.addExercise(
        'Bench Press',
        'Chest exercise',
        'PECHO',
        3,
        'INTERMEDIO',
        'BARRA',
        onSuccess,
        onErrors
      );
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/addExercise',
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function),
        onErrors
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('getValidatedExercises', () => {
    it('llama appFetch con parámetros page y size', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.getValidatedExercises({ page: 0, size: 10 }, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/getValidatedExercises?page=0&size=10',
        expect.objectContaining({ method: 'GET' }),
        expect.any(Function),
        onErrors
      );
    });
  });

  describe('getUnvalidatedExercises', () => {
    it('llama appFetch con parámetros page y size', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.getUnvalidatedExercises({ page: 0, size: 10 }, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/getUnvalidatedExercises?page=0&size=10',
        expect.objectContaining({ method: 'GET' }),
        expect.any(Function),
        onErrors
      );
    });
  });

  describe('validateExercise', () => {
    it('llama appFetch con ID de ejercicio', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.validateExercise(123, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/validateExercise/123',
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function),
        onErrors
      );
    });
  });

  describe('declineExercise', () => {
    it('llama appFetch con ID de ejercicio', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.declineExercise(123, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/declineExercise/123',
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function),
        onErrors
      );
    });
  });

  describe('getSerie', () => {
    it('llama appFetch con ID de serie', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.getSerie(456, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/Series?serieId=456',
        expect.objectContaining({ method: 'GET' }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('modifySerie', () => {
    it('llama appFetch con ID de serie, repeticiones y peso', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.modifySerie(456, 12, 50, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/Series?serieId=456&repeticiones=12&peso=50',
        expect.objectContaining({ method: 'PUT' }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('createSeries', () => {
    it('llama appFetch con exercise, numSeries y routineId', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      const exercise = { id: 1, name: 'Squat' };
      
      exerciseService.createSeries(exercise, 4, 789, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/Series?numSeries=4&routineId=789',
        expect.objectContaining({ method: 'POST', body: exercise }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('getSerieByExercise', () => {
    it('llama appFetch con exerciseId y routineId', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.getSerieByExercise(111, 222, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/exerciseSeries?exerciseId=111&routineId=222',
        expect.objectContaining({ method: 'GET' }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('blockExercise', () => {
    it('llama appFetch con ID de ejercicio', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.blockExercise(333, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/blockExercise/333',
        expect.objectContaining({ method: 'POST' }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('createSerie', () => {
    it('llama appFetch con exerciseId y routineId', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.createSerie(444, 555, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/Series/create?exerciseId=444&routineId=555',
        expect.objectContaining({ method: 'POST' }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('deleteSerie', () => {
    it('llama appFetch con ID de serie', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.deleteSerie(666, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/Series/666',
        expect.objectContaining({ method: 'DELETE' }),
        onSuccess,
        onErrors
      );
    });
  });

  describe('editRestTime', () => {
    it('llama appFetch con exerciseId, routineId y restTime', () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();
      
      exerciseService.editRestTime(777, 888, 60, onSuccess, onErrors);
      
      expect(appFetch).toHaveBeenCalledWith(
        '/exercise/restTime?routineId=888&exerciseId=777&restTime=60',
        expect.objectContaining({ method: 'PUT' }),
        onSuccess,
        onErrors
      );
    });
  });
});

