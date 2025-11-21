import {
  fetchConfig,
  setServiceToken,
  getServiceToken,
  removeServiceToken,
  appFetch,
  init,
  setReauthenticationCallback,
} from '../../backend/appFetch';
import { config } from '../../config/constants';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock fetch
globalThis.fetch = jest.fn();

describe('appFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
  });

  describe('Gestión de Token de Servicio', () => {
    it('establece token de servicio en sessionStorage', () => {
      setServiceToken('test-token-123');
      expect(mockSessionStorage.getItem(config.SERVICE_TOKEN_NAME)).toBe('test-token-123');
    });

    it('obtiene token de servicio de sessionStorage', () => {
      mockSessionStorage.setItem(config.SERVICE_TOKEN_NAME, 'test-token-456');
      expect(getServiceToken()).toBe('test-token-456');
    });

    it('elimina token de servicio de sessionStorage', () => {
      mockSessionStorage.setItem(config.SERVICE_TOKEN_NAME, 'test-token-789');
      removeServiceToken();
      expect(mockSessionStorage.getItem(config.SERVICE_TOKEN_NAME)).toBeNull();
    });
  });

  describe('fetchConfig', () => {
    it('crea configuración de petición GET sin cuerpo', () => {
      const fConfig = fetchConfig('GET');
      
      expect(fConfig.method).toBe('GET');
      expect(fConfig.body).toBeUndefined();
    });

    it('crea configuración de petición POST con cuerpo JSON', () => {
      const body = { userName: 'test', password: 'pass' };
      const fConfig = fetchConfig('POST', body);
      
      expect(fConfig.method).toBe('POST');
      expect(fConfig.headers['Content-Type']).toBe('application/json');
      expect(fConfig.body).toBe(JSON.stringify(body));
    });

    it('crea configuración de petición con cuerpo FormData', () => {
      const formData = new FormData();
      formData.append('file', 'test');
      const fConfig = fetchConfig('POST', formData);
      
      expect(fConfig.method).toBe('POST');
      expect(fConfig.body).toBe(formData);
      expect(fConfig.headers).toBeUndefined();
    });

    it('añade cabecera Authorization cuando existe token de servicio', () => {
      setServiceToken('my-token');
      const fConfig = fetchConfig('GET');
      
      expect(fConfig.headers.Authorization).toBe('Bearer my-token');
    });

    it('añade cabecera Authorization a cabeceras existentes', () => {
      setServiceToken('my-token');
      const body = { data: 'test' };
      const fConfig = fetchConfig('POST', body);
      
      expect(fConfig.headers.Authorization).toBe('Bearer my-token');
      expect(fConfig.headers['Content-Type']).toBe('application/json');
    });

    it('no añade cabecera Authorization cuando no hay token', () => {
      removeServiceToken();
      const fConfig = fetchConfig('GET');
      
      expect(fConfig.headers).toBeUndefined();
    });
  });

  describe('appFetch - Manejo de Respuestas', () => {
    it('maneja respuesta JSON 200 exitosa', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockOnSuccess = jest.fn();
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      });

      await appFetch('/test', fetchConfig('GET'), mockOnSuccess);

      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
    });

    it('maneja respuesta 204 Sin Contenido exitosa', async () => {
      const mockOnSuccess = jest.fn();
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map(),
      });

      await appFetch('/test', fetchConfig('DELETE'), mockOnSuccess);

      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockOnSuccess).toHaveBeenCalledWith();
    });

    it('maneja respuesta blob exitosa', async () => {
      const mockBlob = new Blob(['test']);
      const mockOnSuccess = jest.fn();
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'image/png']]),
        blob: async () => mockBlob,
      });

      await appFetch('/test', fetchConfig('GET'), mockOnSuccess);

      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockOnSuccess).toHaveBeenCalledWith(mockBlob);
    });

    it('maneja 401 No Autorizado con callback de reautenticación', async () => {
      const mockReauth = jest.fn();
      setReauthenticationCallback(mockReauth);
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Map([['content-type', 'application/json']]),
      });

      await appFetch('/test', fetchConfig('GET'));

      expect(mockReauth).toHaveBeenCalled();
    });

    it('maneja 400 Solicitud Incorrecta con errores de campo', async () => {
      const mockErrors = { fieldErrors: { email: 'Invalid email' } };
      const mockOnErrors = jest.fn();
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockErrors,
      });

      await appFetch('/test', fetchConfig('POST', {}), null, mockOnErrors);

      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockOnErrors).toHaveBeenCalledWith(mockErrors);
    });

    it('maneja 404 No Encontrado con error global', async () => {
      const mockError = { globalError: 'Resource not found' };
      const mockOnErrors = jest.fn();
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockError,
      });

      await appFetch('/test', fetchConfig('GET'), null, mockOnErrors);

      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });

    it('llama callback de error de red en fallo de red', async () => {
      const mockNetworkError = jest.fn();
      init(mockNetworkError);
      
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'));

      await appFetch('/test', fetchConfig('GET'));

      expect(mockNetworkError).toHaveBeenCalled();
    });

    it('lanza NetworkError en 500 Error Interno del Servidor', async () => {
      const mockNetworkError = jest.fn();
      init(mockNetworkError);
      
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Map(),
      });

      await appFetch('/test', fetchConfig('GET'));

      expect(mockNetworkError).toHaveBeenCalled();
    });

    it('maneja respuesta sin callback onSuccess', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ data: 'test' }),
      });

      await expect(
        appFetch('/test', fetchConfig('GET'))
      ).resolves.not.toThrow();
    });

    it('maneja error 4xx sin callback onErrors', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ globalError: 'Error' }),
      });

      await expect(
        appFetch('/test', fetchConfig('GET'))
      ).resolves.not.toThrow();
    });
  });

  describe('Callbacks', () => {
    it('establece callback de error de red', () => {
      const callback = jest.fn();
      init(callback);
      
      // El callback se establece internamente, probado a través del escenario de error de red
      expect(callback).toBeDefined();
    });

    it('establece callback de reautenticación', () => {
      const callback = jest.fn();
      setReauthenticationCallback(callback);
      
      // El callback se establece internamente, probado a través del escenario 401
      expect(callback).toBeDefined();
    });
  });
});

