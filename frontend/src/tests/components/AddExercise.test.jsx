import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { UserContext } from '../../modules/app/components/common/user-provider';
import CreateExercise from '../../modules/app/pages/create-exercise-page';

import '@testing-library/jest-dom/extend-expect';
import exerciseService from '../../backend/exerciseService';

jest.mock('../../backend/exerciseService', () => ({
    addExercise: jest.fn(),
}));

describe('AddExercise', () => {
    const setUser = jest.fn();

    const renderComponent = () => 
        render(
            <UserContext.Provider value={{ setUser }}>
                <Router>
                    <CreateExercise />
                </Router>
            </UserContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        window.location.hash = '#/admin/addExercise'
    });

    test('render the form correctly', () => {
        renderComponent();

        expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Descripcion/i)).toBeInTheDocument();
        expect(screen.getByText(/Grupo Muscular/i)).toBeInTheDocument();
        expect(screen.getByText(/Numero series/i)).toBeInTheDocument();
        expect(screen.getByText(/Dificultad/i)).toBeInTheDocument();
        expect(screen.getByText(/Equipamiento/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Grupo Muscular/i));

        expect(screen.getByText('PECHO')).toBeInTheDocument();
        expect(screen.getByText('PIERNA')).toBeInTheDocument();
        expect(screen.getByText('BRAZOS')).toBeInTheDocument();
        
    });

    test('completa los campos de forma correcta', async () => {
        exerciseService.addExercise.mockImplementation((name, descripcion, grupoMuscular, numeroSeries, difficulty, equipment, onSuccess, onError) => {
            onSuccess({
                "id":6
            });

        });
        renderComponent();

        const nameInput = screen.getByLabelText(/Nombre/i);
        const DescripcionInput = screen.getByLabelText(/Descripcion/i);
        const numeroInput=screen.getByLabelText(/Numero series/i);
        const categoriaInput = screen.getByText('Grupo Muscular');
        const difficultyInput = screen.getByText('Dificultad');
        const equipmentInput = screen.getByText('Equipamiento');

        fireEvent.change(nameInput, {
            target: { value: 'ejercicio 1' },
        });
        fireEvent.change(DescripcionInput, {
            target: { value: 'descripcion de prueba' },
        });
        fireEvent.change(numeroInput, {
            target: { value: 1 },
        });

        fireEvent.click(categoriaInput);
        await waitFor(() => expect(screen.getByLabelText('PECHO')).toBeInTheDocument());
        fireEvent.click(screen.getByLabelText('PECHO'));

        fireEvent.click(difficultyInput);
        await waitFor(() => expect(screen.getByLabelText('FACIL')).toBeInTheDocument());
        fireEvent.click(screen.getByLabelText('FACIL'));

        fireEvent.click(equipmentInput);
        await waitFor(() => expect(screen.getByLabelText('MAQUINA')).toBeInTheDocument());
        fireEvent.click(screen.getByLabelText('MAQUINA'));

        fireEvent.submit(screen.getByRole('button', {name: /enviar/i}));

        await waitFor(() =>
            expect(screen.getByText("Ejercicio ejercicio 1 añadido existosamente")).toBeInTheDocument()
        );
    });

})

