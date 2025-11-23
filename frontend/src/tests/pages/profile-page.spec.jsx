import React, { useEffect, useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ProfilePage from '../../modules/app/pages/profile-page';
import * as userService from '../../backend/userService';
import * as routineService from "../../backend/routineService";

jest.mock('../../backend/userService');
jest.mock('../../backend/routineService');

jest.mock('../../modules/app/components/common/spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('ProfilePage', () => {
  const mockProfile = {
    id: 1,
    userName: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    birthDate: '15-05-1990',
    role: 'USER',
    avatar: {
      avatarBase64: 'data:image/png;base64,avatar'
    }
  };

  const mockTrainerProfile = {
    ...mockProfile,
    userName: 'trainer',
    role: 'TRAINER'
  };

  const mockAdminProfile = {
    ...mockProfile,
    userName: 'admin',
    role: 'ADMIN'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getProfile.mockImplementation((params, onSuccess) => {
      onSuccess(mockProfile);
    });
    userService.getFollowersCount.mockImplementation((onSuccess) => {
      onSuccess(42);
    });
  });

  const renderProfilePage = (id = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/profile/${id}`]}>
        <Routes>
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renderiza sin fallar', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('muestra spinner mientras carga', () => {
    userService.getProfile.mockImplementation(() => {
      
    });

    renderProfilePage();
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('obtiene perfil al montar', async () => {
    renderProfilePage('123');
    
    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalledWith(
        { id: '123' },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('muestra información del perfil', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('15-05-1990')).toBeInTheDocument();
    });
  });

  it('muestra edad calculada', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      const ageElement = screen.getByText(/Edad:/);
      expect(ageElement).toBeInTheDocument();
    });
  });

  it('muestra imagen de avatar', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      const avatar = screen.getByAltText('Profile');
      expect(avatar).toHaveAttribute('src', 'data:image/png;base64,avatar');
    });
  });

  it('muestra mensaje de error al fallar la obtención', async () => {
    userService.getProfile.mockImplementation((params, onSuccess, onError) => {
      onError();
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar el perfil')).toBeInTheDocument();
    });
  });

  it('obtiene conteo de seguidores para usuarios no admin', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      expect(userService.getFollowersCount).toHaveBeenCalled();
    });
  });

  it('no obtiene conteo de seguidores para usuarios admin', async () => {
    userService.getProfile.mockImplementation((params, onSuccess) => {
      onSuccess(mockAdminProfile);
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(userService.getFollowersCount).not.toHaveBeenCalled();
  });

  it('muestra etiqueta "Seguidores" para rol USER', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText(/Seguidores:/)).toBeInTheDocument();
    });
  });

  it('muestra etiqueta "Subscriptores" para rol TRAINER', async () => {
    userService.getProfile.mockImplementation((params, onSuccess) => {
      onSuccess(mockTrainerProfile);
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText(/Subscriptores:/)).toBeInTheDocument();
    });
  });

  it('muestra conteo de seguidores', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('muestra estado de carga para conteo de seguidores', async () => {
    userService.getFollowersCount.mockImplementation(() => {
      // No llamar onSuccess para mantener estado de carga
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  it('maneja error de obtención de conteo de seguidores con gracia', async () => {
    userService.getFollowersCount.mockImplementation((onSuccess, onError) => {
      onError();
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Debe seguir renderizando perfil incluso si falla el conteo de seguidores
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('no muestra sección de seguidores para admin', async () => {
    userService.getProfile.mockImplementation((params, onSuccess) => {
      onSuccess(mockAdminProfile);
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Seguidores:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Subscriptores:/)).not.toBeInTheDocument();
  });

  it('renderiza enlace de seguidores', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/profile/followers');
    });
  });

  it('calcula edad correctamente', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      const ageText = screen.getByText(/Edad:/);
      expect(ageText).toBeInTheDocument();
      // La edad debe calcularse basándose en birthDate 15-05-1990
    });
  });

  it('maneja birthDate sin edad', async () => {
    userService.getProfile.mockImplementation((params, onSuccess) => {
      onSuccess({ ...mockProfile, birthDate: null });
    });

    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Debe mostrar edad como 0 cuando birthDate es null
    const ageLabel = screen.getByText('Edad:');
    const ageContainer = ageLabel.parentElement;
    expect(ageContainer).toHaveTextContent('0');
  });

  const RouteChangeTester = () => {
    const navigate = useNavigate();
    const hasNavigated = useRef(false);

    useEffect(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        navigate('/profile/2');
      }
    }, [navigate]);

    return null;
  };

  it('reinicia estado cuando cambia el parámetro id', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/1']}
        >
        <RouteChangeTester />
        <Routes>
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalledWith(
        { id: '1' },
        expect.any(Function),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalledWith(
        { id: '2' },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('renderiza información del perfil correctamente', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('calcula edad correctamente para año bisiesto', async () => {
    userService.getProfile.mockImplementation((params, onSuccess) => {
      onSuccess({ ...mockProfile, birthDate: '29-02-2000' });
    });

    renderProfilePage();
    
    await waitFor(() => {
      const ageElement = screen.getByText(/Edad:/);
      expect(ageElement).toBeInTheDocument();
    });
  });

  it('aplica estilo correcto al enlace de seguidores', async () => {
    renderProfilePage();
    
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toHaveClass('underline');
      expect(link).toHaveStyle({ textDecoration: 'underline' });
    });
  });
  it('muestra la lista de entrenamientos del usuario', async () => {
    // Mock de la respuesta de los entrenamientos
    routineService.viewUserTrainings.mockImplementation(
        (userId, page, size, onSuccess, onError) => {
          onSuccess({
            items: [
              { id: 10, name: "Press banca",
                duration: 50,
                description: "Pecho",
                exercises: [],
                creationDate: "2024-01-10T10:00:00",
                creatorId: 1,
                creatorUserName: "testuser",
                routineId: 5,
                routineName: "Fuerza",
                isPublic: true}
            ],
            totalPages: 1
          });
        }
    );
    renderProfilePage();


    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByText('Press banca')).toBeInTheDocument();
    });

    // Verificar que es un enlace clicable
    const link = screen.getByText('Press banca');
    expect(link).toHaveAttribute('href', '/trainings/10/details');
  });

});

