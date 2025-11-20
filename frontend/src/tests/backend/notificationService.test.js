import * as notificationService from '../../backend/notificationService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockImplementation((method, body) => ({ method, body }));
  });

  describe('getNotifications', () => {
    it('llama appFetch con parámetros de paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      notificationService.getNotifications(
        { page: 0, size: 10 },
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/notifications/getNotifications?page=0&size=10',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('maneja diferentes valores de paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      notificationService.getNotifications(
        { page: 2, size: 20 },
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/notifications/getNotifications?page=2&size=20',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('readNotification', () => {
    it('llama appFetch para marcar notificación como leída', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      notificationService.readNotification(123, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/notifications/read/123',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('maneja diferentes IDs de notificación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      notificationService.readNotification(999, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/notifications/read/999',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('unreadNotification', () => {
    it('llama appFetch para marcar notificación como no leída', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      notificationService.unreadNotification(456, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/notifications/unread/456',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });

    it('maneja diferentes IDs de notificación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      notificationService.unreadNotification(777, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/notifications/unread/777',
        expect.anything(),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('Manejo de Errores', () => {
    it('pasa errores a callback onErrors', () => {
      const mockError = { globalError: 'Server error' };
      const mockOnErrors = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess, onErrors) => {
        onErrors(mockError);
      });

      notificationService.getNotifications(
        { page: 0, size: 10 },
        jest.fn(),
        mockOnErrors
      );

      expect(mockOnErrors).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Callbacks de Éxito', () => {
    it('llama onSuccess con datos de notificaciones', () => {
      const mockData = {
        items: [
          { id: 1, message: 'Test notification', read: false },
        ],
      };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockData);
      });

      notificationService.getNotifications(
        { page: 0, size: 10 },
        mockOnSuccess,
        jest.fn()
      );

      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
    });

    it('llama onSuccess después de marcar notificación como leída', () => {
      const mockResponse = { success: true };
      const mockOnSuccess = jest.fn();

      appFetch.mockImplementation((path, config, onSuccess) => {
        onSuccess(mockResponse);
      });

      notificationService.readNotification(123, mockOnSuccess, jest.fn());

      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });
});

