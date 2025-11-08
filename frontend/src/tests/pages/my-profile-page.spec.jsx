
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
    getProfile: jest.fn(),
    getFollowersCount: jest.fn(),
}));

import { HashRouter as Router } from 'react-router-dom';
import ProfilePage from "../../modules/app/pages/profile-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { getProfile, getFollowersCount } from "../../backend/userService";

describe("ProfilePage", () => {
    const mockUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        userName: "user1",
        id:1,
        role: "USER"
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

        renderWithContext({ ...mockUser, role: 'USER' });


        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("Doe")).toBeInTheDocument();
    });

    it("muestra mensaje de error si getProfile falla", async () => {
        getProfile.mockImplementation((_, __, onError) => onError("error"));
        getFollowersCount.mockImplementation((onSuccess) => onSuccess(0));

        renderWithContext({ ...mockUser, role: 'USER' });

        await waitFor(() =>
            expect(
                screen.getByText(/Error al cargar el perfil/i)
            ).toBeInTheDocument()
        );
    });

    it("llama a handleLogout cuando se hace click en el botón", () => {
        const handleLogout = jest.fn();
        getFollowersCount.mockImplementation((onSuccess) => onSuccess(0));
        renderWithContext({ ...mockUser, role: 'USER' }, { handleLogout });

        fireEvent.click(screen.getByRole("button", { name: /Cerrar sesión/i }));
        expect(handleLogout).toHaveBeenCalled();
    });
});
