
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


        expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
    });

    it("actualiza el perfil correctamente y muestra mensaje de éxito", async () => {
        const setUser = jest.fn();
        updateProfile.mockImplementation((_, onSuccess) => onSuccess({}));

        renderWithContext(mockUser, setUser);

        fireEvent.change(screen.getByPlaceholderText(mockUser.email), {
            target: { value: "new@example.com" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Guardar cambios/i }));

        await waitFor(() =>
            expect(
                screen.getByText(/Perfil actualizado correctamente/i)
            ).toBeInTheDocument()
        );

        expect(setUser).toHaveBeenCalledWith(
            expect.objectContaining({ email: "new@example.com" })
        );
        expect(localStorage.getItem("user")).toContain("new@example.com");
    });

    it("muestra mensaje de error si updateProfile falla", async () => {
        updateProfile.mockImplementation((_, __, onError) => onError("error"));

        renderWithContext();

        fireEvent.click(screen.getByRole("button", { name: /Guardar cambios/i }));

        await waitFor(() =>
            expect(
                screen.getByText(/Error al actualizar el perfil/i)
            ).toBeInTheDocument()
        );
    });

});
