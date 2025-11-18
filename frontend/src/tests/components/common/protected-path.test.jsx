import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import ProtectedPath from '../../../modules/app/components/common/protected-path';
import { UserContext } from '../../../modules/app/components/common/user-provider';

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedPath', () => {
  const renderWithRouter = (user, loading = false, role = null) => {
    return render(
      <UserContext.Provider value={{ user, loading }}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route 
              path="/protected" 
              element={
                <ProtectedPath path={<TestComponent />} role={role} />
              } 
            />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('muestra estado de carga cuando loading es true', () => {
    const { container } = renderWithRouter(null, true);
    
    // Loading state shows container with flex items-center justify-center
    const loadingContainer = container.querySelector('.flex.items-center.justify-center');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('redirige a home cuando no hay usuario y no está cargando', () => {
    renderWithRouter(null, false);
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renderiza contenido protegido cuando existe usuario y no se requiere rol', () => {
    const user = { id: 1, userName: 'test', role: 'USER' };
    renderWithRouter(user, false);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renderiza contenido cuando usuario tiene rol requerido', () => {
    const user = { id: 1, userName: 'admin', role: 'ADMIN' };
    renderWithRouter(user, false, 'ADMIN');
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('muestra acceso denegado cuando usuario no tiene rol requerido', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithRouter(user, false, 'ADMIN');
    
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
    expect(screen.getByText(/No tienes permisos/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('acepta array de roles y otorga acceso si usuario tiene uno', () => {
    const user = { id: 1, userName: 'trainer', role: 'TRAINER' };
    renderWithRouter(user, false, ['ADMIN', 'TRAINER']);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('niega acceso si rol de usuario no está en array', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    renderWithRouter(user, false, ['ADMIN', 'TRAINER']);
    
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
  });

  it('muestra mensaje de rol personalizado cuando se proporciona', () => {
    const user = { id: 1, userName: 'user', role: 'USER' };
    const customMessage = 'Solo administradores pueden acceder';
    
    render(
      <UserContext.Provider value={{ user, loading: false }}>
        <MemoryRouter>
          <ProtectedPath 
            path={<TestComponent />} 
            role="ADMIN" 
            roleMessage={customMessage}
          />
        </MemoryRouter>
      </UserContext.Provider>
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});

