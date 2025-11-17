import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import ValidateExercises from '../../modules/app/pages/validate-exercises-page';
import { UserContext } from '../../modules/app/components/common/user-provider';
import { ToastProvider } from '../../modules/app/components/common/toast-provider';
import '@testing-library/jest-dom/extend-expect';
import exerciseService from '../../backend/exerciseService';



jest.mock('../../backend/routineService', () => ({
    createRoutine: jest.fn(),
}));

jest.mock('../../backend/exerciseService', () => ({
    getValidatedExercises: jest.fn(),
    getUnvalidatedExercises: jest.fn(),
}));


describe('ValidateExercises', () => {
    const setUser = jest.fn();

    const renderComponent = () =>
        render(
            <UserContext.Provider value={{ setUser }}>
                <ToastProvider>
                    <Router>
                        <ValidateExercises />
                    </Router>
                </ToastProvider>
            </UserContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        window.location.hash = '#/routines/create-routine';
    });

    test('renders the form correctly', () => {
        exerciseService.getUnvalidatedExercises.mockImplementation((page, onSuccess, onError) => {
            onSuccess({
                items: [
                    { id: 1, name: "Push Up", descripcion: "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular: "PECHO", ownerAvatar: {avatarBase64:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA",
                         name:"default"}, ownerName: "trainer1" },
                    { id: 2, name: "Squat", descripcion: "A lower body exercise that primarily targets the thighs, hips, and buttocks.", grupoMuscular: "PIERNA", ownerAvatar: {avatarBase64:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA",
                         name:"default"}, ownerName: "trainer2" },
                    { id: 3, name: "Pull Up", descripcion: "An upper body exercise that primarily targets the back and biceps.", grupoMuscular: "ESPALDA", ownerAvatar: {avatarBase64:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA",
                         name:"default"}, ownerName: "trainer3" }
                ],
                existMoreItems: false
            });
        });

        renderComponent();

        expect(screen.getByText('Push Up')).toBeInTheDocument();
        expect(screen.getByText('Squat')).toBeInTheDocument();
        expect(screen.getByText('Pull Up')).toBeInTheDocument();

        expect(screen.getByText('A bodyweight exercise that primarily targets the chest, shoulders, and triceps.')).toBeInTheDocument();
        expect(screen.getByText('A lower body exercise that primarily targets the thighs, hips, and buttocks.')).toBeInTheDocument();
        expect(screen.getByText('An upper body exercise that primarily targets the back and biceps.')).toBeInTheDocument();

        expect(screen.getByText('trainer1')).toBeInTheDocument();
        expect(screen.getByText('trainer2')).toBeInTheDocument();
        expect(screen.getByText('trainer3')).toBeInTheDocument();

        expect(screen.getByText('PECHO')).toBeInTheDocument();
        expect(screen.getByText('PIERNA')).toBeInTheDocument();
        expect(screen.getByText('ESPALDA')).toBeInTheDocument();
        
    });

});