import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../modules/app/components/common/user-provider';

// Mock all page and component imports used by Body
jest.mock('../../modules/app/components/Home', () => () => <div>Home</div>);
jest.mock('../../modules/app/components/Test', () => () => <div>Test</div>);
jest.mock('../../modules/app/components/common/navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../modules/app/components/common/side-menu', () => () => <div data-testid="side-menu">SideMenu</div>);
jest.mock('../../modules/app/pages/intro-page', () => () => <div data-testid="intro-page">Intro Page</div>);
jest.mock('../../modules/app/pages/login-page', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../../modules/app/pages/register-page', () => () => <div data-testid="register-page">Register Page</div>);
jest.mock('../../modules/app/pages/home-page', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../../modules/app/pages/my-profile-page', () => () => <div>My Profile Page</div>);
jest.mock('../../modules/app/pages/profile-page', () => () => <div>Profile Page</div>);
jest.mock('../../modules/app/pages/create-routine-page', () => () => <div>Create Routine</div>);
jest.mock('../../modules/app/pages/user-edit', () => () => <div>User Edit</div>);
jest.mock('../../modules/app/pages/changePassword-page', () => () => <div>Change Password</div>);
jest.mock('../../modules/app/pages/routine-details-page', () => () => <div>Routine Details</div>);
jest.mock('../../modules/app/pages/create-exercise-page', () => () => <div>Create Exercise</div>);
jest.mock('../../modules/app/pages/my-routines-page', () => () => <div>My Routines</div>);
jest.mock('../../modules/app/pages/validate-exercises-page', () => () => <div>Validate Exercises</div>);
jest.mock('../../modules/app/pages/viewAllUsers-page', () => () => <div>View All Users</div>);
jest.mock('../../modules/app/pages/search-results-page', () => () => <div>Search Results</div>);
jest.mock('../../modules/app/pages/block-exercises-page', () => () => <div>Block Exercises</div>);
jest.mock('../../modules/app/pages/create-training-page', () => () => <div>Create Training</div>);
jest.mock('../../modules/app/pages/user-followers-page', () => () => <div>User Followers</div>);
jest.mock('../../modules/app/pages/user-following-page', () => () => <div>User Following</div>);
jest.mock('../../modules/app/pages/my-routine-followers-page', () => () => <div>My Routine Followers</div>);
jest.mock('../../modules/app/components/common/protected-path', () => {
  const PropTypes = require('prop-types');
  function MockProtectedPath({ path }) {
    return <div data-testid="protected-path">{path}</div>;
  }
  MockProtectedPath.propTypes = {
    path: PropTypes.string.isRequired,
  };
  return MockProtectedPath;
});

import Body from '../../modules/app/components/Body';

describe('Body', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser',
    role: 'USER'
  };

  const mockContextValue = {
    user: mockUser,
    setUser: jest.fn(),
    loading: false,
    handleLogout: jest.fn(),
    refreshUser: jest.fn(),
    pendingInvites: 0,
    setPendingInvites: jest.fn()
  };

  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <UserContext.Provider value={mockContextValue}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Body />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('renderiza página intro en ruta raíz', async () => {
    renderWithRouter('/');
    
    await waitFor(() => {
      expect(screen.getByTestId('intro-page')).toBeInTheDocument();
    });
  });

  it('no muestra navbar y sidemenu en página intro', () => {
    renderWithRouter('/');
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
  });

  it('renderiza página de login en /login', async () => {
    renderWithRouter('/login');
    
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('no muestra navbar y sidemenu en página de login', () => {
    renderWithRouter('/login');
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
  });

  it('renderiza página de registro en /register', async () => {
    renderWithRouter('/register');
    
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });
  });

  it('no muestra navbar y sidemenu en página de registro', () => {
    renderWithRouter('/register');
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
  });

  it('muestra navbar y sidemenu en página home', async () => {
    renderWithRouter('/home');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
    });
  });

  it('renderiza página home protegida', async () => {
    renderWithRouter('/home');
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-path')).toBeInTheDocument();
    });
  });

  it('aplica padding correcto cuando se muestran navbar y sidemenu', () => {
    const { container } = renderWithRouter('/home');
    
    const mainDiv = container.querySelector(String.raw`.pt-\[77px\].pl-\[270px\]`);
    expect(mainDiv).toBeInTheDocument();
  });

  it('no aplica padding en página intro', () => {
    const { container } = renderWithRouter('/');
    
    const mainDiv = container.querySelector(String.raw`.pt-\[77px\].pl-\[270px\]`);
    expect(mainDiv).not.toBeInTheDocument();
  });

  it('renderiza página intro en /start', async () => {
    renderWithRouter('/start');
    
    await waitFor(() => {
      expect(screen.getByTestId('intro-page')).toBeInTheDocument();
    });
  });

  it('renderiza página intro en /intro', async () => {
    renderWithRouter('/intro');
    
    await waitFor(() => {
      expect(screen.getByTestId('intro-page')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('maneja ruta de perfil', async () => {
    renderWithRouter('/profile');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
    });
  });

  it('maneja ruta de test', async () => {
    renderWithRouter('/test');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta de crear rutina', async () => {
    renderWithRouter('/routines/create-routine');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja rutas de admin', async () => {
    renderWithRouter('/admin/addExercise');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta validateExercises', async () => {
    renderWithRouter('/admin/validateExercises');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta viewAllUsers', async () => {
    renderWithRouter('/admin/seeUsers');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta blockExercises', async () => {
    renderWithRouter('/admin/blockExercises');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta de crear entrenamiento', async () => {
    renderWithRouter('/trainings/create-training');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta my-routines', async () => {
    renderWithRouter('/my-routines');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta de búsqueda', async () => {
    renderWithRouter('/search/full');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta my-followers', async () => {
    renderWithRouter('/routines/my-followers');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta de seguidores', async () => {
    renderWithRouter('/profile/followers');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta de seguidos', async () => {
    renderWithRouter('/profile/following');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta profileUpdate', async () => {
    renderWithRouter('/profileUpdate');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('maneja ruta change-password', async () => {
    renderWithRouter('/change-password');
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });
});

