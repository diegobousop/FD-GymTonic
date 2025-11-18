import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import CreateTraining from '../../modules/app/pages/create-training-page';

import { UserContext } from '../../modules/app/components/common/user-provider';
import { ToastProvider } from '../../modules/app/components/common/toast-provider';

import '@testing-library/jest-dom/extend-expect';

jest.mock('../../backend/routineService', () => ({
    findRoutineDetails: jest.fn(),
    createTraining: jest.fn(),
    viewAllRoutines: jest.fn(),
}));

describe('CreateTraining', () => {
    const setUser = jest.fn();

    const renderComponent = () =>
        render(
            <UserContext.Provider value={{ setUser }}>
                <ToastProvider>
                    <Router>
                        <CreateTraining />
                    </Router>
                </ToastProvider>
            </UserContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        globalThis.location.hash = '#/training/create';
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renderiza el formulario correctamente', () => {
        renderComponent();

        expect(screen.getByText('Nombre')).toBeInTheDocument();

    });

    test('valida campos obligatorios al enviar', async () => {
        renderComponent();

        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
        });
    });

    test('valida longitud del nombre', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Nombre');
        
        fireEvent.change(nameInput, { target: { value: 'ab' } });
        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
        });

        const longName = 'a'.repeat(101);
        fireEvent.change(nameInput, { target: { value: longName } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('El nombre no puede exceder 100 caracteres')).toBeInTheDocument();
        });
    });

    test('valida que la duración sea un número positivo', async () => {
        renderComponent();

        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(durationInput, { target: { value: '-5' } });
        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('La duración debe ser un número positivo')).toBeInTheDocument();
        });
    });

    test('valida valor máximo de duración', async () => {
        renderComponent();

        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(durationInput, { target: { value: '1001' } });
        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('La duración no puede exceder 1000 minutos')).toBeInTheDocument();
        });
    });

    test('limpia formulario al deseleccionar', () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Nombre');
        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(nameInput, { target: { value: 'Test Name' } });
        fireEvent.change(durationInput, { target: { value: '45' } });

        expect(nameInput.value).toBe('Test Name');
        expect(durationInput.value).toBe('45');
    });

    test('muestra error de validación cuando faltan campos obligatorios', async () => {
        renderComponent();

        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/obligatorio/i)).toBeInTheDocument();
        });
    });

    test('muestra error al intentar enviar sin seleccionar rutina', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Nombre');
        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(nameInput, { target: { value: 'Test Training' } });
        fireEvent.change(durationInput, { target: { value: '60' } });

        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/debes seleccionar una rutina/i)).toBeInTheDocument();
        });
    });
});