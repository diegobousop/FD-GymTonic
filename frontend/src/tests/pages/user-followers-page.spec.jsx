import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
    getFollowers: jest.fn(),
}));

import { HashRouter as Router } from 'react-router-dom';
import UserFollowersPage from "../../modules/app/pages/user-followers-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { getFollowers } from "../../backend/userService";

describe("UserFollowersPage", () => {
    const mockUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        userName: "user1",
        id: 1,
        role: "USER"
    };

    const mockFollowers = [
        {
            id: 2,
            userName: "follower1",
            firstName: "Follower",
            lastName: "One",
            email: "follower1@example.com",
            avatarBase64: "data:image/png;base64,test1"
        },
        {
            id: 3,
            userName: "follower2",
            firstName: "Follower",
            lastName: "Two",
            email: "follower2@example.com",
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
                    <UserFollowersPage />
                </Router>
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
    });

    it("muestra mensaje para ADMIN indicando que no tienen seguidores", () => {
        const adminUser = { ...mockUser, role: "ADMIN" };
        renderWithContext(adminUser);

        expect(screen.getByText(/Los administradores no tienen seguidores/i)).toBeInTheDocument();
        expect(getFollowers).not.toHaveBeenCalled();
    });

    it("muestra 'Mis Seguidores' para usuarios USER", () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext({ ...mockUser, role: "USER" });

        expect(screen.getByText(/Mis Seguidores/i)).toBeInTheDocument();
    });

    it("muestra 'Mis Subscriptores' para usuarios TRAINER", () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext({ ...mockUser, role: "TRAINER" });

        expect(screen.getByText(/Mis Subscriptores/i)).toBeInTheDocument();
    });

    it("muestra estado de carga cuando está cargando", () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            // No llamar onSuccess inmediatamente para simular carga
        });

        renderWithContext(mockUser);
        
        expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
    });

    it("muestra lista de seguidores cuando se cargan", async () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: mockFollowers, existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText("follower1")).toBeInTheDocument();
            expect(screen.getByText("follower2")).toBeInTheDocument();
        });
    });

    it("muestra información de cada seguidor (avatar y nombre de usuario)", async () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: mockFollowers, existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText("follower1")).toBeInTheDocument();
            expect(screen.getByText("follower2")).toBeInTheDocument();
        });
    });

    it("muestra mensaje cuando no hay seguidores", async () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText(/No tienes seguidores aún/i)).toBeInTheDocument();
        });
    });

    it("muestra botón 'Cargar más' cuando hay más items", async () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: mockFollowers, existMoreItems: true });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText(/Cargar más/i)).toBeInTheDocument();
        });
    });

    it("carga más seguidores al hacer click en 'Cargar más'", async () => {
        const moreFollowers = [
            {
                id: 4,
                userName: "follower3",
                firstName: "Follower",
                lastName: "Three",
                email: "follower3@example.com",
                avatarBase64: null
            }
        ];

        getFollowers
            .mockImplementationOnce(({ page, size }, onSuccess) => {
                onSuccess({ items: mockFollowers, existMoreItems: true });
            })
            .mockImplementationOnce(({ page, size }, onSuccess) => {
                onSuccess({ items: moreFollowers, existMoreItems: false });
            });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(screen.getByText("follower1")).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText(/Cargar más/i);
        fireEvent.click(loadMoreButton);

        await waitFor(() => {
            expect(screen.getByText("follower3")).toBeInTheDocument();
        });

        expect(getFollowers).toHaveBeenCalledTimes(2);
    });

    it("navega al perfil al hacer click en 'Volver al perfil'", async () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            const backButton = screen.getByText(/← Volver al perfil/i);
            fireEvent.click(backButton);
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });
    });

    it("llama a getFollowers con parámetros correctos", () => {
        getFollowers.mockImplementation(({ page, size }, onSuccess) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        renderWithContext(mockUser);

        expect(getFollowers).toHaveBeenCalledWith(
            { page: 0, size: 10 },
            expect.any(Function),
            expect.any(Function)
        );
    });

    it("maneja errores al cargar seguidores", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        getFollowers.mockImplementation(({ page, size }, onSuccess, onError) => {
            onError("Error al cargar");
        });

        renderWithContext(mockUser);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar seguidores:', "Error al cargar");
        });

        consoleErrorSpy.mockRestore();
    });
});

