import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import ViewAllRoutinespage from "../../modules/app/pages/viewAllRoutines-page";
import { UserContext } from "../../modules/app/components/common/user-provider";

jest.mock("../../backend/routineService", () => ({
  viewAllRoutines: (onSuccess, onError) => {
    mockImplementation(onSuccess, onError);
  },
}));

let mockImplementation;

describe("ViewRoutines", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra mensaje si no hay rutinas", async () => {
    mockImplementation = (onSuccess) => onSuccess([]); 

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Todavía no hay rutinas disponibles/i)).not.toBeNull();

    });
  });

  it("muestra rutinas si existen", async () => {
    mockImplementation = (onSuccess) =>
      onSuccess([
      {
        id: 1,
        name: "Rutina de fuerza",
        duration: 40,
        exercises: [
          { name: "Push Up", grupoMuscular: "PECHO" },
          { name: "Squat", grupoMuscular: "PIERNA" },
        ],
        creator: {
          id: 2,
          userName: "trainer1",
          firstName: "Trainer",
          lastName: "User",
          email: "trainer1@trainer.com",
          role: "TRAINER",
        },
      },
    ]);

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rutina de fuerza/i)).not.toBeNull();
    });
  });
});
