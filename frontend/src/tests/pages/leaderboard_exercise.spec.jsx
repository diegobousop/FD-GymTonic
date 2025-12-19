import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import LeaderboardsPage from "../../modules/app/pages/leaderboard-exercise";
import backend from "../../backend";

jest.mock("../../backend", () => ({
    exerciseService: {
        getValidatedExercises: jest.fn(),
    },
    userService: {
        getLeaderboard: jest.fn(),
        getProfile: jest.fn(),
    },
}));

describe("LeaderboardsPage", () => {
    const mockExercises = [
        { id: 1, name: "Ejercicio 1" },
        { id: 2, name: "Ejercicio 2" },
    ];

    const mockLeaderboard = [
        { userId: 10, score: 100 },
        { userId: 11, score: 80 },
    ];

    const mockProfiles = {
        10: {
            userName: "user10",
            avatar: { avatarBase64: "data:image/png;base64,user10" },
        },
        11: {
            userName: "user11",
            avatar: { avatarBase64: null },
        },
    };

    const renderPage = () => render(<LeaderboardsPage />);

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("userId", "1");
    });

    it("muestra estado de carga de ejercicios", () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(() => {});

        renderPage();

        expect(
            screen.getByText(/Cargando ejercicios/i)
        ).toBeInTheDocument();
    });

    it("muestra mensaje cuando no hay ejercicios", async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: [], existMoreItems: false });
            }
        );

        renderPage();

        await waitFor(() => {
            expect(
                screen.getByText(/No hay ejercicios disponibles/i)
            ).toBeInTheDocument();
        });
    });

    it("muestra la lista de ejercicios", async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: mockExercises, existMoreItems: false });
            }
        );

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Ejercicio 1")).toBeInTheDocument();
            expect(screen.getByText("Ejercicio 2")).toBeInTheDocument();
        });
    });

    it("muestra mensaje inicial del ranking", async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: mockExercises, existMoreItems: false });
            }
        );

        renderPage();

        await waitFor(() => {
            expect(
                screen.getByText(/Selecciona un ejercicio para ver el ranking/i)
            ).toBeInTheDocument();
        });
    });

    it("carga el ranking al seleccionar un ejercicio", async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: mockExercises, existMoreItems: false });
            }
        );

        backend.userService.getLeaderboard.mockImplementation(
            ({ exerciseId }, onSuccess) => {
                onSuccess(mockLeaderboard);
            }
        );

        backend.userService.getProfile.mockImplementation(
            ({ id }, onSuccess) => {
                onSuccess(mockProfiles[id]);
            }
        );

        renderPage();

        fireEvent.click(await screen.findByText("Ejercicio 1"));

        await waitFor(() => {
            expect(screen.getByText("user10")).toBeInTheDocument();
            expect(screen.getByText("user11")).toBeInTheDocument();
            expect(screen.getByText("100")).toBeInTheDocument();
            expect(screen.getByText("80")).toBeInTheDocument();
        });
    });

    it("muestra estado de carga del ranking", async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: mockExercises, existMoreItems: false });
            }
        );

        backend.userService.getLeaderboard.mockImplementation(() => {});

        renderPage();

        fireEvent.click(await screen.findByText("Ejercicio 1"));

        expect(
            screen.getByText(/Cargando ranking/i)
        ).toBeInTheDocument();
    });

    it("maneja error al cargar ranking", async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: mockExercises, existMoreItems: false });
            }
        );

        backend.userService.getLeaderboard.mockImplementation(
            ({ exerciseId }, onSuccess, onError) => {
                onError("Error");
            }
        );

        renderPage();

        fireEvent.click(await screen.findByText("Ejercicio 1"));

        await waitFor(() => {
            expect(
                screen.getByText(/Error al cargar el ranking/i)
            ).toBeInTheDocument();
        });
    });

    it("muestra botones de paginación y navega de página", async () => {
        backend.exerciseService.getValidatedExercises
            .mockImplementationOnce(({ page, size }, onSuccess) => {
                onSuccess({ items: mockExercises, existMoreItems: true });
            })
            .mockImplementationOnce(({ page, size }, onSuccess) => {
                onSuccess({ items: [], existMoreItems: false });
            });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Ejercicio 1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Siguiente/i));

        await waitFor(() => {
            expect(
                screen.getByText(/No hay ejercicios disponibles/i)
            ).toBeInTheDocument();
        });

        expect(
            backend.exerciseService.getValidatedExercises
        ).toHaveBeenCalledTimes(2);
    });

    it("llama a getValidatedExercises con parámetros correctos", () => {
        backend.exerciseService.getValidatedExercises.mockImplementation(
            ({ page, size }, onSuccess) => {
                onSuccess({ items: [], existMoreItems: false });
            }
        );

        renderPage();

        expect(
            backend.exerciseService.getValidatedExercises
        ).toHaveBeenCalledWith(
            { page: 0, size: 3 },
            expect.any(Function),
            expect.any(Function)
        );
    });
});
