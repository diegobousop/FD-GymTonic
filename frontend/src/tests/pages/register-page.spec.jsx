import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import RegisterPage from '../../modules/app/pages/register-page';
import { UserContext } from '../../modules/app/components/common/user-provider';
import userService from '../../backend/userService';

import '@testing-library/jest-dom/extend-expect';

jest.mock('../../backend/userService', () => ({
    signUp: jest.fn(),
    getGenders: jest.fn(),
}));

describe('RegisterPage', () => {
    const setUser = jest.fn();
    const mockGenders = ["MALE", "FEMALE", "OTHER"];

    const renderComponent = () =>
        render(
            <UserContext.Provider value={{ setUser }}>
                <Router>
                    <RegisterPage />
                </Router>
            </UserContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        window.location.hash = '#/register';
        
        // Mock getGenders para que devuelva los géneros
        userService.getGenders.mockImplementation((onSuccess) => {
            onSuccess(mockGenders);
        });
    });

    test('renders the form correctly', () => {
        renderComponent();

        expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
        expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
        expect(screen.getByText('Rol')).toBeInTheDocument();
        expect(screen.getByText('Enviar')).toBeInTheDocument();
    });

    test('renders error messages for empty fields', async () => {
        renderComponent();

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(await screen.findByText("El nombre de usuario es obligatorio")).toBeInTheDocument();
        expect(await screen.findByText("La contraseña es obligatoria")).toBeInTheDocument();
        expect(await screen.findByText("El correo electrónico es obligatorio")).toBeInTheDocument();
        expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
        expect(await screen.findByText("Los apellidos son obligatorios")).toBeInTheDocument();
        expect(await screen.findByText("El rol es obligatorio")).toBeInTheDocument();

    });

    test("cambiar a iniciar sesión", () => {
            renderComponent();

            const loginLink = screen.getByText('ACCESO');

            fireEvent.click(loginLink);

            expect(loginLink).toBeInTheDocument();
            expect(window.location.hash).toBe('#/login');
    });

    test("las contraseñas no coinciden", async () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'differentPassword' } });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
    });

    test("contraseña demasiado corta", async () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: '123' } });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(await screen.findByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();
    });

    test("correo electrónico inválido", async () => {
        renderComponent();
        fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'invalidEmail' } });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(await screen.findByText("Introduce un correo electrónico válido")).toBeInTheDocument();

    });

    test("Registro correcto", async () => {
        // Mock del callback de éxito en signUp
        userService.signUp.mockImplementation((user, onSuccess, onError) => {
            // Simular el callback de éxito
            const authenticatedUser = {
                user: {
                    userName: 'testuser',
                    email: 'testuser@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'USER',
                    weight: 70,
                    height: 175,
                    birthDate: '11-01-1990',
                    gender:'FEMALE'
                }
            };
            onSuccess(authenticatedUser);
            return Promise.resolve();
        });

        renderComponent();

        // Rellenar campos obligatorios de cuenta
        fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'testuser@example.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } });
        
        // Rellenar campos obligatorios de datos personales
        fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'User' } });
        fireEvent.change(screen.getByLabelText('Altura (cm)'), { target: { value: '175' } });
        fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '70' } });
        fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-01-11' } });
        
        // Seleccionar género (FEMALE - Femenino)
        const femaleCheckbox = screen.getByLabelText('Femenino');
        fireEvent.click(femaleCheckbox);

        // Seleccionar rol USER
        expect(screen.getByLabelText('USER')).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('USER'));

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        // Verificar que setUser fue llamado
        await waitFor(() => {
            expect(setUser).toHaveBeenCalledWith(expect.objectContaining({
                userName: 'testuser',
                email: 'testuser@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'USER',
                weight: 70,
                height: 175,
                birthDate: '11-01-1990',
                gender:'FEMALE'
            }));
        });
    });

});