import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ViewAllRoutinespage from "../../modules/app/pages/viewAllRoutines-page";
import { UserContext } from "../../modules/app/components/common/user-provider";

jest.mock("../../backend/routineService", () => ({
  viewAllRoutines: (params, onSuccess, onError) => {
    mockImplementation(params, onSuccess, onError);
  },
}));

let mockImplementation;

describe("ViewRoutines", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra mensaje si no hay rutinas", async () => {
    mockImplementation = (params, onSuccess) => onSuccess({ items: [], existMoreItems: false });

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Todavía no hay rutinas disponibles/i)).toBeInTheDocument();
    });
  });

  it("muestra una rutina", async () => {
    mockImplementation = (params, onSuccess) =>
      onSuccess({
        items: [
          {
            id: 1,
            name: "Rutina de fuerza",
            duration: 40,
            exercises: [
              { name: "Push Up", grupoMuscular: "PECHO" },
              { name: "Squat", grupoMuscular: "PIERNA" },
            ],
            creator: "trainer1",
          },
        ],
        existMoreItems: false,
      });

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rutina de fuerza/i)).toBeInTheDocument();
      expect(screen.getByText(/Push Up/i)).toBeInTheDocument();
      expect(screen.getByText(/Squat/i)).toBeInTheDocument();
    });
  });


    it("muestra varias rutinas", async () => {
    mockImplementation = (params, onSuccess) =>
      onSuccess({
        items: [
          {
            id: 1,
            name: "RUTINA 1",
            duration: 40,
            exercises: [
              { name: "EJERCICIO 1", grupoMuscular: "PECHO" },
              { name: "EJERCICIO 2", grupoMuscular: "PIERNA" },
            ],
            creator: "ENTRENADOR",
          },
          {
            id: 2,
            name: "RUTINA 2",
            duration: 50,
            exercises: [
              { name: "EJERCICIO 3", grupoMuscular: "ESPALDA" },
              { name: "EJERCICIO 4", grupoMuscular: "HOMBRO" },
            ],
            creator: "ENTRENADOR",
          },
        ],
        existMoreItems: false,
      });

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/RUTINA 1/i)).toBeInTheDocument();
      expect(screen.getByText(/EJERCICIO 1/i)).toBeInTheDocument();
      expect(screen.getByText(/EJERCICIO 2/i)).toBeInTheDocument();
      expect(screen.getByText(/RUTINA 2/i)).toBeInTheDocument();
      expect(screen.getByText(/EJERCICIO 3/i)).toBeInTheDocument();
      expect(screen.getByText(/EJERCICIO 4/i)).toBeInTheDocument();
      expect(screen.getByText(/PECHO/i)).toBeInTheDocument();
      expect(screen.getByText(/PIERNA/i)).toBeInTheDocument();
      expect(screen.getByText(/ESPALDA/i)).toBeInTheDocument();
      expect(screen.getByText(/HOMBRO/i)).toBeInTheDocument();
    }); 
    });


    it("muestra 'No hay ejercicios' cuando la rutina no tiene ejercicios", async () => {
        mockImplementation = (params, onSuccess) =>
        onSuccess({
            items: [
            {
                id: 3,
                name: "RUTINA VACÍA",
                duration: 30,
                exercises: [],
                creator: "ENTRENADOR",
            },
            ],
            existMoreItems: false,
        });

        render(
        <MemoryRouter>
            <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
            <ViewAllRoutinespage />
            </UserContext.Provider>
        </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/RUTINA VACÍA/i)).toBeInTheDocument();
            expect(screen.getByText(/No hay ejercicios/i)).toBeInTheDocument();
        });
    });

    it("navega a la página de detalles al hacer click en el nombre de una rutina", async () => {
        mockImplementation = (params, onSuccess) =>
        onSuccess({
            items: [
            {
                id: 5,
                name: "RUTINA",
                duration: 60,
                exercises: [],
                creator: "ENTRENADOR",
            },
            ],
            existMoreItems: false,
        });

        render(
        <MemoryRouter initialEntries={["/routines"]}>
            <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
            <ViewAllRoutinespage />
            </UserContext.Provider>
        </MemoryRouter>
        );

        const routineLink = await screen.findByRole("link", { name: /RUTINA/i });
        await userEvent.click(routineLink);

        expect(routineLink).toHaveAttribute("href", "/routines/5");
    });
});
