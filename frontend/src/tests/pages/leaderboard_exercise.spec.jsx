import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardsPage from '../../modules/app/pages/leaderboard-exercise';
import backend from '../../backend';

jest.mock('../../backend', () => ({
    exerciseService: {
        getValidatedExercises: jest.fn()
    },
    routineService: {
        viewAllRoutines: jest.fn()
    },
    userService: {
        getLeaderboard: jest.fn(),
        getLeaderboardRoutine: jest.fn(),
        getProfile: jest.fn()
    }
}));

describe('LeaderboardsPage', () => {
    const mockExercises = [
        { id: 1, name: 'Ejercicio 1' },
        { id: 2, name: 'Ejercicio 2' }
    ];

    const mockRoutines = [
        { id: 1, name: 'Rutina 1' },
        { id: 2, name: 'Rutina 2' }
    ];

    const mockLeaderboard = [
        { userId: 1, score: 100 },
        { userId: 2, score: 80 }
    ];

    const mockProfile = (id) => ({
        userName: `Usuario ${id}`,
        avatar: { avatarBase64: '/avatar.png' }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('userId', '1');

        backend.exerciseService.getValidatedExercises.mockImplementation((params, onSuccess, onError) => {
            onSuccess({ items: mockExercises, existMoreItems: true });
        });

        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess, onError) => {
            onSuccess(mockRoutines);
        });

        backend.userService.getLeaderboard.mockImplementation((params, onSuccess, onError) => {
            onSuccess(mockLeaderboard);
        });

        backend.userService.getLeaderboardRoutine.mockImplementation((params, onSuccess, onError) => {
            onSuccess(mockLeaderboard);
        });

        backend.userService.getProfile.mockImplementation((params, onSuccess, onError) => {
            onSuccess(mockProfile(params.id));
        });
    });

    it('muestra ejercicios por defecto', async () => {
        render(<LeaderboardsPage />);

        await waitFor(() => {
            expect(screen.getByText('Ejercicio 1')).toBeInTheDocument();
            expect(screen.getByText('Ejercicio 2')).toBeInTheDocument();
        });
    });

    it('cambia a leaderboard por rutina', async () => {
        render(<LeaderboardsPage />);

        fireEvent.click(screen.getByText('Por rutina'));

        await waitFor(() => {
            expect(screen.getByText('Rutinas')).toBeInTheDocument();
            expect(screen.getByText('Rutina 1')).toBeInTheDocument();
            expect(screen.getByText('Rutina 2')).toBeInTheDocument();
        });
    });

    it('selecciona un ejercicio y carga el leaderboard', async () => {
        render(<LeaderboardsPage />);

        // Esperar a que carguen los ejercicios
        await waitFor(() => {
            expect(screen.getByText('Ejercicio 1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Ejercicio 1'));

        await waitFor(() => {
            expect(screen.getByText('Usuario 1')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('Usuario 2')).toBeInTheDocument();
            expect(screen.getByText('80')).toBeInTheDocument();
        });
    });

    it('selecciona una rutina y carga el leaderboard', async () => {
        render(<LeaderboardsPage />);

        // Cambiar a rutinas
        fireEvent.click(screen.getByText('Por rutina'));

        // Esperar a que carguen las rutinas
        await waitFor(() => {
            expect(screen.getByText('Rutina 1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Rutina 1'));

        await waitFor(() => {
            expect(screen.getByText('Usuario 1')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('Usuario 2')).toBeInTheDocument();
            expect(screen.getByText('80')).toBeInTheDocument();
        });
    });

    it('muestra mensaje de carga de ejercicios', async () => {
        // Mock que no llama a ninguna callback inmediatamente
        backend.exerciseService.getValidatedExercises.mockImplementation(() => {});

        render(<LeaderboardsPage />);

        // Verificar que se muestra el mensaje de carga
        expect(screen.getByText('Cargando ejercicios...')).toBeInTheDocument();
    });

    it('muestra mensaje de no hay ejercicios disponibles', async () => {
        backend.exerciseService.getValidatedExercises.mockImplementation((params, onSuccess, onError) => {
            onSuccess({ items: [], existMoreItems: false });
        });

        render(<LeaderboardsPage />);

        await waitFor(() => {
            expect(screen.getByText('No hay ejercicios disponibles')).toBeInTheDocument();
        });
    });

    it('muestra mensaje de no hay rutinas disponibles', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess, onError) => {
            onSuccess([]);
        });

        render(<LeaderboardsPage />);

        fireEvent.click(screen.getByText('Por rutina'));

        await waitFor(() => {
            expect(screen.getByText('No hay rutinas disponibles')).toBeInTheDocument();
        });
    });

    it('navega a la página siguiente y anterior de ejercicios', async () => {
        render(<LeaderboardsPage />);

        // Esperar a que carguen los ejercicios iniciales
        await waitFor(() => {
            expect(screen.getByText('Ejercicio 1')).toBeInTheDocument();
        });

        const nextButton = screen.getByText('Siguiente');
        const prevButton = screen.getByText('Anterior');

        // Inicialmente página 0, anterior deshabilitado
        expect(prevButton).toBeDisabled();
        expect(nextButton).not.toBeDisabled();

        // Hacer clic en siguiente
        fireEvent.click(nextButton);

        await waitFor(() => {
            // Se llama con página 1
            expect(backend.exerciseService.getValidatedExercises).toHaveBeenLastCalledWith(
                { page: 1, size: 3 },
                expect.any(Function),
                expect.any(Function)
            );
        });

        // Ahora anterior debería estar habilitado
        expect(screen.getByText('Anterior')).not.toBeDisabled();

        // Hacer clic en anterior
        fireEvent.click(screen.getByText('Anterior'));

        await waitFor(() => {
            // Se llama con página 0 de nuevo
            expect(backend.exerciseService.getValidatedExercises).toHaveBeenLastCalledWith(
                { page: 0, size: 3 },
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    it('muestra error si falla la carga del leaderboard', async () => {
        backend.userService.getLeaderboard.mockImplementation((params, onSuccess, onError) => {
            onError();
        });

        render(<LeaderboardsPage />);

        // Esperar ejercicios y seleccionar uno
        await waitFor(() => {
            expect(screen.getByText('Ejercicio 1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Ejercicio 1'));

        await waitFor(() => {
            expect(screen.getByText('Error al cargar el ranking')).toBeInTheDocument();
        });
    });

    it('muestra mensaje inicial antes de seleccionar ejercicio', async () => {
        render(<LeaderboardsPage />);

        await waitFor(() => {
            expect(screen.getByText('Selecciona un ejercicio para ver el ranking')).toBeInTheDocument();
        });
    });

    it('muestra mensaje inicial antes de seleccionar rutina', async () => {
        render(<LeaderboardsPage />);

        fireEvent.click(screen.getByText('Por rutina'));

        await waitFor(() => {
            expect(screen.getByText('Selecciona una rutina para ver el ranking')).toBeInTheDocument();
        });
    });

    it('muestra mensaje por defecto si leaderboard está vacío', async () => {
        backend.userService.getLeaderboard.mockImplementation((params, onSuccess) => {
            onSuccess([]);
        });

        render(<LeaderboardsPage />);

        // Esperar ejercicios y seleccionar uno
        await waitFor(() => {
            expect(screen.getByText('Ejercicio 1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Ejercicio 1'));

        // Cuando el leaderboard está vacío, se muestra el mensaje inicial
        await waitFor(() => {
            expect(screen.getByText('Selecciona un ejercicio para ver el ranking')).toBeInTheDocument();
        });
    });
});