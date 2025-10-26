import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RoutineDetailsPage from "../../modules/app/pages/routine-details-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import * as routineService from "../../backend/routineService";

jest.mock("../../backend/routineService", () => ({
  findRoutineById: jest.fn(),
  isFollowingRoutine: jest.fn(),
  followRoutine: jest.fn(),
  unfollowRoutine: jest.fn(),
}));

describe("RoutineDetailsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoutine = {
    id: 10,
    name: "Rutina",
    duration: 45,
    exercises: [
      { name: "Press banca", grupoMuscular: "PECHO", descripcion: "Ejercicio básico para pecho" },
      { name: "Dominadas", grupoMuscular: "ESPALDA", descripcion: "Ejercicio básico para espalda" },
    ],
    creator: "trainer1",
  };

  it("muestra los detalles de una rutina y permite seguir y dejar de seguir (usuario no sigue)", async () => {
    routineService.findRoutineById.mockImplementation((id, onSuccess) => onSuccess(mockRoutine));
    routineService.isFollowingRoutine.mockImplementation((id, onSuccess) => onSuccess(false));

    render(
      <MemoryRouter initialEntries={["/routines/10"]}>
        <UserContext.Provider value={{ user: { id: 1, role: "USER" } }}>
          <RoutineDetailsPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Ver detalles de la rutina
    expect(await screen.findByRole("heading", { name: /Rutina/i })).toBeInTheDocument();
    expect(screen.getByText(/45 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Press banca/i)).toBeInTheDocument();
    expect(screen.getByText(/Dominadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Creada por: trainer1/i)).toBeInTheDocument();

    // Botón de seguir inicialmente
    const followButton = screen.getByRole("button", { name: /Seguir rutina/i });
    expect(followButton).toBeInTheDocument();

    // Hacer clic para seguir
    routineService.followRoutine.mockImplementation((id, onSuccess) => onSuccess());
    await userEvent.click(followButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Dejar de seguir/i })).toBeInTheDocument();
    });

    // Hacer clic para dejar de seguir
    routineService.unfollowRoutine.mockImplementation((id, onSuccess) => onSuccess());
    await userEvent.click(screen.getByRole("button", { name: /Dejar de seguir/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Seguir rutina/i })).toBeInTheDocument();
    });
  });

  it("muestra los detalles de una rutina con usuario que ya sigue la rutina", async () => {
    routineService.findRoutineById.mockImplementation((id, onSuccess) => onSuccess(mockRoutine));
    routineService.isFollowingRoutine.mockImplementation((id, onSuccess) => onSuccess(true));

    render(
      <MemoryRouter initialEntries={["/routines/10"]}>
        <UserContext.Provider value={{ user: { id: 1, role: "USER" } }}>
          <RoutineDetailsPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Botón debe mostrar "Dejar de seguir"
    expect(await screen.findByRole("button", { name: /Dejar de seguir/i })).toBeInTheDocument();

    // Hacer clic para dejar de seguir
    routineService.unfollowRoutine.mockImplementation((id, onSuccess) => onSuccess());
    await userEvent.click(screen.getByRole("button", { name: /Dejar de seguir/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Seguir rutina/i })).toBeInTheDocument();
    });
  });
});
