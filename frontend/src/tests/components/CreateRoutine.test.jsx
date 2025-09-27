import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import CreateRoutine from '../../modules/routine/components/CreateRoutine';
import { UserContext } from '../../modules/app/components/common/user-provider';

import '@testing-library/jest-dom/extend-expect';

jest.mock('../../backend/routineService', () => ({
    createRoutine: jest.fn(),
}));

import routineService from '../../backend/routineService';

describe('CreateRoutine', () => {
    const setUser = jest.fn();

    const renderComponent = () =>
        render(
            <UserContext.Provider value={{ setUser }}>
                <Router>
                    <CreateRoutine />
                </Router>
            </UserContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        window.location.hash = '#/routines/create-routine';
    });

    test('renders the form correctly', () => {
        renderComponent();

        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Duración')).toBeInTheDocument();
        expect(screen.getByText('Ejercicios (IDs)')).toBeInTheDocument();
    });

    test("muestra error de nombre vacío", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, onSuccess, onError) => {
            onError({ globalError: "project.exceptions.InvalidRoutineNameException" });
        });

        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(durationInput, {
            target: { value: '0' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("project.exceptions.InvalidRoutineNameException")).toBeInTheDocument()
        );
    });

    test("muestra error de nombre de duración vacío", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, onSuccess, onError) => {
            onError({ globalError: "project.exceptions.InvalidRoutineDurationException" });
        });

        const nameInput = screen.getByLabelText(/nombre/i);
        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina 1' },
        });
        fireEvent.change(durationInput, {
            target: { value: '0' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("project.exceptions.InvalidRoutineDurationException")).toBeInTheDocument()
        );
    });

    test("Rutina Creada Correctamente", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, onSuccess, onError) => {
            onSuccess({
                "id": 1,
                "name": "Test 1",
                "exercises": [
                    {
                        "name": "Push Up",
                        "descripcion": "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.",
                        "grupoMuscular": "PECHO"
                    },
                    {
                        "name": "Squat",
                        "descripcion": "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.",
                        "grupoMuscular": "PIERNA"
                    },
                    {
                        "name": "Pull Up",
                        "descripcion": "An upper body exercise that primarily targets the back and biceps.",
                        "grupoMuscular": "ESPALDA"
                    }
                ],
                "creator": "admin1",
                "duration": 120,
                "modificationDate": "2025-09-26T23:27:44"
            });
        });

        const nameInput = screen.getByLabelText(/nombre/i);
        const durationInput = screen.getByLabelText(/duración/i);
        const exercisesInput = screen.getByLabelText(/ejercicios/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina 1' },
        });
        fireEvent.change(durationInput, {
            target: { value: '120' },
        });
        fireEvent.change(exercisesInput, {
            target: { value: '1,2,3' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("Rutina creada Exitosamente")).toBeInTheDocument()
        );
        expect(window.location.hash).toBe('#/routines/create-routine');
    });

        test("Rutina Creada Sin Nombre", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, onSuccess, onError) => {
            onError({ globalError: "project.exceptions.InvalidRoutineNameException" });
        });

        const durationInput = screen.getByLabelText(/duración/i);
        const exercisesInput = screen.getByLabelText(/ejercicios/i);

        fireEvent.change(durationInput, {
            target: { value: '120' },
        });
        fireEvent.change(exercisesInput, {
            target: { value: '1,2,3' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("project.exceptions.InvalidRoutineNameException")).toBeInTheDocument()
        );
        expect(window.location.hash).toBe('#/routines/create-routine');
    });

            test("Rutina Creada Sin Duración", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, onSuccess, onError) => {
            onError({ globalError: "project.exceptions.InvalidRoutineDurationException" });
        });

        const nameInput = screen.getByLabelText(/nombre/i);
        const exercisesInput = screen.getByLabelText(/ejercicios/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina 1' },
        });
        fireEvent.change(exercisesInput, {
            target: { value: '1,2,3' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("project.exceptions.InvalidRoutineDurationException")).toBeInTheDocument()
        );
        expect(window.location.hash).toBe('#/routines/create-routine');
    });

});