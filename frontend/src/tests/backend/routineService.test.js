import * as routineService from '../../backend/routineService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('routineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockImplementation((method, body) => ({ method, body }));
  });

  describe('createRoutine', () => {
    it('llama appFetch con datos de rutina', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.createRoutine(
        'Routine 1',
        [{ id: 1 }, { id: 2 }],
        60,
        true,
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/createRoutine',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('findRoutineById', () => {
    it('llama appFetch con ID de rutina', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.findRoutineById(123, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/getRoutineById/123',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('findRoutineDetails', () => {
    it('llama appFetch con ID de rutina', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.findRoutineDetails(456, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/getRoutineDetailsById/456',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('viewAllRoutines', () => {
    it('llama appFetch con paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.viewAllRoutines(
        { page: 0, size: 10 },
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/viewAllRoutines?page=0&size=10',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('deleteRoutine', () => {
    it('llama appFetch con ID de rutina', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.deleteRoutine(789, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/deleteRoutine/789',
        expect.objectContaining({ method: 'DELETE' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('modifyRoutine', () => {
    it('llama appFetch con datos de rutina modificados', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.modifyRoutine(
        101,
        'Modified Routine',
        [{ id: 3 }],
        45,
        false,
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/modifyRoutine/101',
        expect.objectContaining({ method: 'PUT' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('searchRoutines', () => {
    it('llama appFetch con parámetros de búsqueda', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.searchRoutines(
        5,
        'strength',
        { page: 0, size: 20 },
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/search?creatorId=5&name=strength&page=0&size=20',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('maneja creatorId y name vacíos', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.searchRoutines(
        null,
        '',
        { page: 0, size: 10 },
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/search?creatorId=&name=&page=0&size=10',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('createTraining', () => {
    it('llama appFetch con datos de entrenamiento', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.createTraining(
        {
          routineId: 10,
          name: 'Morning Workout',
          description: 'Full body',
          duration: 60,
          visibility: 'PUBLIC',
          exercises: [{ id: 1, series: 3 }]
        },
        {
          onSuccess: mockOnSuccess,
          onErrors: mockOnErrors
        }
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/createTraining',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('llama onSuccess con entrenamiento creado', () => {
      const mockTraining = { id: 999, name: 'Test Training' };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockTraining);
      });

      routineService.createTraining(
        {
          routineId: 10,
          name: 'Test',
          description: 'Desc',
          duration: 30,
          visibility: 'PRIVATE',
          exercises: []
        },
        {
          onSuccess: mockOnSuccess,
          onErrors: jest.fn()
        }
      );

      expect(mockOnSuccess).toHaveBeenCalledWith(mockTraining);
    });
  });

  describe('followRoutine', () => {
    it('llama appFetch para seguir rutina', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.followRoutine(50, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/50/follow',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('unfollowRoutine', () => {
    it('llama appFetch para dejar de seguir rutina', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.unfollowRoutine(60, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/60/unfollow',
        expect.objectContaining({ method: 'DELETE' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getFollowersByRoutine', () => {
    it('llama appFetch con ID de rutina y paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.getFollowersByRoutine(
        70,
        { page: 1, size: 15 },
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/70/followers?page=1&size=15',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('isFollowingRoutine', () => {
    it('llama appFetch para verificar si está siguiendo', () => {
      routineService.isFollowingRoutine(80);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/80/is-following'
      );
    });
  });

  describe('viewUserTrainings', () => {
    it('llama appFetch con paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.viewUserTrainings(4,0, 10, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        `/routines/findTrainings/4?page=0&size=10`,
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('viewDayTrainings', () => {
    it('llama appFetch con fecha y paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.viewDayTrainings(
        0,
        5,
        15,
        11,
        2024,
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/findDayTrainings?day=15&month=11&year=2024&page=0&size=5',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getTrainingCalendarStats', () => {
    it('llama appFetch con año', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.getTrainingCalendarStats(2024, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/getTrainingCalendarStats?year=2024',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('viewFeed', () => {
    it('llama appFetch sin paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      routineService.viewFeed(mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/routines/feed',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('llama onSuccess con los datos del feed', () => {
      const mockFeed = {
        items: [
          { id: 1, name: 'Training 1' },
          { id: 2, name: 'Training 2' }
        ],
        existMoreItems: false
      };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockFeed);
      });

      routineService.viewFeed(mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockFeed);
    });
  });
});
