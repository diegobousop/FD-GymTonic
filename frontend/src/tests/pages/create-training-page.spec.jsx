import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import CreateTraining from '../../modules/app/pages/create-training-page';

import { UserContext } from '../../modules/app/components/common/user-provider';
import { ToastProvider } from '../../modules/app/components/common/toast-provider';

import '@testing-library/jest-dom/extend-expect';

import routineService, { viewAllRoutines } from '../../backend/routineService';

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
        window.location.hash = '#/training/create';
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renders the form correctly', () => {
        renderComponent();

        expect(screen.getByText('Nombre')).toBeInTheDocument();

    });

    test('validates required fields on submit', async () => {
        renderComponent();

        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
        });
    });

    test('validates name length', async () => {
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

    test('validates duration is positive number', async () => {
        renderComponent();

        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(durationInput, { target: { value: '-5' } });
        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('La duración debe ser un número positivo')).toBeInTheDocument();
        });
    });

    test('validates duration maximum value', async () => {
        renderComponent();

        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(durationInput, { target: { value: '1001' } });
        const submitButton = screen.getByText('Crear');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('La duración no puede exceder 1000 minutos')).toBeInTheDocument();
        });
    });

    test('clears form on deselect', () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Nombre');
        const durationInput = screen.getByLabelText('Duración');
        
        fireEvent.change(nameInput, { target: { value: 'Test Name' } });
        fireEvent.change(durationInput, { target: { value: '45' } });

        expect(nameInput.value).toBe('Test Name');
        expect(durationInput.value).toBe('45');
    });
});