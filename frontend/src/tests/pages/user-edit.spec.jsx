import React from "react";
import UserEdit from "../../modules/app/pages/user-edit";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { getGenders, updateProfile } from "../../backend/userService";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';


jest.mock("../../backend/userService", () => ({
    updateProfile: jest.fn(),
    getGenders: jest.fn(),
}));

describe("UserEdit", () => {
    const mockUser = {
        id: 1,
        userName: "johndoe",
        password: "hashedPassword123",
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        role: "TRAINER",
        avatar: {
            name: "default",
            avatarBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        },
        blocked: false,
        premium: false,
        cardNumber: "1234567890123456",
        height: 180,
        weight: 75,
        gender: "MALE",
        birthDate: "15-05-1990",
        imc: 23.15
    };

    const mockGenders = ["MALE", "FEMALE", "OTHER"];
    
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
        
        // Mock getGenders para que devuelva los géneros
        getGenders.mockImplementation((onSuccess) => {
            onSuccess(mockGenders);
        });
    });

    it("renderiza inputs con valores iniciales del usuario", () => {
        renderWithContext();

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
        expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
        expect(screen.getByLabelText('Tarjeta de crédito')).toBeInTheDocument();
        expect(screen.getByLabelText('Altura(cm)')).toBeInTheDocument();
        expect(screen.getByLabelText('Peso(kg)')).toBeInTheDocument();
        expect(screen.getByLabelText('Fecha de nacimiento')).toBeInTheDocument();

        expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.cardNumber)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.height.toString())).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.weight.toString())).toBeInTheDocument();
        expect(screen.getByDisplayValue("1990-05-15")).toBeInTheDocument();
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
                lastName: mockUser.lastName,
                height: mockUser.height,
                weight: mockUser.weight,
                birthDate: "15-05-1990", // El backend recibe en formato dd-MM-yyyy
                gender: mockUser.gender
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

    it("muestra mensaje de error si falta el email", async () => {
        renderWithContext();
        
        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: '' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El correo electrónico es obligatorio')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si el email no es válido", async () => {
        renderWithContext();
        
        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'emailinvalido' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Introduce un correo electrónico válido')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si falta el nombre", async () => {
        renderWithContext();
        
        const firstNameInput = screen.getByLabelText('Nombre');
        fireEvent.change(firstNameInput, { target: { value: '' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si el nombre contiene números", async () => {
        renderWithContext();
        
        const firstNameInput = screen.getByLabelText('Nombre');
        fireEvent.change(firstNameInput, { target: { value: 'John123' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El nombre no puede contener números')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si faltan los apellidos", async () => {
        renderWithContext();
        
        const lastNameInput = screen.getByLabelText('Apellidos');
        fireEvent.change(lastNameInput, { target: { value: '' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Los apellidos son obligatorios')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si los apellidos contienen números", async () => {
        renderWithContext();
        
        const lastNameInput = screen.getByLabelText('Apellidos');
        fireEvent.change(lastNameInput, { target: { value: 'Doe456' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Los apellidos no pueden contener números')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si falta la altura", async () => {
        renderWithContext();
        
        const heightInput = screen.getByLabelText('Altura(cm)');
        fireEvent.change(heightInput, { target: { value: '' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('La altura es obligatoria')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si la altura es negativa", async () => {
        renderWithContext();
        
        const heightInput = screen.getByLabelText('Altura(cm)');
        fireEvent.change(heightInput, { target: { value: '-10' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('La altura no puede ser negativa')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si falta el peso", async () => {
        renderWithContext();
        
        const weightInput = screen.getByLabelText('Peso(kg)');
        fireEvent.change(weightInput, { target: { value: '' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El peso es obligatorio')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si el peso es negativo", async () => {
        renderWithContext();
        
        const weightInput = screen.getByLabelText('Peso(kg)');
        fireEvent.change(weightInput, { target: { value: '-5' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El peso no puede ser negativo')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si falta la fecha de nacimiento", async () => {
        renderWithContext();
        
        const birthDateInput = screen.getByLabelText('Fecha de nacimiento');
        fireEvent.change(birthDateInput, { target: { value: '' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('La fecha de nacimiento es obligatoria')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si falta el género", async () => {
        renderWithContext();
        
        // Simular que se deselecciona el género (vaciar el estado)
        const genderCheckboxes = screen.getAllByRole('checkbox');
        // Desmarcar el checkbox que está marcado
        const markedCheckbox = genderCheckboxes.find(cb => cb.checked);
        if (markedCheckbox) {
            fireEvent.click(markedCheckbox);
        }

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El género es obligatorio')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si la tarjeta de crédito no tiene 16 dígitos", async () => {
        renderWithContext();
        
        const cardNumberInput = screen.getByLabelText('Tarjeta de crédito');
        fireEvent.change(cardNumberInput, { target: { value: '12345' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El número de tarjeta debe tener 16 dígitos')).toBeInTheDocument();
        });
    });

    it("muestra mensaje de error si la tarjeta de crédito contiene letras", async () => {
        renderWithContext();
        
        const cardNumberInput = screen.getByLabelText('Tarjeta de crédito');
        fireEvent.change(cardNumberInput, { target: { value: '1234567890abcdef' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El número de tarjeta debe contener solo números')).toBeInTheDocument();
        });
    });

    it("muestra múltiples mensajes de error a la vez", async () => {
        renderWithContext();
        
        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: '' } });

        const firstNameInput = screen.getByLabelText('Nombre');
        fireEvent.change(firstNameInput, { target: { value: '' } });

        const heightInput = screen.getByLabelText('Altura(cm)');
        fireEvent.change(heightInput, { target: { value: '-10' } });

        const saveButton = screen.getByText('Guardar cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('El correo electrónico es obligatorio')).toBeInTheDocument();
            expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
            expect(screen.getByText('La altura no puede ser negativa')).toBeInTheDocument();
        });
    });
});
