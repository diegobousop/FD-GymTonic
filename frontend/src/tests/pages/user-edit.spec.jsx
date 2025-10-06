
import React from "react";
import UserEdit from "../../modules/app/pages/user-edit";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { updateProfile } from "../../backend/userService";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';


jest.mock("../../backend/userService", () => ({
    updateProfile: jest.fn(),
}));

describe("UserEdit", () => {
    const mockUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
    };

    const renderWithContext = (user = mockUser, setUserFn = jest.fn()) => {
        return render(
            <UserContext.Provider value={{ user, setUser: setUserFn }}>
                <UserEdit />
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("renderiza inputs con valores iniciales del usuario", () => {
        renderWithContext();

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
        expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();

        expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
    });

    it("actualiza el perfil correctamente y muestra mensaje de éxito", async () => {
        const setUser = jest.fn();
        updateProfile.mockImplementation((_, onSuccess) => onSuccess({}));

        renderWithContext(mockUser, setUser);

        const emailInput = screen.getByDisplayValue(mockUser.email);

        expect(emailInput).toBeInTheDocument();

        fireEvent.change(emailInput, {
            target: { value: "new@example.com" },
        });

        const saveChanges = screen.getByText('Guardar cambios');

        expect(saveChanges).toBeInTheDocument();

        fireEvent.click(saveChanges);
        
        expect(
            await screen.findByText(/Perfil actualizado correctamente/i)
        ).toBeInTheDocument();

    });

     it("muestra mensaje de error si updateProfile falla", async () => {


        updateProfile.mockImplementation((_, __, onError) => onError("error"));

        renderWithContext();

        fireEvent.click(screen.getByText('Guardar cambios'));

        expect(
            await screen.findByText(/Error al actualizar el perfil/i)
        ).toBeInTheDocument();
    }); 
 
});
