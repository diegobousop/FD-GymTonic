import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Test from '../../modules/app/components/Test';

describe('Test', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Test />
      </MemoryRouter>
    );
  };

  it('renderiza sin fallar', () => {
    renderWithRouter();
    expect(screen.getByText(/This is the page Test/i)).toBeInTheDocument();
  });

  it('renderiza imagen de logo', () => {
    const { container } = renderWithRouter();
    const logo = container.querySelector('img.App-logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'logo');
  });

  it('renderiza título', () => {
    renderWithRouter();
    expect(screen.getByText('This is the page Test')).toBeInTheDocument();
  });

  it('renderiza texto introductorio', () => {
    renderWithRouter();
    expect(screen.getByText('Testing Route redirection...')).toBeInTheDocument();
  });

  it('renderiza enlace a home', () => {
    renderWithRouter();
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logo tiene src correcto desde PUBLIC_URL', () => {
    const { container } = renderWithRouter();
    const logo = container.querySelector('img.App-logo');
    expect(logo.src).toContain('/assets/logo.svg');
  });
});

