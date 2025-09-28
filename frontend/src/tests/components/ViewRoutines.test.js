import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
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
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "Trainer1" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Todavía no hay rutinas disponibles/i)).toBeInTheDocument();
    });
  });

  it("muestra rutinas si existen", async () => {
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
            creator:"Trainer1"
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
});
