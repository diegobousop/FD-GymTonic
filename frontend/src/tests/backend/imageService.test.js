import * as imageService from '../../backend/imageService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('imageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockImplementation((method, body) => ({ method, body }));
  });

  describe('getAllBackgrounds', () => {
    it('llama appFetch para obtener fondos', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      imageService.getAllBackgrounds(mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/images/getAllBackgrounds',
        expect.objectContaining({ method: 'GET' }),
        expect.any(Function),
        mockOnErrors
      );
    });

    it('llama onSuccess con datos de fondos', () => {
      const mockBackgrounds = [
        { id: 1, url: 'bg1.jpg' },
        { id: 2, url: 'bg2.jpg' },
      ];
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockBackgrounds);
      });

      imageService.getAllBackgrounds(mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockBackgrounds);
    });

    it('maneja lista de fondos vacía', () => {
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess([]);
      });

      imageService.getAllBackgrounds(mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith([]);
    });
  });

  describe('getImageByName', () => {
    it('llama appFetch con nombre de imagen', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      imageService.getImageByName('logo.png', mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/images/getByName/logo.png',
        expect.objectContaining({ method: 'GET' }),
        expect.any(Function),
        mockOnErrors
      );
    });

    it('llama onSuccess con datos de imagen', () => {
      const mockImage = { name: 'logo.png', url: 'http://example.com/logo.png' };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockImage);
      });

      imageService.getImageByName('logo.png', mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockImage);
    });

    it('maneja caracteres especiales en nombre de imagen', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      imageService.getImageByName('my image 1.png', mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/images/getByName/my image 1.png',
        expect.anything(),
        expect.any(Function),
        mockOnErrors
      );
    });
  });

  describe('getAllAvatars', () => {
    it('llama appFetch con parámetros de paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      imageService.getAllAvatars(0, 10, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/images/getAllAvatars?page=0&size=10',
        expect.objectContaining({ method: 'GET' }),
        expect.any(Function),
        mockOnErrors
      );
    });

    it('llama onSuccess con datos de avatares', () => {
      const mockAvatars = {
        items: [
          { id: 1, name: 'avatar1.jpg' },
          { id: 2, name: 'avatar2.jpg' },
        ],
      };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockAvatars);
      });

      imageService.getAllAvatars(0, 10, mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockAvatars);
    });

    it('maneja diferentes valores de paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      imageService.getAllAvatars(2, 20, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/images/getAllAvatars?page=2&size=20',
        expect.anything(),
        expect.any(Function),
        mockOnErrors
      );
    });

    it('maneja números de página grandes', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      imageService.getAllAvatars(100, 50, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/images/getAllAvatars?page=100&size=50',
        expect.anything(),
        expect.any(Function),
        mockOnErrors
      );
    });
  });

  describe('Manejo de Errores', () => {
    it('pasa errores a callback onErrors para getAllBackgrounds', () => {
      const mockError = { globalError: 'Failed to load backgrounds' };
      const mockOnErrors = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
        onErrors(mockError);
      });

      imageService.getAllBackgrounds(jest.fn(), mockOnErrors);

      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });

    it('pasa errores a callback onErrors para getImageByName', () => {
      const mockError = { globalError: 'Image not found' };
      const mockOnErrors = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
        onErrors(mockError);
      });

      imageService.getImageByName('missing.jpg', jest.fn(), mockOnErrors);

      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });

    it('pasa errores a callback onErrors para getAllAvatars', () => {
      const mockError = { globalError: 'Server error' };
      const mockOnErrors = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
        onErrors(mockError);
      });

      imageService.getAllAvatars(0, 10, jest.fn(), mockOnErrors);

      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });
  });
});

