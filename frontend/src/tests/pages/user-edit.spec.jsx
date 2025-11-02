
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
        cardNumber: "1234567890123456",
        role: "TRAINER",
        avatar: {
            name: "default"
        }
    };

    const renderWithContext = (user = mockUser, setUserFn = jest.fn(), refreshUserFn = jest.fn()) => {
        return render(
            <UserContext.Provider value={{ user, setUser: setUserFn, refreshUser: refreshUserFn }}>
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
        expect(screen.getByLabelText('Tarjeta de crédito')).toBeInTheDocument();

        expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.cardNumber)).toBeInTheDocument();
    });

    it("actualiza el perfil correctamente y muestra mensaje de éxito", async () => {
        const setUser = jest.fn();
        const refreshUser = jest.fn();
        updateProfile.mockImplementation((updatedUser, onSuccess) => {
            onSuccess({});
        });

        renderWithContext(mockUser, setUser, refreshUser);

        const emailInput = screen.getByDisplayValue(mockUser.email);

        expect(emailInput).toBeInTheDocument();

        fireEvent.change(emailInput, {
            target: { value: "new@example.com" },
        });

        const saveButton = screen.getByText('Guardar cambios');

        expect(saveButton).toBeInTheDocument();

        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument();
        });

        expect(updateProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "new@example.com",
                firstName: mockUser.firstName,
                lastName: mockUser.lastName
            }),
            expect.any(Function),
            expect.any(Function)
        );
    });

     it("muestra mensaje de error si updateProfile falla", async () => {
        const refreshUser = jest.fn();

        updateProfile.mockImplementation((updatedUser, onSuccess, onError) => {
            onError("error");
        });

        renderWithContext(mockUser, jest.fn(), refreshUser);

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Error al actualizar el perfil')).toBeInTheDocument();
        });
    }); 
 
});
