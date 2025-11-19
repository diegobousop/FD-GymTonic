import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import LoginPage from '../../modules/app/pages/login-page';
import { UserContext } from '../../modules/app/components/common/user-provider';

import '@testing-library/jest-dom/extend-expect';




jest.mock('../../backend/userService', () => ({
    login: jest.fn(),
}));



describe('LoginPage', () => {
    const setUser = jest.fn();

    const renderComponent = () =>
        render(
            <UserContext.Provider value={{ setUser }}>
                <Router>
                    <LoginPage />
                </Router>
            </UserContext.Provider>
        );

   beforeEach(() => {
        jest.clearAllMocks();
        globalThis.location.hash = '#/login';
    });


    

    test('renderiza el formulario correctamente', () => {
        renderComponent();

        expect(screen.getByText('Bienvenido/a de vuelta!')).toBeInTheDocument();
        expect(screen.getByText('Usuario')).toBeInTheDocument();
        expect(screen.getByText('Contraseña')).toBeInTheDocument();
        expect(screen.getByText('Enviar')).toBeInTheDocument();

    });

    test("muestra error de nombre de usuario vacío", async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText(/contraseña/i);



        fireEvent.change(passwordInput, {
            target: { value: 'password123' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(
        await screen.findByText("El nombre de usuario es obligatorio")
        ).toBeInTheDocument();

        expect(
        screen.queryByText("La contraseña es obligatoria")
        ).not.toBeInTheDocument();

    });

    test("muestra error de nombre de contraseña vacía", async () => {
        renderComponent();

        const usernameInput = screen.getByLabelText(/usuario/i);



        fireEvent.change(usernameInput, {
            target: { value: 'usuario123' },
        });

        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(
        screen.queryByText("El nombre de usuario es obligatorio")
        ).not.toBeInTheDocument();

        expect(
        await screen.findByText("La contraseña es obligatoria")
        ).toBeInTheDocument();
        
    });



    test("muestra 2 errores con ambos campos vacíos", async () => {
        renderComponent();
        fireEvent.submit(screen.getByRole('button', { name: /enviar/i }));

        expect(
        await screen.findByText("El nombre de usuario es obligatorio")
        ).toBeInTheDocument();
        expect(
        screen.getByText("La contraseña es obligatoria")
        ).toBeInTheDocument();
    });

    test("cambiar a registrar usuario", () => {
        renderComponent();

        const registerLink = screen.getByText('REGISTRARSE');

        fireEvent.click(registerLink);

        expect(registerLink).toBeInTheDocument();
        expect(globalThis.location.hash).toBe('#/register');
    });

});
