import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoutButton from '../../../modules/app/components/profile/logout-button';

describe('LogoutButton', () => {
  it('renderiza botón de cerrar sesión por defecto como anchor', () => {
    const { container } = render(<LogoutButton />);
    
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    const anchor = container.querySelector('a[href="/home"]');
    expect(anchor).toBeInTheDocument();
  });

  it('renderiza botón con type cuando se proporciona type', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<LogoutButton type="submit" onClick={mockOnClick} />);
    
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeInTheDocument();
  });

  it('renderiza botón sin type cuando solo se proporciona onClick', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<LogoutButton onClick={mockOnClick} />);
    
    const button = container.querySelector('button[type="button"]');
    expect(button).toBeInTheDocument();
  });

  it('llama onClick cuando se hace clic en el botón', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<LogoutButton onClick={mockOnClick} />);
    
    const button = container.querySelector('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renderiza estado de carga cuando isLoading es true', () => {
    const { container } = render(<LogoutButton isLoading={true} />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument();
  });

  it('no renderiza estado de carga cuando isLoading es false', () => {
    const { container } = render(<LogoutButton isLoading={false} />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('aplica className personalizado', () => {
    const { container } = render(<LogoutButton className="custom-class" />);
    
    const logoutDiv = container.querySelector('.custom-class');
    expect(logoutDiv).toBeInTheDocument();
  });

  it('renderiza icono de cerrar sesión cuando no está cargando', () => {
    const { container } = render(<LogoutButton />);
    
    const icon = container.querySelector('.absolute.right-4');
    expect(icon).toBeInTheDocument();
  });

  it('no renderiza icono de cerrar sesión cuando está cargando', () => {
    const { container } = render(<LogoutButton isLoading={true} />);
    
    const icon = container.querySelector('.absolute.right-4');
    expect(icon).not.toBeInTheDocument();
  });
});

