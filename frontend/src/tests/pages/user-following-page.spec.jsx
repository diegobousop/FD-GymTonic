import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
    getFollowing: jest.fn(),
}));

import { HashRouter as Router } from 'react-router-dom';
import UserFollowingPage from "../../modules/app/pages/user-following-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { getFollowing } from "../../backend/userService";

describe("UserFollowingPage", () => {
    const mockUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        userName: "user1",
        id: 1,
        role: "USER"
    };

    const mockFollowing = [
        {
            id: 2,
            userName: "followed1",
            firstName: "Followed",
            lastName: "One",
            email: "followed1@example.com",
            avatarBase64: "data:image/png;base64,test1"
        },
        {
            id: 3,
            userName: "followed2",
            firstName: "Followed",
            lastName: "Two",
            email: "followed2@example.com",
            avatarBase64: null
        }
    ];

    const renderWithContext = (user = mockUser, overrides = {}) => {
        const defaultContext = {
            user,
            setUser: jest.fn(),
            handleLogout: jest.fn(),
        };
        return render(
            <UserContext.Provider value={{ ...defaultContext, ...overrides }}>
                <Router>
                    <UserFollowingPage />
                </Router>
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
    });

    it("muestra mensaje para ADMIN indicando que no siguen a usuarios", () => {
        const adminUser = { ...mockUser, role: "ADMIN" };
        renderWithContext(adminUser);

        expect(screen.getByText(/Los administradores no siguen a otros usuarios/i)).toBeInTheDocument();
        expect(getFollowing).not.toHaveBeenCalled();
    });

    it("muestra 'Personas que sigo' para usuarios USER", () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext({ ...mockUser, role: "USER" });

        expect(screen.getByText(/Personas que sigo/i)).toBeInTheDocument();
    });

    it("muestra 'Usuarios a los que sigo' para usuarios TRAINER", () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext({ ...mockUser, role: "TRAINER" });

        expect(screen.getByText(/Usuarios a los que sigo/i)).toBeInTheDocument();
    });

    it("muestra estado de carga cuando está cargando", () => {
        getFollowing.mockImplementation(() => {
            // Simular carga sin llamar a onSuccess inmediatamente
        });

        renderWithContext(mockUser);

        expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
    });

    it("muestra la lista de usuarios seguidos cuando se cargan", async () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: mockFollowing, existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText("followed1")).toBeInTheDocument();
            expect(screen.getByText("followed2")).toBeInTheDocument();
        });
    });

    it("muestra mensaje cuando no sigues a nadie", async () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText(/No sigues a nadie aún/i)).toBeInTheDocument();
        });
    });

    it("muestra botón 'Cargar más' cuando hay más elementos", async () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: mockFollowing, existMoreItems: true });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText(/Cargar más/i)).toBeInTheDocument();
        });
    });

    it("carga más usuarios seguidos al hacer click en 'Cargar más'", async () => {
        const moreFollowing = [
            {
                id: 4,
                userName: "followed3",
                firstName: "Followed",
                lastName: "Three",
                email: "followed3@example.com",
                avatarBase64: null
            }
        ];

        getFollowing
            .mockImplementationOnce(({ page, size }, onSuccess) => {
                onSuccess({ items: mockFollowing, existMoreItems: true });
            })
            .mockImplementationOnce(({ page, size }, onSuccess) => {
                onSuccess({ items: moreFollowing, existMoreItems: false });
            });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText("followed1")).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText(/Cargar más/i);
        fireEvent.click(loadMoreButton);

        await waitFor(() => {
            expect(screen.getByText("followed3")).toBeInTheDocument();
        });

        expect(getFollowing).toHaveBeenCalledTimes(2);
    });

    it("navega al perfil al hacer click en 'Volver al perfil'", async () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            const backButton = screen.getByText(/← Volver al perfil/i);
            fireEvent.click(backButton);
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });
    });

    it("llama a getFollowing con parámetros correctos", () => {
        getFollowing.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext(mockUser);

        expect(getFollowing).toHaveBeenCalledWith(
            { page: 0, size: 10 },
            expect.any(Function),
            expect.any(Function)
        );
    });

    it("maneja errores al cargar seguidos", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        getFollowing.mockImplementation(({ page, size }, onSuccess, onError) => {
            onError("Error al cargar");
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar seguidos:', "Error al cargar");
        });

        consoleErrorSpy.mockRestore();
    });
});


