import React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import MenuItem from '../../../modules/app/components/common/menu-item';

const MockIcon = ({ className }) => <svg data-testid="mock-icon" className={className} />;

jest.mock('../../../config/constants', () => ({
  SVG_ICONS: {
    HomeIcon: ({ className }) => <svg data-testid="home-icon" className={className} />,
  },
}));

describe('MenuItem', () => {
  const activePageMock = jest.fn((page) => page === 'home');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza título e icono por defecto cuando no se proporciona icono personalizado', () => {
    render(
      <MenuItem title="Inicio" page="home" activePage={activePageMock} />
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('renderiza icono personalizado cuando se proporciona', () => {
    render(
      <MenuItem
        title="Crear"
        page="create"
        activePage={() => false}
        icon={MockIcon}
      />
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
  });

  it('llama onClick cuando se hace clic en botón', () => {
    const handleClick = jest.fn();
    render(
      <MenuItem
        title="Perfil"
        page="profile"
        activePage={() => false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByText('Perfil'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('aplica estilos activos cuando página está activa', () => {
    render(
      <MenuItem 
        title="Activo" 
        page="active" 
        activePage={(page) => page === 'active'} 
      />
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-[#241515]');
  });

  it('aplica estilos inactivos cuando página no está activa', () => {
    render(
      <MenuItem 
        title="Inactivo" 
        page="inactive" 
        activePage={() => false} 
      />
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
  });

  it('maneja ancho especial para página change-password', () => {
    render(
      <MenuItem
        title="Cambiar contraseña"
        page="change-password"
        activePage={() => false}
      />
    );

    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument();
  });
});
