
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfilePage from "../../modules/app/pages/profile-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { getProfile } from "../../backend/userService";

import '@testing-library/jest-dom/extend-expect';

jest.mock("../../backend/userService", () => ({
    getProfile: jest.fn(),
}));

describe("ProfilePage", () => {
    const mockUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        userName: "user1",
        id:1
    };

    const renderWithContext = (user = mockUser, overrides = {}) => {
        const defaultContext = {
            user,
            setUser: jest.fn(),
            handleLogout: jest.fn(),
        };
        return render(
            <UserContext.Provider value={{ ...defaultContext, ...overrides }}>
                <ProfilePage />
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("muestra 'Cargando datos...' cuando no hay usuario", () => {
        renderWithContext(null);
        expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument();
    });

    it("renderiza datos del usuario cuando existe", async () => {
        getProfile.mockImplementation((_, onSuccess) =>
            onSuccess({ email: "test@example.com", firstName: "John", lastName: "Doe" })
        );

        renderWithContext(mockUser);

        await waitFor(() =>
            expect(screen.getByText('Datos de usuario')).toBeInTheDocument()
        );
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/John/i)).toBeInTheDocument();
        expect(screen.getByText(/Doe/i)).toBeInTheDocument();
    });

    it("muestra mensaje de error si getProfile falla", async () => {
        getProfile.mockImplementation((_, __, onError) => onError("error"));

        renderWithContext(mockUser);

        await waitFor(() =>
            expect(
                screen.getByText(/Error al cargar el perfil/i)
            ).toBeInTheDocument()
        );
    });

    it("llama a handleLogout cuando se hace click en el botón", () => {
        const handleLogout = jest.fn();
        renderWithContext(mockUser, { handleLogout });

        fireEvent.click(screen.getByRole("button", { name: /Cerrar sesión/i }));
        expect(handleLogout).toHaveBeenCalled();
    });
});
