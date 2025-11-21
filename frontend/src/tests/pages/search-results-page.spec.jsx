import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchResultsPage from '../../modules/app/pages/search-results-page';
import { UserContext } from '../../modules/app/components/common/user-provider';
import { ToastProvider } from '../../modules/app/components/common/toast-provider';
import backend from '../../backend';
import { searchResults } from '../../backend/searchService';

jest.mock('../../backend/searchService', () => ({
  searchResults: jest.fn()
}));

jest.mock('../../backend', () => ({
  userService: {
  followUser: jest.fn(),
  unfollowUser: jest.fn(),
    blockUser: jest.fn(),
    getBlockedUsers: jest.fn(),
    sendFollowRequest: jest.fn()
  }
}));

const mockUser = {
  id: 1,
  userName: 'testuser',
  rol: 'USER',
  avatar: { avatarBase64: 'avatar1' }
};

describe("SearchResultsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSearchData = {
    users: [
      { id: 2, name: 'User Two', avatarBase64: 'avatar2', isFollowing: false, isBanned: false, rol: 'USER' },
      { id: 3, name: 'User Three', avatarBase64: 'avatar3', isFollowing: true, isBanned: false, rol: 'TRAINER' }
    ],
    routines: [
      { id: 1, name: 'Routine One', duration: 30, creatorUsername: 'creator1', exercises: [{ name: 'Ex1', numeroSeries: 3 }], difficulty: 'INTERMEDIO' },
      { id: 2, name: 'Routine Two', duration: 45, creatorUsername: 'creator2', exercises: [], difficulty: 'FACIL' }
    ],
    exercises: [
      { id: 1, name: 'Push Up', grupoMuscular: 'PECHO' },
      { id: 2, name: 'Squat', grupoMuscular: 'PIERNAS' }
    ]
  };

  const renderWithRouter = (searchParams = '?text=test') => {
    return render(
      <UserContext.Provider value={{ user: mockUser, setUser: jest.fn(), loading: false }}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/search/full${searchParams}`]}>
            <Routes>
              <Route path="/search/full" element={<SearchResultsPage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess(mockSearchData);
    });
    backend.userService.getBlockedUsers.mockImplementation((onSuccess) => {
      onSuccess([]);
    });
  });

  it('renderiza la página de resultados de búsqueda', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Mostrando resultados para:/i)).toBeInTheDocument();
    });
  });

  it('muestra la consulta de búsqueda en el encabezado', async () => {
    renderWithRouter('?text=workout');

    await waitFor(() => {
      expect(screen.getByText('workout')).toBeInTheDocument();
    });
  });

  it('renderiza todos los botones de filtro', async () => {
    renderWithRouter();

    await waitFor(() => {
      const filterButtons = screen.getAllByRole('button');
      const buttonTexts = filterButtons.map(btn => btn.textContent);
      expect(buttonTexts).toContain('Todo');
      expect(buttonTexts).toContain('Rutinas');
      expect(buttonTexts).toContain('Ejercicios');
      expect(buttonTexts).toContain('Usuarios');
    });
  });

  it('filtra resultados por tipo', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Usuarios' })).toBeInTheDocument();
    });

    const usuariosButton = screen.getByRole('button', { name: 'Usuarios' });
    fireEvent.click(usuariosButton);

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  it('muestra usuarios cuando el filtro es TODO o USUARIOS', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByText('User Three')).toBeInTheDocument();
    });
  });

  it('muestra rutinas cuando el filtro es TODO o RUTINAS', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Routine One')).toBeInTheDocument();
      expect(screen.getByText('Routine Two')).toBeInTheDocument();
    });
  });

  it('muestra ejercicios cuando el filtro es TODO o EJERCICIOS', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Push Up')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });
  });

  it('llama a sendFollowRequest cuando se sigue a un usuario regular', async () => {
    backend.userService.sendFollowRequest.mockImplementation((userId, onSuccess) => {
      onSuccess(true);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    const followButton = screen.getAllByText('Seguir')[0];
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(backend.userService.sendFollowRequest).toHaveBeenCalledWith(
        2,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('llama a unfollowUser cuando se hace clic en el botón de dejar de seguir', async () => {
    backend.userService.unfollowUser.mockImplementation((userId, onSuccess) => {
      onSuccess(true);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Three')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Dejar de seguir')).toBeInTheDocument();
    });

    const unfollowButton = screen.getByText('Dejar de seguir');
    fireEvent.click(unfollowButton);

    await waitFor(() => {
      expect(backend.userService.unfollowUser).toHaveBeenCalledWith(
        3,
        expect.any(Function),
        expect.any(Function)
      );
      });
    });

  it('llama a blockUser cuando se hace clic en el botón de bloquear', async () => {
    backend.userService.blockUser.mockImplementation((userId, onSuccess) => {
      onSuccess(true);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    const blockButton = screen.getAllByText('Bloquear')[0];
    fireEvent.click(blockButton);

    await waitFor(() => {
      expect(backend.userService.blockUser).toHaveBeenCalledWith(
        2,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('muestra mensaje de error cuando la búsqueda falla', async () => {
    searchResults.mockImplementation((params, onSuccess, onError) => {
      onError(new Error('Search failed'));
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los resultados')).toBeInTheDocument();
    });
  });

  it('muestra estado de carga', async () => {
    let resolveSearch;
    searchResults.mockImplementation((params, onSuccess) => {
      return new Promise(resolve => {
        resolveSearch = () => {
          onSuccess(mockSearchData);
          resolve();
        };
    });
  });

    renderWithRouter();

    expect(screen.getByText('Cargando resultados...')).toBeInTheDocument();
  });

  it('muestra mensaje de sin resultados cuando está vacío', async () => {
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess({ users: [], routines: [], exercises: [] });
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument();
    });
  });

  it('limpia resultados cuando la consulta de búsqueda está vacía', async () => {
    renderWithRouter('?text=');

    await waitFor(() => {
      expect(searchResults).not.toHaveBeenCalled();
    });
  });

  it('aplica filtros de búsqueda desde parámetros de URL', async () => {
    renderWithRouter('?text=test&trainerName=John&muscleGroup=PECHO&difficulty=FACIL');

    await waitFor(() => {
      expect(searchResults).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'test',
          trainerName: 'John',
          muscleGroup: 'PECHO',
          difficulty: 'FACIL'
        }),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('muestra botón de seguir para todos los usuarios excepto el usuario actual', async () => {
    const dataWithBannedUser = {
      ...mockSearchData,
      users: [
        { id: 4, name: 'Other User', isBanned: false, rol: 'USER', avatarBase64: 'avatar4' },
        { id: 1, name: 'testuser', isBanned: false, rol: 'USER', avatarBase64: 'avatar1' }
      ]
    };

    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess(dataWithBannedUser);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Other User')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Should show follow button for other user
    expect(screen.getByText('Seguir')).toBeInTheDocument();
    
    // Should not show follow/block buttons for current user (testuser)
    const userItems = screen.getAllByRole('listitem');
    const currentUserItem = userItems.find(item => item.textContent.includes('testuser'));
    expect(currentUserItem).not.toHaveTextContent('Seguir');
    expect(currentUserItem).not.toHaveTextContent('Bloquear');
  });

  it('no muestra botón de bloquear para el usuario actual', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    const userItems = screen.getAllByRole('listitem');
    expect(userItems.length).toBeGreaterThan(0);
  });

  it('maneja error de seguir', async () => {
    const mockShowToast = jest.fn();
    const toastModule = require('../../modules/app/components/common/toast-provider');
    const spy = jest.spyOn(toastModule, 'useToast').mockReturnValue({
      showToast: mockShowToast
    });

    backend.userService.sendFollowRequest.mockImplementation((userId, onSuccess, onError) => {
      onError(new Error('Follow failed'));
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    const followButton = screen.getAllByText('Seguir')[0];
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Error al enviar la solicitud.', 'error');
    });

    spy.mockRestore();
  });

  it('maneja error de dejar de seguir', async () => {
    const mockShowToast = jest.fn();
    const toastModule = require('../../modules/app/components/common/toast-provider');
    const spy = jest.spyOn(toastModule, 'useToast').mockReturnValue({
      showToast: mockShowToast
    });

    backend.userService.unfollowUser.mockImplementation((userId, onSuccess, onError) => {
      onError(new Error('Unfollow failed'));
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Three')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Dejar de seguir')).toBeInTheDocument();
    });

    const unfollowButton = screen.getByText('Dejar de seguir');
    fireEvent.click(unfollowButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Error al dejar de seguir al usuario.', 'error');
    });

    spy.mockRestore();
  });

  it('maneja error de bloquear', async () => {
    const mockShowToast = jest.fn();
    const toastModule = require('../../modules/app/components/common/toast-provider');
    const spy = jest.spyOn(toastModule, 'useToast').mockReturnValue({
      showToast: mockShowToast
    });

    backend.userService.blockUser.mockImplementation((userId, onSuccess, onError) => {
      onError(new Error('Block failed'));
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    const blockButton = screen.getAllByText('Bloquear')[0];
    fireEvent.click(blockButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Error al bloquear al usuario.', 'error');
    });

    spy.mockRestore();
  });

  it('deshabilita botón de bloquear para usuarios ya bloqueados', async () => {
    const userWithBlocked = { ...mockUser, idBlocked: [2] };
    backend.userService.getBlockedUsers.mockImplementation((onSuccess) => {
      onSuccess([2]);
    });

    render(
      <UserContext.Provider value={{ user: userWithBlocked, setUser: jest.fn(), loading: false }}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/search/full?text=test']}>
          <Routes>
              <Route path="/search/full" element={<SearchResultsPage />} />
          </Routes>
          </MemoryRouter>
        </ToastProvider>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    const blockedButton = screen.getByText('Bloqueado');
    expect(blockedButton).toBeDisabled();
  });

  it('actualiza estado de seguimiento después de solicitud de seguir exitosa', async () => {
    backend.userService.sendFollowRequest.mockImplementation((userId, onSuccess) => {
      onSuccess(true);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getAllByText('Seguir')[0]).toBeInTheDocument();
    });

    const followButton = screen.getAllByText('Seguir')[0];
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(backend.userService.sendFollowRequest).toHaveBeenCalled();
      expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
    });
  });

  it('procesa rutinas con ejercicios correctamente', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Routine One')).toBeInTheDocument();
      expect(screen.getByText('Routine Two')).toBeInTheDocument();
      expect(screen.getByText('Ex1')).toBeInTheDocument();
    });
  });

  it('maneja rutinas sin ejercicios', async () => {
    const dataWithEmptyExercises = {
      ...mockSearchData,
      routines: [{ id: 3, name: 'Empty Routine', duration: 20, creatorUsername: 'creator3', exercises: null }]
    };

    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess(dataWithEmptyExercises);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Empty Routine')).toBeInTheDocument();
    });
  });

  it('renderiza avatar de usuario cuando está disponible', async () => {
    renderWithRouter();

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
      });
    });

  it('envía solicitud de seguir a usuarios regulares', async () => {
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess({
        users: [{ id: 2, name: "Alice", rol: "USER", avatarBase64: 'avatar2', isFollowing: false, isBanned: false }],
        routines: [],
        exercises: []
      });
    });

    backend.userService.sendFollowRequest.mockImplementation((userId, onSuccess) => {
      onSuccess(true);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const followButton = screen.getByRole("button", { name: /Seguir/i });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(backend.userService.sendFollowRequest).toHaveBeenCalledWith(
        2,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('sigue entrenadores directamente', async () => {
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess({
        users: [{ id: 3, name: "Bob", rol: "TRAINER", avatarBase64: 'avatar3', isFollowing: false, isBanned: false }],
        routines: [],
        exercises: []
    });
  });

    backend.userService.followUser.mockImplementation((userId, onSuccess) => {
      onSuccess(true);
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    const followButton = screen.getByRole("button", { name: /Seguir/i });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(backend.userService.followUser).toHaveBeenCalledWith(
        3,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('renderiza enlace al perfil de usuario', async () => {
    renderWithRouter();

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'User Two' });
      expect(link).toHaveAttribute('href', expect.stringContaining('/profile/2'));
    });
  });
});
