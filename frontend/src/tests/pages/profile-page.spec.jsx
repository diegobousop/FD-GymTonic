import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserContext } from '../../modules/app/components/common/user-provider';
import { ToastProvider } from '../../modules/app/components/common/toast-provider';
import ProfilePage from '../../modules/app/pages/profile-page';
import * as userService from '../../backend/userService';

// Mocks of child components
jest.mock('../../modules/app/components/profile/BadgesList', () => () => <div data-testid="badges-list">BadgesList</div>);
jest.mock('../../modules/app/components/training/training-history', () => () => <div data-testid="training-history">TrainingHistory</div>);
jest.mock('../../modules/app/components/profile/user-stats-panel', () => () => <div data-testid="user-stats-panel">UserStatsPanel</div>);
jest.mock('../../modules/app/components/profile/calendar-card', () => () => <div data-testid="calendar-card">CalendarCard</div>);
jest.mock('../../modules/app/components/common/spinner', () => () => <div data-testid="spinner">Loading...</div>);

// Mock userService directly
jest.mock('../../backend/userService', () => ({
    getProfile: jest.fn(),
    getFollowersCount: jest.fn(),
    getRequestSended: jest.fn(),
    getStats: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    sendFollowRequest: jest.fn(),
    blockUser: jest.fn(),
}));

// Mock backend to use the same mocks
jest.mock('../../backend', () => ({
    userService: require('../../backend/userService')
}));

describe('ProfilePage', () => {
    const mockUser = {
        id: 1,
        userName: 'currentUser',
        role: 'USER',
        followingList: [],
        idBlocked: []
    };

    const mockProfileUser = {
        id: 2,
        userName: 'otherUser',
        firstName: 'Other',
        lastName: 'User',
        email: 'other@example.com',
        birthDate: '01-01-1990',
        role: 'USER',
        avatar: { avatarBase64: 'data:image/png;base64,fake' }
    };

    const mockRefreshUser = jest.fn();

    const renderComponent = (profileId = '2', currentUser = mockUser) => {
        return render(
            <UserContext.Provider value={{ user: currentUser, refreshUser: mockRefreshUser }}>
                <ToastProvider>
                    <MemoryRouter initialEntries={[`/profile/${profileId}`]}>
                        <Routes>
                            <Route path="/profile/:id" element={<ProfilePage />} />
                        </Routes>
                    </MemoryRouter>
                </ToastProvider>
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Default successful responses
        userService.getProfile.mockImplementation((params, onSuccess) => onSuccess(mockProfileUser));
        userService.getFollowersCount.mockImplementation((onSuccess) => onSuccess(10));
        userService.getRequestSended.mockImplementation((onSuccess) => onSuccess([]));
        userService.getStats.mockImplementation((params, onSuccess) => onSuccess({}));
    });

    test('renders loading spinner initially', () => {
        // Delay response to check spinner
        userService.getProfile.mockImplementation(() => {}); 
        renderComponent();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('renders profile info correctly', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('otherUser')).toBeInTheDocument();
            expect(screen.getByText('Other')).toBeInTheDocument();
            expect(screen.getByText('User')).toBeInTheDocument();
            // Age calculation check (1990 -> ~35 in 2025)
            expect(screen.getByText(/Edad:/)).toBeInTheDocument();
        });
    });

    test('renders followers count for USER role', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Seguidores:')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });
    });

    test('renders subscribers count for TRAINER role', async () => {
        const trainerProfile = { ...mockProfileUser, role: 'TRAINER' };
        userService.getProfile.mockImplementation((params, onSuccess) => onSuccess(trainerProfile));
        
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Subscriptores:')).toBeInTheDocument();
        });
    });

    test('does not render followers for ADMIN role', async () => {
        const adminProfile = { ...mockProfileUser, role: 'ADMIN' };
        userService.getProfile.mockImplementation((params, onSuccess) => onSuccess(adminProfile));

        renderComponent();
        await waitFor(() => {
            expect(screen.queryByText('Seguidores:')).not.toBeInTheDocument();
            expect(screen.queryByText('Subscriptores:')).not.toBeInTheDocument();
        });
    });

    test('renders follow button when not following', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Seguir')).toBeInTheDocument();
        });
    });

    test('renders unfollow button when following', async () => {
        const followingUser = { ...mockUser, followingList: [2] };
        renderComponent('2', followingUser);
        
        await waitFor(() => {
            expect(screen.getByText('Dejar de seguir')).toBeInTheDocument();
        });
    });

    test('renders request sent button when request is pending', async () => {
        userService.getRequestSended.mockImplementation((onSuccess) => onSuccess([{ receiverId: 2 }]));
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
            expect(screen.getByText('Solicitud enviada')).toBeDisabled();
        });
    });

    test('handles follow action for TRAINER (direct follow)', async () => {
        const trainerProfile = { ...mockProfileUser, role: 'TRAINER' };
        userService.getProfile.mockImplementation((params, onSuccess) => onSuccess(trainerProfile));
        userService.followUser.mockImplementation((id, onSuccess) => onSuccess());

        renderComponent();
        
        await waitFor(() => expect(screen.getByText('Seguir')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Seguir'));

        expect(userService.followUser).toHaveBeenCalledWith(expect.stringMatching('2'), expect.any(Function), expect.any(Function));
        await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled());
    });

    test('handles follow action for USER (send request)', async () => {
        userService.sendFollowRequest.mockImplementation((id, onSuccess) => onSuccess());

        renderComponent();
        
        await waitFor(() => expect(screen.getByText('Seguir')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Seguir'));

        expect(userService.sendFollowRequest).toHaveBeenCalledWith(expect.stringMatching('2'), expect.any(Function), expect.any(Function));
        await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled());
    });

    test('handles unfollow action', async () => {
        const followingUser = { ...mockUser, followingList: [2] };
        userService.unfollowUser.mockImplementation((id, onSuccess) => onSuccess());

        renderComponent('2', followingUser);
        
        await waitFor(() => expect(screen.getByText('Dejar de seguir')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Dejar de seguir'));

        expect(userService.unfollowUser).toHaveBeenCalledWith(expect.stringMatching('2'), expect.any(Function), expect.any(Function));
    });

    test('handles block action', async () => {
        userService.blockUser.mockImplementation((id, onSuccess) => onSuccess());

        renderComponent();
        
        await waitFor(() => expect(screen.getByText('Bloquear')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Bloquear'));

        expect(userService.blockUser).toHaveBeenCalledWith(expect.stringMatching('2'), expect.any(Function), expect.any(Function));
    });

    test('does not show follow/block buttons on own profile', async () => {
        const myProfile = { ...mockProfileUser, id: 1, userName: 'currentUser' };
        userService.getProfile.mockImplementation((params, onSuccess) => onSuccess(myProfile));

        renderComponent('1', mockUser);

        await waitFor(() => {
            expect(screen.getByText('currentUser')).toBeInTheDocument();
        });

        expect(screen.queryByText('Seguir')).not.toBeInTheDocument();
        expect(screen.queryByText('Bloquear')).not.toBeInTheDocument();
    });

    test('renders child components', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByTestId('user-stats-panel')).toBeInTheDocument(); // Default tab
            expect(screen.getByTestId('calendar-card')).toBeInTheDocument();
        });
    });

    test('handles error loading profile', async () => {
        userService.getProfile.mockImplementation((params, onSuccess, onError) => onError('Error'));
        
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error al cargar el perfil')).toBeInTheDocument();
        });
    });
});

