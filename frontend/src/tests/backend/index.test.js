beforeEach(() => {
  jest.resetModules();
});

describe('backend index', () => {
  it('re-exporta todos los servicios esperados', () => {
    jest.isolateModules(() => {
      const backendModule = require('../../backend');
      const backend = backendModule.default;
      const { init } = require('../../backend/appFetch');
      const userService = require('../../backend/userService');
      const routineService = require('../../backend/routineService');
      const exerciseService = require('../../backend/exerciseService');
      const imageService = require('../../backend/imageService');
      const notificationService = require('../../backend/notificationService');
      const searchService = require('../../backend/searchService');

      expect(backend.init).toBe(init);
      expect(backend.userService).toBe(userService);
      expect(backend.routineService).toBe(routineService);
      expect(backend.exerciseService).toBe(exerciseService);
      expect(backend.imageService).toBe(imageService);
      expect(backend.notificationService).toBe(notificationService);
      expect(backend.searchService).toBe(searchService);
    });
  });

  it('re-exporta constructor NetworkError', () => {
    jest.isolateModules(() => {
      const { NetworkError } = require('../../backend');
      const NetworkErrorImplementation = require('../../backend/NetworkError').default;

      expect(NetworkError).toBe(NetworkErrorImplementation);
      expect(() => {
        throw new NetworkError('message', {});
      }).toThrow(NetworkErrorImplementation);
    });
  });
});

