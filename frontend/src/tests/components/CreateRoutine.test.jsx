import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import CreateRoutine from '../../modules/app/pages/create-routine-page';
import { UserContext } from '../../modules/app/components/common/user-provider';

import '@testing-library/jest-dom/extend-expect';

import routineService from '../../backend/routineService';
import exerciseService from '../../backend/exerciseService';

jest.mock('../../backend/routineService', () => ({
    createRoutine: jest.fn(),
}));

jest.mock('../../backend/exerciseService', () => ({
    getValidatedExercises: jest.fn(),
}));



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
        exerciseService.getValidatedExercises.mockImplementation((page, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO" },
                    { id: 2, name: "Squat", descripcion: "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.", grupoMuscular: "PIERNA" },
                    { id: 3, name: "Pull Up", descripcion: "An upper body exercise that primarily targets the back and biceps.", grupoMuscular: "ESPALDA" }
                ]
            });
        });

        renderComponent();

        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Duración')).toBeInTheDocument();
        expect(screen.getByText('Ejercicios')).toBeInTheDocument();
        
        expect(screen.getByLabelText('Push Up')).toBeInTheDocument();
        expect(screen.getByLabelText('Squat')).toBeInTheDocument();
        expect(screen.getByLabelText('Pull Up')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    });

    test("muestra error de nombre vacío", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, isPublic, onSuccess, onError) => {
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

    test("muestra error de duración vacío", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, isPublic, onSuccess, onError) => {
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
        exerciseService.getValidatedExercises.mockImplementation((page, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO" },
                    { id: 2, name: "Squat", descripcion: "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.", grupoMuscular: "PIERNA" },
                    { id: 3, name: "Pull Up", descripcion: "An upper body exercise that primarily targets the back and biceps.", grupoMuscular: "ESPALDA" }
                ]
            });
        });

        routineService.createRoutine.mockImplementation((name, exercises, duration, isPublic, onSuccess, onError) => {
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

        renderComponent();

        const nameInput = screen.getByLabelText(/nombre/i);
        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina 1' },
        });
        fireEvent.change(durationInput, {
            target: { value: '120' },
        });


        expect(screen.getByLabelText('Push Up')).toBeInTheDocument();
        expect(screen.getByLabelText('Squat')).toBeInTheDocument();
        expect(screen.getByLabelText('Pull Up')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Push Up'));
        fireEvent.click(screen.getByLabelText('Squat'));
        fireEvent.click(screen.getByLabelText('Pull Up'));

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("Rutina creada Exitosamente")).toBeInTheDocument()
        );
        expect(window.location.hash).toBe('#/routines/create-routine');
    });

    test("Rutina Creada Sin Nombre", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, isPublic, onSuccess, onError) => {
            onError({ globalError: "project.exceptions.InvalidRoutineNameException" });
        });

        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(durationInput, {
            target: { value: '120' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("project.exceptions.InvalidRoutineNameException")).toBeInTheDocument()
        );
        expect(window.location.hash).toBe('#/routines/create-routine');
    });

    test("Rutina Creada Sin Duración", async () => {
        renderComponent();

        routineService.createRoutine.mockImplementation((name, exercises, duration, isPublic, onSuccess, onError) => {
            onError({ globalError: "project.exceptions.InvalidRoutineDurationException" });
        });

        const nameInput = screen.getByLabelText(/nombre/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina 1' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("project.exceptions.InvalidRoutineDurationException")).toBeInTheDocument()
        );
        expect(window.location.hash).toBe('#/routines/create-routine');
    });

    test("checkbox desmarcado por defecto (rutina privada)", () => {
        exerciseService.getValidatedExercises.mockImplementation((page, onSuccess, onError) => {
            onSuccess({
                items: []
            });
        });

        renderComponent();
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    test("etiqueta del checkbox es estática y no cambia", () => {
        exerciseService.getValidatedExercises.mockImplementation((page, onSuccess, onError) => {
            onSuccess({
                items: []
            });
        });

        renderComponent();
        
        const label = screen.getByText('Rutina Publica');
        expect(label).toBeInTheDocument();
        
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        
        expect(screen.getByText('Rutina Publica')).toBeInTheDocument();
        
        fireEvent.click(checkbox);
        
        expect(screen.getByText('Rutina Publica')).toBeInTheDocument();
    });

    test("crea rutina como pública cuando el checkbox está marcado", async () => {
        exerciseService.getValidatedExercises.mockImplementation((page, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO" }
                ]
            });
        });

        routineService.createRoutine.mockImplementation((name, exercises, duration, isPublic, onSuccess, onError) => {
            expect(isPublic).toBe(true); 
            onSuccess({
                "id": 1,
                "name": name,
                "exercises": exercises,
                "creator": "admin1",
                "duration": duration,
                "isPublic": true,
                "modificationDate": "2025-09-26T23:27:44"
            });
        });

        renderComponent();

        const nameInput = screen.getByLabelText(/nombre/i);
        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina Pública' },
        });
        fireEvent.change(durationInput, {
            target: { value: '45' },
        });


    });

});