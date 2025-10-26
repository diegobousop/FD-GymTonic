import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoutineSelector from '../../modules/app/components/training/routine-selector';
import backend from '../../backend';

import '@testing-library/jest-dom/extend-expect';

jest.mock('../../backend', () => ({
    routineService: {
        viewAllRoutines: jest.fn(),
    },
}));

describe('RoutineSelector', () => {
    const mockRoutines = [
        {
            id: 1,
            name: 'Rutina de Fuerza',
            creator: 'Juan Pérez',
            creatorAvatarBase64: 'data:image/png;base64,mockImage1',
            duration: 45,
        },
        {
            id: 2,
            name: 'Rutina Cardio',
            creator: 'María López',
            creatorAvatarBase64: 'data:image/png;base64,mockImage2',
            duration: 30,
        },
    ];

    const mockSetSelectedRoutine = jest.fn();
    const mockOnDeselect = jest.fn();

    const renderComponent = (selectedRoutine = null) =>
        render(
            <RoutineSelector
                selectedRoutine={selectedRoutine}
                setSelectedRoutine={mockSetSelectedRoutine}
                onDeselect={mockOnDeselect}
            />
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test('renders routines list after loading', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
            expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
            expect(screen.getByText('Rutina Cardio')).toBeInTheDocument();
            expect(screen.getByText('María López')).toBeInTheDocument();
        });
    });

    test('displays error message on load failure', async () => {
        const errorMessage = 'Error al cargar rutinas';
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess, onError) => {
            onError(errorMessage);
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    test('displays message when no routines available', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: [],
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Todavía no hay rutinas disponibles')).toBeInTheDocument();
        });
    });

    test('selects a routine when clicked', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });

        const routineButton = screen.getByText('Rutina de Fuerza').closest('button');
        fireEvent.click(routineButton);

        expect(mockSetSelectedRoutine).toHaveBeenCalledWith(mockRoutines[0]);
    });

    test('displays selected routine correctly', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent(mockRoutines[0]);

        await waitFor(() => {
            expect(screen.getByText('Rutina seleccionada')).toBeInTheDocument();
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });
    });

    

    test('filters routines based on search query', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Buscar rutina');
        fireEvent.change(searchInput, { target: { value: 'Fuerza' } });

        await waitFor(() => {
            expect(screen.getByText('Resultados de búsqueda')).toBeInTheDocument();
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });
    });

    test('shows no results message when search yields no matches', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Buscar rutina');
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

        await waitFor(() => {
            expect(screen.getByText('No se encontraron rutinas con ese nombre')).toBeInTheDocument();
        });
    });

    test('clears suggestions when search query is empty', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Buscar rutina');
        fireEvent.change(searchInput, { target: { value: 'Fuerza' } });

        await waitFor(() => {
            expect(screen.getByText('Resultados de búsqueda')).toBeInTheDocument();
        });

        fireEvent.change(searchInput, { target: { value: '' } });

        await waitFor(() => {
            expect(screen.getByText('Rutinas recientes')).toBeInTheDocument();
        });
    });



    test('selects routine from search suggestions', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Buscar rutina');
        fireEvent.change(searchInput, { target: { value: 'Cardio' } });

        await waitFor(() => {
            expect(screen.getByText('Resultados de búsqueda')).toBeInTheDocument();
        });

        const cardioButton = screen.getByText('Rutina Cardio').closest('button');
        fireEvent.click(cardioButton);

        expect(mockSetSelectedRoutine).toHaveBeenCalledWith(mockRoutines[1]);
    });

    test('displays routine duration in minutes', async () => {
        backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
            onSuccess({
                items: mockRoutines,
                existMoreItems: false,
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('45 minutos')).toBeInTheDocument();
            expect(screen.getByText('30 minutos')).toBeInTheDocument();
        });
    });
});
