import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../../modules/app/components/common/user-provider";
import RoutineDetailsPage from "../../modules/app/pages/routine-details-page";
import * as routineService from "../../backend/routineService";

jest.mock("../../backend/routineService", () => ({
  findRoutineDetails: jest.fn(),
}));

describe("RoutineDetailsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra los detalles de una rutina correctamente", async () => {
    routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      onSuccess({
        id: 10,
        name: "Rutina Torso",
        duration: 60,
        creator: "trainer1",
        isPublic: true,
        exercises: [
          { id: 1, name: "Press banca", grupoMuscular: "Pecho", descripcion: "Ejercicio básico de pecho" },
          { id: 2, name: "Dominadas", grupoMuscular: "Espalda", descripcion: "Ejercicio básico de espalda" },
        ],
        modificationDate: "22/10/2024",
      });
    });

    render(
      <MemoryRouter initialEntries={["/routines/10"]}>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "trainer1" } }}>
          <RoutineDetailsPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Rutina Torso/i)).toBeInTheDocument();
    expect(screen.getByText(/60 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Press banca/i)).toBeInTheDocument();
    expect(screen.getByText(/Ejercicio básico de pecho/i)).toBeInTheDocument();
    expect(screen.getByText(/Dominadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Ejercicio básico de espalda/i)).toBeInTheDocument();
    expect(screen.getByText(/trainer1/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error si la carga de la rutina falla", async () => {
    routineService.findRoutineDetails.mockImplementation((id, onSuccess, onError) => {
      onError("Error al cargar la rutina");
    });

    render(
      <MemoryRouter initialEntries={["/routines/99"]}>
        <UserContext.Provider value={{ user: { id: 2, role: "TRAINER" } }}>
          <RoutineDetailsPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Error al cargar la rutina/i)).toBeInTheDocument();
  });

  it("muestra el indicador de carga mientras se obtienen los datos", async () => {
    let triggerSuccess;
    routineService.findRoutineDetails.mockImplementation((id, onSuccess) => {
      triggerSuccess = () =>
        onSuccess({
          id: 5,
          name: "Piernas",
          duration: 50,
          exercises: [],
          creator: "trainer2",
          modificationDate: "22/10/2024",
        });
    });

    render(
      <MemoryRouter initialEntries={["/routines/5"]}>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <RoutineDetailsPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    triggerSuccess();
    await waitFor(() => expect(screen.getByText(/Piernas/i)).toBeInTheDocument());
  });
});
