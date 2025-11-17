import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../modules/app/pages/home-page';
import { UserContext } from '../../modules/app/components/common/user-provider';

jest.mock('../../modules/app/pages/view-all-routines-page', () => {
  return function MockViewAllRoutines() {
    return <div data-testid="view-all-routines">View All Routines</div>;
  };
});

describe('HomePage', () => {
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

  const renderHomePage = () => {
    return render(
      <UserContext.Provider value={mockContextValue}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('renderiza sin fallar', () => {
    renderHomePage();
    expect(screen.getByTestId('view-all-routines')).toBeInTheDocument();
  });

  it('renderiza componente ViewAllRoutines', () => {
    renderHomePage();
    expect(screen.getByText('View All Routines')).toBeInTheDocument();
  });

  it('envuelve ViewAllRoutines en un div', () => {
    const { container } = renderHomePage();
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });
});

