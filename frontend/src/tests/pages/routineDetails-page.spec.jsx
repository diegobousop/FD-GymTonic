import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RoutineDetailsPage from "../../modules/app/pages/routine-details-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import { findRoutineById } from "../../backend/routineService";

jest.mock("../../backend/routineService", () => ({
  findRoutineById: (params, onSuccess, onError) => {
    mockImplementation(params, onSuccess, onError);
  },
}));


let mockImplementation;

describe("ViewRoutineDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra los detalles de una rutina", async () => {
    mockImplementation = (id, onSuccess) =>
        onSuccess({
        id: 10,
        name: "Rutina",
        duration: 45,
        exercises: [
            { name: "Press banca", grupoMuscular: "PECHO", descripcion: "Ejercicio basico para pecho" },
            { name: "Dominadas", grupoMuscular: "ESPALDA", descripcion: "Ejercicio basico para espalda"},
        ],
        creator: "trainer1",
        });

    render(
        <MemoryRouter initialEntries={["/routines/10"]}>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
            <RoutineDetailsPage /> 
        </UserContext.Provider>
        </MemoryRouter>
    );

    expect(await screen.findByText(/Rutina/i)).toBeInTheDocument();
    expect(screen.getByText(/45 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Press banca/i)).toBeInTheDocument();
    expect(screen.getByText(/Ejercicio basico para pecho/i)).toBeInTheDocument();
    expect(screen.getByText(/Dominadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Ejercicio basico para espalda/i)).toBeInTheDocument();
    expect(screen.getByText(/Creada por: trainer1/i)).toBeInTheDocument();
    });
});