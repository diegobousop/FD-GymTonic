import * as userService from '../../backend/userService';
import {
  appFetch,
  fetchConfig,
  setServiceToken,
  getServiceToken,
  removeServiceToken,
  setReauthenticationCallback,
} from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchConfig.mockImplementation((method, body) => ({ method, body }));
  });

  describe('login', () => {
    it('llama appFetch con credenciales', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const mockReauth = jest.fn();

      userService.login('testuser', 'password123', mockOnSuccess, mockOnErrors, mockReauth);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/login',
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function),
        mockOnErrors
      );
    });

    it('almacena token de servicio y llama callbacks en éxito', () => {
      const mockOnSuccess = jest.fn();
      const mockReauth = jest.fn();

      userService.login('testuser', 'password123', mockOnSuccess, jest.fn(), mockReauth);

      const successHandler = appFetch.mock.calls[0][2];
      const authenticatedUser = { serviceToken: 'token-123' };

      successHandler(authenticatedUser);

      expect(setServiceToken).toHaveBeenCalledWith('token-123');
      expect(setReauthenticationCallback).toHaveBeenCalledWith(mockReauth);
      expect(mockOnSuccess).toHaveBeenCalledWith(authenticatedUser);
    });
  });

  describe('signUp', () => {
    it('llama appFetch con datos de usuario', () => {
      const mockUser = {
        userName: 'newuser',
        email: 'test@test.com',
        password: 'pass123',
      };
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();
      const mockReauth = jest.fn();

      userService.signUp(mockUser, mockOnSuccess, mockOnErrors, mockReauth);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/signUp',
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function),
        mockOnErrors
      );
    });

    it('almacena token de servicio e invoca manejador de éxito después del registro', () => {
      const mockUser = { serviceToken: 'signup-token' };
      const mockOnSuccess = jest.fn();
      const mockReauth = jest.fn();

      userService.signUp({ userName: 'new' }, mockOnSuccess, jest.fn(), mockReauth);

      const successHandler = appFetch.mock.calls[0][2];
      successHandler(mockUser);

      expect(setServiceToken).toHaveBeenCalledWith('signup-token');
      expect(setReauthenticationCallback).toHaveBeenCalledWith(mockReauth);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getProfile', () => {
    it('llama appFetch con ID de usuario', () => {
      const mockUser = { id: 123 };
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getProfile(mockUser, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/123',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('updateProfile', () => {
    it('llama appFetch con datos de usuario actualizados', () => {
      const mockUser = { id: 456, userName: 'updated', email: 'new@test.com' };
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.updateProfile(mockUser, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/456',
        expect.objectContaining({ method: 'PUT' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('changePassword', () => {
    it('llama appFetch con datos de contraseña', () => {
      const mockUser = { id: 789 };
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.changePassword(
        mockUser,
        'oldPassword',
        'newPassword',
        mockOnSuccess,
        mockOnErrors
      );

      expect(appFetch).toHaveBeenCalledWith(
        '/users/789/changePassword',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        expect.any(Function)
      );
    });

    it('maneja respuesta de error con mensaje personalizado cuando json se resuelve', async () => {
      const mockUser = { id: 123 };
      const mockOnErrors = jest.fn();

      userService.changePassword(mockUser, 'old', 'new', jest.fn(), mockOnErrors);

      const errorHandler = appFetch.mock.calls[0][3];
      const errorResponse = { json: jest.fn().mockResolvedValue({ globalError: 'Invalid password' }) };

      await errorHandler(errorResponse);

      expect(mockOnErrors).toHaveBeenCalledWith('Invalid password');
    });

    it('recurre a mensaje genérico cuando falla el parseo de json de error', async () => {
      const mockUser = { id: 123 };
      const mockOnErrors = jest.fn();

      userService.changePassword(mockUser, 'old', 'new', jest.fn(), mockOnErrors);

      const errorHandler = appFetch.mock.calls[0][3];
      const errorResponse = { json: jest.fn().mockRejectedValue(new Error('bad json')) };

      await errorHandler(errorResponse);

      expect(mockOnErrors).toHaveBeenCalledWith('Error inesperado');
    });
  });

  describe('viewAllUsers', () => {
    it('llama appFetch con paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.viewAllUsers({ page: 0, size: 10 }, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/getUsers?page=0',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('banUser', () => {
    it('llama appFetch con ID de usuario', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.banUser(999, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/ban/999',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('blockUser', () => {
    it('llama appFetch con ID de usuario', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.blockUser(888, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/block/888',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getBlockedUsers', () => {
    it('llama appFetch para obtener usuarios bloqueados', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getBlockedUsers(mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/getBlocked',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        expect.any(Function)
      );
    });

    it('invoca onErrors con mensaje por defecto cuando falla la obtención de usuarios bloqueados', async () => {
      const mockOnErrors = jest.fn();

      userService.getBlockedUsers(jest.fn(), mockOnErrors);

      const errorHandler = appFetch.mock.calls[0][3];
      await errorHandler(new Error('network'));

      expect(mockOnErrors).toHaveBeenCalledWith('Error inesperado');
    });
  });

  describe('followUser', () => {
    it('llama appFetch con ID de usuario', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.followUser(111, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/follow/111',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('unfollowUser', () => {
    it('llama appFetch con ID de usuario', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.unfollowUser(222, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/unfollow/222',
        expect.objectContaining({ method: 'POST' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getFollowers', () => {
    it('llama appFetch con paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getFollowers({ page: 1, size: 20 }, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/followers?page=1&size=20',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getFollowing', () => {
    it('llama appFetch con paginación', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getFollowing({ page: 0, size: 15 }, mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/following?page=0&size=15',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getFollowersCount', () => {
    it('llama appFetch para obtener conteo de seguidores', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getFollowersCount(mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/followers/count',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getFollowingCount', () => {
    it('llama appFetch para obtener conteo de seguidos', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getFollowingCount(mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/following/count',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('getGenders', () => {
    it('llama appFetch para obtener géneros', () => {
      const mockOnSuccess = jest.fn();
      const mockOnErrors = jest.fn();

      userService.getGenders(mockOnSuccess, mockOnErrors);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/getGenders',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
      );
    });
  });

  describe('logout', () => {
    it('llama removeServiceToken', () => {
      userService.logout();
      
      expect(removeServiceToken).toHaveBeenCalled();
    });
  });

  describe('tryLoginFromServiceToken', () => {
    it('llama callback de reautenticación cuando no existe token', () => {
      getServiceToken.mockReturnValue(null);
      const mockReauth = jest.fn();

      userService.tryLoginFromServiceToken(jest.fn(), mockReauth);

      expect(mockReauth).toHaveBeenCalled();
    });

    it('llama appFetch cuando existe token', () => {
      getServiceToken.mockReturnValue('test-token');
      const mockOnSuccess = jest.fn();
      const mockReauth = jest.fn();

      userService.tryLoginFromServiceToken(mockOnSuccess, mockReauth);

      expect(appFetch).toHaveBeenCalledWith(
        '/users/loginFromServiceToken',
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('elimina token de servicio cuando falla login desde token', () => {
      getServiceToken.mockReturnValue('token');
      userService.tryLoginFromServiceToken(jest.fn(), jest.fn());

      const failureHandler = appFetch.mock.calls[0][3];
      failureHandler();

      expect(removeServiceToken).toHaveBeenCalled();
    });

    it('reenvía usuario autenticado al manejador de éxito', () => {
      getServiceToken.mockReturnValue('token');
      const mockOnSuccess = jest.fn();
      const mockReauth = jest.fn();

      userService.tryLoginFromServiceToken(mockOnSuccess, mockReauth);

      const successHandler = appFetch.mock.calls[0][2];
      const user = { id: 1 };
      successHandler(user);

      expect(mockOnSuccess).toHaveBeenCalledWith(user);
      expect(setReauthenticationCallback).toHaveBeenCalledWith(mockReauth);
    });
  });
});

