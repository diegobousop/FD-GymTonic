import React from "react";
import { render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import LoginNavBar from '../../../modules/app/components/common/login-navbar';

jest.mock('../../../config/constants', () => ({
  GENERAL_ICONS: {
    APP_LOGO: 'logo.png',
  },
}));

describe('LoginNavBar', () => {
  it('renderiza logo y enlace de acceso', () => {
    render(
      <Router>
        <LoginNavBar />
      </Router>
    );

    expect(screen.getByAltText('logo')).toHaveAttribute('src', 'logo.png');
    expect(screen.getByText('ACCESO')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /acceso/i })).toHaveAttribute('href', '#/login');
  });

  it('renderiza con clases de estilo correctas', () => {
    render(
      <Router>
        <LoginNavBar />
      </Router>
    );

    const logo = screen.getByAltText('logo');
    expect(logo).toHaveClass('h-12', 'ml-20');
  });
});
