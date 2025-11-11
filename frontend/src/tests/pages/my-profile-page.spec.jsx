import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

import { HashRouter as Router } from 'react-router-dom';
import MyProfilePage from "../../modules/app/pages/my-profile-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { getProfile, getFollowersCount, getFollowingCount } from "../../backend/userService";


jest.mock('react-calendar', () => ({
  __esModule: true,
  default: ({ className }) => <div data-testid="mock-calendar" className={className} />
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
    getProfile: jest.fn(),
    getFollowersCount: jest.fn(),
    getFollowingCount: jest.fn(),
}));



describe("ProfilePage", () => {
    const mockUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        userName: "user1",
        id: 1,
        role: "USER",
        avatar: { avatarBase64: "data:image/png;base64,AAA" } // <- añade avatar
    };

    const renderWithContext = (user = mockUser, overrides = {}) => {
        const defaultContext = {
            user,
            setUser: jest.fn(),
            handleLogout: jest.fn(),
        };
        return render(
            <UserContext.Provider value={{ ...defaultContext, ...overrides }}>
                <Router>
                    <MyProfilePage />
                </Router>
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getFollowersCount.mockImplementation((onSuccess, onError) => {
            onSuccess(0);
        });
        getFollowingCount.mockImplementation((onSuccess, onError) => {
            onSuccess(0);
        });
    });

    it("muestra 'Cargando datos...' cuando no hay usuario", () => {
        renderWithContext(null);
        expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument();
    });

    it("renderiza datos del usuario cuando existe", async () => {
        getProfile.mockImplementation((_, onSuccess) =>
            onSuccess({ email: "test@example.com", firstName: "John", lastName: "Doe" })
        );
        getFollowersCount.mockImplementation((onSuccess) => onSuccess(5));
        getFollowingCount.mockImplementation((onSuccess) => onSuccess(3));

        renderWithContext({ ...mockUser, role: 'USER' });


        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.getByText(/5 seguidores/i)).toBeInTheDocument();
        expect(screen.getByText(/3 seguidos/i)).toBeInTheDocument();
    });

    it("muestra mensaje de error si getProfile falla", async () => {
        getProfile.mockImplementation((_, __, onError) => onError("error"));
        getFollowersCount.mockImplementation((onSuccess) => onSuccess(0));
        getFollowingCount.mockImplementation((onSuccess) => onSuccess(0));

        renderWithContext({ ...mockUser, role: 'USER' });

        await waitFor(() =>
            expect(
                screen.getByText(/Error al cargar el perfil/i)
            ).toBeInTheDocument()
        );
    });

    it("llama a handleLogout cuando se hace click en el botón", () => {
        getProfile.mockImplementation((_, onSuccess) => onSuccess({}));
        const mockHandleLogout = jest.fn();

        renderWithContext(undefined, { handleLogout: mockHandleLogout });

        const logoutButton = screen.getByLabelText(/cerrar sesión/i);
        fireEvent.click(logoutButton);

        expect(mockHandleLogout).toHaveBeenCalledTimes(1);
    });


});
