import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import MyRoutineFollowersPage from "../../modules/app/pages/my-routine-followers-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import backend from "../../backend";

jest.mock("../../backend", () => ({
  routineService: {
    searchRoutines: jest.fn(),
    getFollowersByRoutine: jest.fn(),
  },
}));

describe("MyRoutineFollowersPage", () => {
  const mockUser = { id: 1, role: "TRAINER" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra mensaje de permiso si no es trainer", () => {
    render(
      <UserContext.Provider value={{ user: { id: 2, role: "STUDENT" } }}>
        <MyRoutineFollowersPage />
      </UserContext.Provider>
    );

    expect(screen.getByText(/No tienes permiso para ver esta página/i)).toBeInTheDocument();
  });

  it("renderiza la lista de rutinas y seguidores", async () => {
    // Mock de rutinas (asíncrono)
    backend.routineService.searchRoutines.mockImplementation((userId, text, options, onSuccess) => {
      setTimeout(() => onSuccess([{ id: 101, name: "Rutina 1" }, { id: 102, name: "Rutina 2" }]), 0);
    });

    // Mock de seguidores (asíncrono)
    backend.routineService.getFollowersByRoutine.mockImplementation((routineId, options, onSuccess) => {
      setTimeout(() => onSuccess([{ id: 1, userName: "user1" }, { id: 2, userName: "user2" }]), 0);
    });

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MyRoutineFollowersPage />
      </UserContext.Provider>
    );

    // Esperar a que se carguen las rutinas
    const rutina1 = await screen.findByText("Rutina 1");
    const rutina2 = await screen.findByText("Rutina 2");
    expect(rutina1).toBeInTheDocument();
    expect(rutina2).toBeInTheDocument();

    // Click en ver seguidores de la primera rutina
    fireEvent.click(screen.getAllByText(/Ver seguidores/i)[0]);

    // Esperar a que aparezcan los seguidores
    const follower1 = await screen.findByText("user1");
    const follower2 = await screen.findByText("user2");
    const header = await screen.findByText(/Seguidores de "Rutina 1"/i);

    expect(header).toBeInTheDocument();
    expect(follower1).toBeInTheDocument();
    expect(follower2).toBeInTheDocument();
  });
});
