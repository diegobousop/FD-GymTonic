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
    const mockUser = {
        id: 1,
        userName: 'testuser',
        premium: false
    };

    const renderComponent = (user = mockUser) =>
        render(
            <UserContext.Provider value={{ setUser, user }}>
                <Router>
                    <CreateRoutine />
                </Router>
            </UserContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.location.hash = '#/routines/create-routine';
    });

    test('renderiza el formulario correctamente', () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO" },
                    { id: 2, name: "Squat", descripcion: "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.", grupoMuscular: "PIERNA" },
                    { id: 3, name: "Pull Up", descripcion: "An upper body exercise that primarily targets the back and biceps.", grupoMuscular: "ESPALDA" }
                ],
                existMoreItems: false
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
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [],
                existMoreItems: false
            });
        });

        renderComponent();

        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(durationInput, {
            target: { value: '10' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument()
        );
    });

    test("muestra error de duración vacío", async () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [],
                existMoreItems: false
            });
        });

        renderComponent();

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
            expect(screen.getByText("La duración debe ser un número positivo.")).toBeInTheDocument()
        );
    });

    test("Rutina Creada Correctamente", async () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO" },
                    { id: 2, name: "Squat", descripcion: "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.", grupoMuscular: "PIERNA" },
                    { id: 3, name: "Pull Up", descripcion: "An upper body exercise that primarily targets the back and biceps.", grupoMuscular: "ESPALDA" }
                ],
                existMoreItems: false
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
        expect(globalThis.location.hash).toBe('#/routines/create-routine');
    });

    test("Rutina Creada Sin Nombre", async () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [],
                existMoreItems: false
            });
        });

        renderComponent();


        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(durationInput, {
            target: { value: '120' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument()
        );
        expect(globalThis.location.hash).toBe('#/routines/create-routine');
    });

    test("Rutina Creada Sin Duración", async () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [],
                existMoreItems: false
            });
        });

        renderComponent();

        const nameInput = screen.getByLabelText(/nombre/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina 1' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("La duración debe ser un número positivo.")).toBeInTheDocument()
        );
        expect(globalThis.location.hash).toBe('#/routines/create-routine');
    });

    test("checkbox desmarcado por defecto (rutina privada)", () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [],
                existMoreItems: false
            });
        });

        renderComponent();
        
        const label = screen.getByText('Rutina Publica');
        const checkbox = label.previousSibling;
        expect(checkbox).not.toBeChecked();
    });

    test("etiqueta del checkbox es estática y no cambia", () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [],
                existMoreItems: false
            });
        });

        renderComponent();
        
        const label = screen.getByText('Rutina Publica');
        expect(label).toBeInTheDocument();
        
        const checkbox = label.previousSibling;
        fireEvent.click(checkbox);
        
        expect(screen.getByText('Rutina Publica')).toBeInTheDocument();
        
        fireEvent.click(checkbox);
        
        expect(screen.getByText('Rutina Publica')).toBeInTheDocument();
    });

    test("crea rutina como pública cuando el checkbox está marcado", async () => {
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO" }
                ],
                existMoreItems: false
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
        const publicLabel = screen.getByText('Rutina Publica');
        const checkbox = publicLabel.previousSibling;

        fireEvent.change(nameInput, {
            target: { value: 'Rutina Pública' },
        });
        fireEvent.change(durationInput, {
            target: { value: '45' },
        });
        
        fireEvent.click(checkbox);
        fireEvent.click(screen.getByLabelText('Push Up'));
        
        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("Rutina creada Exitosamente")).toBeInTheDocument()
        );
    });

    test("muestra error cuando usuario no premium selecciona más de 5 ejercicios", async () => {
        // Mock con 6 ejercicios disponibles de una vez
        exerciseService.getValidatedExercises.mockImplementation(({page, size}, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "Exercise 1", grupoMuscular: "PECHO" },
                    { id: 2, name: "Squat", descripcion: "Exercise 2", grupoMuscular: "PIERNA" },
                    { id: 3, name: "Pull Up", descripcion: "Exercise 3", grupoMuscular: "ESPALDA" },
                    { id: 4, name: "Bench Press", descripcion: "Exercise 4", grupoMuscular: "PECHO" },
                    { id: 5, name: "Deadlift", descripcion: "Exercise 5", grupoMuscular: "ESPALDA" },
                    { id: 6, name: "Lunges", descripcion: "Exercise 6", grupoMuscular: "PIERNA" }
                ],
                existMoreItems: false
            });
        });

        renderComponent(); // usuario no premium por defecto

        const nameInput = screen.getByLabelText(/nombre/i);
        const durationInput = screen.getByLabelText(/duración/i);

        fireEvent.change(nameInput, {
            target: { value: 'Rutina Test' },
        });
        fireEvent.change(durationInput, {
            target: { value: '60' },
        });

        // Esperar a que los ejercicios se carguen
        await waitFor(() => {
            expect(screen.getByLabelText('Push Up')).toBeInTheDocument();
        });

        // Seleccionar 6 ejercicios (más del límite de 5 para no premium)
        fireEvent.click(screen.getByLabelText('Push Up'));
        fireEvent.click(screen.getByLabelText('Squat'));
        fireEvent.click(screen.getByLabelText('Pull Up'));
        fireEvent.click(screen.getByLabelText('Bench Press'));
        fireEvent.click(screen.getByLabelText('Deadlift'));
        fireEvent.click(screen.getByLabelText('Lunges'));

        // Enviar el formulario
        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        // Verificar que se muestra el mensaje de error
        await waitFor(() => {
            const errorText = screen.getByText(/Como entrenador no premium/i);
            expect(errorText).toBeInTheDocument();
        });
    });

});