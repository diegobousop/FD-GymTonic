import React from "react";
import CreateExercise from "../../modules/app/pages/create-exercise-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { addExercise } from "../../backend/exerciseService";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

jest.mock("../../backend/exerciseService", () => ({
    addExercise: jest.fn(),
}));

describe("CreateExercise", () => {
    const mockPremiumUser = {
        id: 1,
        userName: "premiumuser",
        role: "TRAINER",
        premium: true,
        avatar: { name: "default" }
    };

    const mockNonPremiumUser = {
        id: 2,
        userName: "nonpremiumuser",
        role: "TRAINER",
        premium: false,
        avatar: { name: "default" }
    };

    const mockAdminUser = {
        id: 3,
        userName: "adminuser",
        role: "ADMIN",
        premium: false,
        avatar: { name: "default" }
    };

    const renderWithContext = (user = mockPremiumUser) => {
        return render(
            <UserContext.Provider value={{ user, setUser: jest.fn() }}>
                <CreateExercise />
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Restricción de acceso", () => {
        it("muestra mensaje de acceso denegado para entrenador no premium", () => {
            renderWithContext(mockNonPremiumUser);

            expect(screen.getByText(/Como entrenador, no puedes añadir nuevos ejercicios a menos que seas un entrenador PREMIUM/i)).toBeInTheDocument();
            expect(screen.queryByLabelText('Nombre:')).not.toBeInTheDocument();
        });

        it("permite acceso a entrenador premium", () => {
            renderWithContext(mockPremiumUser);

            expect(screen.queryByText(/Como entrenador, no puedes añadir nuevos ejercicios a menos que seas un entrenador PREMIUM/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText('Nombre:')).toBeInTheDocument();
        });

        it("permite acceso a usuario admin sin premium", () => {
            renderWithContext(mockAdminUser);

            expect(screen.queryByText(/Como entrenador, no puedes añadir nuevos ejercicios a menos que seas un entrenador PREMIUM/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText('Nombre:')).toBeInTheDocument();
        });
    });

    describe("Renderizado del formulario", () => {
        it("renderiza todos los campos del formulario", () => {
            renderWithContext();

            expect(screen.getByLabelText('Nombre:')).toBeInTheDocument();
            expect(screen.getByLabelText('Descripcion:')).toBeInTheDocument();
            expect(screen.getByText('Grupo Muscular')).toBeInTheDocument();
            expect(screen.getByText('Dificultad')).toBeInTheDocument();
            expect(screen.getByText('Equipamiento')).toBeInTheDocument();
            expect(screen.getByLabelText('Numero series:')).toBeInTheDocument();
        });

        it("renderiza todas las opciones de grupo muscular", () => {
            renderWithContext();

            expect(screen.getByText('Pecho')).toBeInTheDocument();
            expect(screen.getByText('Espalda')).toBeInTheDocument();
            expect(screen.getByText('Pierna')).toBeInTheDocument();
            expect(screen.getByText('Hombro')).toBeInTheDocument();
            expect(screen.getByText('Brazo')).toBeInTheDocument();
            expect(screen.getByText('Abdomen')).toBeInTheDocument();
            expect(screen.getByText('Fullbody')).toBeInTheDocument();
        });

        it("renderiza todas las opciones de dificultad", () => {
            renderWithContext();

            const facil = screen.getAllByText('FACIL');
            const intermedio = screen.getAllByText('INTERMEDIO');
            const dificil = screen.getAllByText('DIFICIL');

            expect(facil.length).toBeGreaterThan(0);
            expect(intermedio.length).toBeGreaterThan(0);
            expect(dificil.length).toBeGreaterThan(0);
        });

        it("renderiza todas las opciones de equipamiento", () => {
            renderWithContext();

            expect(screen.getByText('Polea/Cable')).toBeInTheDocument();
            expect(screen.getByText('Máquina')).toBeInTheDocument();
            expect(screen.getByText('Peso Libre')).toBeInTheDocument();
            expect(screen.getByText('Otros')).toBeInTheDocument();
        });
    });

    describe("Validación de campos obligatorios", () => {
        it("muestra error cuando el nombre está vacío", () => {
            renderWithContext();

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(screen.getByText('El nombre del ejercicio es obligatorio')).toBeInTheDocument();
            expect(addExercise).not.toHaveBeenCalled();
        });

        it("muestra error cuando la descripción está vacía", () => {
            renderWithContext();

            const nameInput = screen.getByLabelText('Nombre:');
            fireEvent.change(nameInput, { target: { value: 'Press de banca' } });

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(screen.getByText('La descripcion del ejercicio es obligatoria')).toBeInTheDocument();
            expect(addExercise).not.toHaveBeenCalled();
        });

        it("muestra error cuando no se selecciona grupo muscular", () => {
            renderWithContext();

            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');

            fireEvent.change(nameInput, { target: { value: 'Press de banca' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de pecho' } });

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(screen.getByText('El grupo muscular es obligatorio')).toBeInTheDocument();
            expect(addExercise).not.toHaveBeenCalled();
        });

        it("muestra error cuando no se selecciona dificultad", () => {
            renderWithContext();

            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');

            fireEvent.change(nameInput, { target: { value: 'Press de banca' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de pecho' } });

            // Seleccionar grupo muscular
            const pechoCheckbox = screen.getByText('Pecho').previousSibling;
            fireEvent.click(pechoCheckbox);

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(screen.getByText('La dificultad es obligatoria')).toBeInTheDocument();
            expect(addExercise).not.toHaveBeenCalled();
        });

        it("muestra error cuando no se selecciona equipamiento", () => {
            renderWithContext();

            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');

            fireEvent.change(nameInput, { target: { value: 'Press de banca' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de pecho' } });

            // Seleccionar grupo muscular
            const pechoCheckbox = screen.getByText('Pecho').previousSibling;
            fireEvent.click(pechoCheckbox);

            // Seleccionar dificultad
            const facilCheckboxes = screen.getAllByText('FACIL');
            const facilCheckbox = facilCheckboxes[0].previousSibling;
            fireEvent.click(facilCheckbox);

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(screen.getByText('El equipamiento es obligatorio')).toBeInTheDocument();
            expect(addExercise).not.toHaveBeenCalled();
        });
    });

    describe("Validación de número de series", () => {
        it("muestra error cuando el número de series es menor que 0", () => {
            renderWithContext();

            const seriesInput = screen.getByLabelText('Numero series:');
            fireEvent.change(seriesInput, { target: { value: '-1' } });

            expect(screen.getByText('El número de series debe estar entre 0 y 20')).toBeInTheDocument();
        });

        it("muestra error cuando el número de series es mayor que 20", () => {
            renderWithContext();

            const seriesInput = screen.getByLabelText('Numero series:');
            fireEvent.change(seriesInput, { target: { value: '25' } });

            expect(screen.getByText('El número de series debe estar entre 0 y 20')).toBeInTheDocument();
        });

        it("acepta número de series válido entre 0 y 20", () => {
            renderWithContext();

            const seriesInput = screen.getByLabelText('Numero series:');
            fireEvent.change(seriesInput, { target: { value: '10' } });

            expect(screen.queryByText('El número de series debe estar entre 0 y 20')).not.toBeInTheDocument();
            expect(seriesInput.value).toBe('10');
        });

        it("limpia el error cuando se corrige el número de series", () => {
            renderWithContext();

            const seriesInput = screen.getByLabelText('Numero series:');
            
            // Valor inválido
            fireEvent.change(seriesInput, { target: { value: '25' } });
            expect(screen.getByText('El número de series debe estar entre 0 y 20')).toBeInTheDocument();

            // Valor válido
            fireEvent.change(seriesInput, { target: { value: '10' } });
            expect(screen.queryByText('El número de series debe estar entre 0 y 20')).not.toBeInTheDocument();
        });
    });

    describe("Creación exitosa de ejercicio", () => {
        it("crea ejercicio correctamente con todos los campos válidos", async () => {
            addExercise.mockImplementation((name, desc, muscle, series, diff, equip, onSuccess) => {
                onSuccess(123);
            });

            renderWithContext();

            // Llenar campos
            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');
            const seriesInput = screen.getByLabelText('Numero series:');

            fireEvent.change(nameInput, { target: { value: 'Press de banca' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio para fortalecer el pecho' } });
            fireEvent.change(seriesInput, { target: { value: '10' } });

            // Seleccionar opciones
            const pechoCheckbox = screen.getByText('Pecho').previousSibling;
            fireEvent.click(pechoCheckbox);

            const intermedioCheckboxes = screen.getAllByText('INTERMEDIO');
            const intermedioCheckbox = intermedioCheckboxes[0].previousSibling;
            fireEvent.click(intermedioCheckbox);

            const pesoLibreCheckbox = screen.getByText('Peso Libre').previousSibling;
            fireEvent.click(pesoLibreCheckbox);

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Ejercicio Press de banca añadido existosamente')).toBeInTheDocument();
            });

            expect(addExercise).toHaveBeenCalledWith(
                'Press de banca',
                'Ejercicio para fortalecer el pecho',
                'PECHO',
                10,
                'INTERMEDIO',
                'PESO_LIBRE',
                expect.any(Function),
                expect.any(Function)
            );
        });

        it("limpia los errores de backend después de una creación exitosa", async () => {
            addExercise.mockImplementation((name, desc, muscle, series, diff, equip, onSuccess) => {
                onSuccess(123);
            });

            renderWithContext();

            // Llenar campos mínimos
            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');
            const seriesInput = screen.getByLabelText('Numero series:');

            fireEvent.change(nameInput, { target: { value: 'Sentadilla' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de pierna' } });
            fireEvent.change(seriesInput, { target: { value: '12' } });

            const piernaCheckbox = screen.getByText('Pierna').previousSibling;
            fireEvent.click(piernaCheckbox);

            const facilCheckboxes = screen.getAllByText('FACIL');
            fireEvent.click(facilCheckboxes[0].previousSibling);

            const maquinaCheckbox = screen.getByText('Máquina').previousSibling;
            fireEvent.click(maquinaCheckbox);

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Ejercicio Sentadilla añadido existosamente')).toBeInTheDocument();
            });

            expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
        });
    });

    describe("Manejo de errores del backend", () => {
        it("muestra error cuando el backend falla", async () => {
            addExercise.mockImplementation((name, desc, muscle, series, diff, equip, onSuccess, onError) => {
                onError({ globalError: "Error al crear el ejercicio" });
            });

            renderWithContext();

            // Llenar campos válidos
            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');
            const seriesInput = screen.getByLabelText('Numero series:');

            fireEvent.change(nameInput, { target: { value: 'Press de banca' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de pecho' } });
            fireEvent.change(seriesInput, { target: { value: '10' } });

            const pechoCheckbox = screen.getByText('Pecho').previousSibling;
            fireEvent.click(pechoCheckbox);

            const facilCheckboxes = screen.getAllByText('FACIL');
            fireEvent.click(facilCheckboxes[0].previousSibling);

            const maquinaCheckbox = screen.getByText('Máquina').previousSibling;
            fireEvent.click(maquinaCheckbox);

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Error al crear el ejercicio')).toBeInTheDocument();
            });
        });

        it("no muestra mensaje de éxito cuando hay error del backend", async () => {
            addExercise.mockImplementation((name, desc, muscle, series, diff, equip, onSuccess, onError) => {
                onError({ globalError: "Error del servidor" });
            });

            renderWithContext();

            // Llenar campos válidos
            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');
            const seriesInput = screen.getByLabelText('Numero series:');

            fireEvent.change(nameInput, { target: { value: 'Dominadas' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de espalda' } });
            fireEvent.change(seriesInput, { target: { value: '8' } });

            const espaldaCheckbox = screen.getByText('Espalda').previousSibling;
            fireEvent.click(espaldaCheckbox);

            const dificilCheckboxes = screen.getAllByText('DIFICIL');
            fireEvent.click(dificilCheckboxes[0].previousSibling);

            const poleaCheckbox = screen.getByText('Polea/Cable').previousSibling;
            fireEvent.click(poleaCheckbox);

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Error del servidor')).toBeInTheDocument();
            });

            expect(screen.queryByText(/añadido existosamente/)).not.toBeInTheDocument();
        });
    });

    describe("Validación múltiple", () => {
        it("muestra todos los errores de validación simultáneamente", () => {
            renderWithContext();

            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(screen.getByText('El nombre del ejercicio es obligatorio')).toBeInTheDocument();
            expect(screen.getByText('La descripcion del ejercicio es obligatoria')).toBeInTheDocument();
            expect(screen.getByText('El grupo muscular es obligatorio')).toBeInTheDocument();
            expect(screen.getByText('La dificultad es obligatoria')).toBeInTheDocument();
            expect(screen.getByText('El equipamiento es obligatorio')).toBeInTheDocument();
            expect(addExercise).not.toHaveBeenCalled();
        });

        it("permite enviar cuando todos los errores se corrigen", async () => {
            addExercise.mockImplementation((name, desc, muscle, series, diff, equip, onSuccess) => {
                onSuccess(999);
            });

            renderWithContext();

            // Intentar enviar sin datos
            const submitButton = screen.getByText('Enviar');
            fireEvent.click(submitButton);

            expect(addExercise).not.toHaveBeenCalled();

            // Corregir todos los campos
            const nameInput = screen.getByLabelText('Nombre:');
            const descInput = screen.getByLabelText('Descripcion:');
            const seriesInput = screen.getByLabelText('Numero series:');

            fireEvent.change(nameInput, { target: { value: 'Curl de bíceps' } });
            fireEvent.change(descInput, { target: { value: 'Ejercicio de brazo' } });
            fireEvent.change(seriesInput, { target: { value: '15' } });

            const brazoCheckbox = screen.getByText('Brazo').previousSibling;
            fireEvent.click(brazoCheckbox);

            const facilCheckboxes = screen.getAllByText('FACIL');
            fireEvent.click(facilCheckboxes[0].previousSibling);

            const otrosCheckbox = screen.getByText('Otros').previousSibling;
            fireEvent.click(otrosCheckbox);

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Ejercicio Curl de bíceps añadido existosamente')).toBeInTheDocument();
            });

            expect(addExercise).toHaveBeenCalled();
        });
    });
});
