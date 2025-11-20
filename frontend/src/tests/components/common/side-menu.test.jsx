import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import SideMenu from '../../../modules/app/components/common/side-menu';
import { UserContext } from '../../../modules/app/components/common/user-provider';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../config/constants', () => ({
  svgIcons: {
    HomeIcon: () => <svg data-testid="home-icon" />,
    ProfileIcon: () => <svg data-testid="profile-icon" />,
    CreateRoutineIcon: () => <svg data-testid="routine-icon" />,
    CreateExerciseIcon: () => <svg data-testid="exercise-icon" />,
    TrainingIcon: () => <svg data-testid="training-icon" />,
  },
}));

describe('SideMenu', () => {
  const mockSetActivePage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderWithUser = (user, activePage = 'home') => {
    return render(
      <UserContext.Provider value={{ user }}>
        <MemoryRouter>
          <SideMenu activePage={activePage} setActivePage={mockSetActivePage} />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('renderiza elementos de menú básicos para usuario regular', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithUser(user);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Ver perfil')).toBeInTheDocument();
    expect(screen.getByText('Crear Entrenamiento')).toBeInTheDocument();
  });

  it('no muestra elementos admin/entrenador para usuario regular', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithUser(user);

    expect(screen.queryByText('Crear rutina')).not.toBeInTheDocument();
    expect(screen.queryByText('Crear Ejercicio')).not.toBeInTheDocument();
    expect(screen.queryByText('Validar Ejercicios')).not.toBeInTheDocument();
  });

  it('muestra elementos de menú específicos de entrenador', () => {
    const user = { id: 2, userName: 'trainer', role: 'TRAINER' };
    renderWithUser(user);

    expect(screen.getByText('Crear rutina')).toBeInTheDocument();
    expect(screen.getByText('Crear Ejercicio')).toBeInTheDocument();
    expect(screen.getByText('Seguidores')).toBeInTheDocument();
  });

  it('muestra elementos de menú específicos de admin', () => {
    const user = { id: 3, userName: 'admin', role: 'ADMIN' };
    renderWithUser(user);

    expect(screen.getByText('Crear rutina')).toBeInTheDocument();
    expect(screen.getByText('Crear Ejercicio')).toBeInTheDocument();
    expect(screen.getByText('Validar Ejercicios')).toBeInTheDocument();
    expect(screen.getByText('Ver Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Bloquear Ejercicios')).toBeInTheDocument();
  });

  it('navega cuando se hace clic en elemento del menú', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithUser(user);

    fireEvent.click(screen.getByText('Ver perfil'));

    expect(mockSetActivePage).toHaveBeenCalledWith('profile');
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('guarda página activa en localStorage', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithUser(user);

    fireEvent.click(screen.getByText('Inicio'));

    expect(localStorage.getItem('sideMenuActivePage')).toBe('home');
  });

  it('carga última página activa de localStorage al montar', () => {
    localStorage.setItem('sideMenuActivePage', 'profile');
    const user = { id: 1, userName: 'user', role: 'USER' };
    
    renderWithUser(user);

    expect(mockSetActivePage).toHaveBeenCalledWith('profile');
  });

  it('resalta elemento de menú activo', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithUser(user, 'home');

    const homeButton = screen.getByText('Inicio').closest('button');
    expect(homeButton.className).toContain('bg-[#241515]');
  });
});

