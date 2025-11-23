import * as searchService from '../../backend/searchService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('searchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockImplementation((method, body) => ({ method, body }));
  });

  describe('getSearchSuggestions', () => {
    it('llama appFetch con consulta codificada', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      searchService.getSearchSuggestions('test query', mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/search/suggestions?text=test%20query',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('maneja caracteres especiales en consulta', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      searchService.getSearchSuggestions('test & query', mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/search/suggestions?text=test%20%26%20query',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('llama onSuccess con datos de sugerencias', () => {
      const mockSuggestions = ['suggestion1', 'suggestion2', 'suggestion3'];
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockSuggestions);
      });

      searchService.getSearchSuggestions('test', mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockSuggestions);
    });

    it('maneja consulta vacía', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      searchService.getSearchSuggestions('', mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/search/suggestions?text=',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('searchResults', () => {
    it('llama appFetch con todos los parámetros de búsqueda', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const params = {
        text: 'workout',
        trainerName: 'John',
        muscleGroup: 'PECHO',
        difficulty: 'INTERMEDIO',
        limit: 10,
      };

      searchService.searchResults(params, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/full?'),
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );

      const callArgs = appFetch.mock.calls[0][0];
      expect(callArgs).toContain('text=workout');
      expect(callArgs).toContain('trainerName=John');
      expect(callArgs).toContain('muscleGroup=PECHO');
      expect(callArgs).toContain('difficulty=INTERMEDIO');
      expect(callArgs).toContain('limit=10');
    });

    it('llama appFetch solo con parámetro text', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const params = {
        text: 'fitness',
      };

      searchService.searchResults(params, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/search/full?text=fitness',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('maneja parámetros vacíos', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const params = {};

      searchService.searchResults(params, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/search/full?',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('llama onSuccess con resultados de búsqueda', () => {
      const mockResults = {
        exercises: [{ id: 1, name: 'Exercise 1' }],
        routines: [{ id: 2, name: 'Routine 1' }],
        users: [{ id: 3, userName: 'User1' }],
      };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockResults);
      });

      searchService.searchResults({ text: 'test' }, mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockResults);
    });

    it('maneja parámetros parciales', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const params = {
        text: 'bench press',
        muscleGroup: 'PECHO',
      };

      searchService.searchResults(params, mockOnSuccess, mockOnErrors);

      const callArgs = appFetch.mock.calls[0][0];
      expect(callArgs).toContain('text=bench+press');
      expect(callArgs).toContain('muscleGroup=PECHO');
      expect(callArgs).not.toContain('trainerName');
      expect(callArgs).not.toContain('difficulty');
    });

    it('maneja parámetro limit', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const params = {
        text: 'exercise',
        limit: 20,
      };

      searchService.searchResults(params, mockOnSuccess, mockOnErrors);

      const callArgs = appFetch.mock.calls[0][0];
      expect(callArgs).toContain('limit=20');
    });
  });

  describe('Manejo de Errores', () => {
    it('pasa errores a callback onErrors para getSearchSuggestions', () => {
      const mockError = { globalError: 'Search failed' };
      const mockOnErrors = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
        onErrors(mockError);
      });

      searchService.getSearchSuggestions('test', jest.fn(), mockOnErrors);

      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });

    it('pasa errores a callback onErrors para searchResults', () => {
      const mockError = { globalError: 'Server error' };
      const mockOnErrors = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
        onErrors(mockError);
      });

      searchService.searchResults({ text: 'test' }, jest.fn(), mockOnErrors);

      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });
  });
});

