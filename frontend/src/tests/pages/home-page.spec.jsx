import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ViewAllRoutinespage from "../../modules/app/pages/view-all-routines-page";
import HomePage from "../../modules/app/pages/home-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import backend from "../../backend";

jest.mock("../../backend/routineService", () => ({
  viewAllRoutines: jest.fn(),
}));

jest.mock("../../backend", () => ({
  routineService: {
    viewAllRoutines: jest.fn(),
    viewFeed: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

let mockImplementation;

describe("ViewAllRoutinespage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra mensaje si no hay rutinas", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

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
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) =>
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
      })
    );

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
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) =>
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
      })
    );

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
    });
  });

  it("muestra 'No hay ejercicios' cuando la rutina no tiene ejercicios", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) =>
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
      })
    );

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

  it("navega a la página de detalles al hacer click en el boton", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) =>
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
      })
    );

    render(
      <MemoryRouter initialEntries={["/routines"]}>
        <UserContext.Provider value={{ user: { id: 1, role: "TRAINER" } }}>
          <ViewAllRoutinespage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: /ver detalles de rutina/i });
    userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/routines/5");
  });
});

describe("HomePage - Feed tab", () => {
  const user = { id: 1, role: "USER" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carga el feed al cambiar de pestaña y muestra actividades", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    const mockFeedItems = [
      {
        id: 101,
        name: "Training Feed 1",
        description: "Desc feed",
        duration: 50,
        exercises: [{ id: 1 }, { id: 2 }],
        creatorId: 5,
        creatorUserName: "trainer5",
        creatorAvatarBase64: null,
        routineId: 20,
        creationDate: "2025-12-10T12:00:00",
      },
    ];

    backend.routineService.viewFeed.mockImplementation((page, size, onSuccess) => {
      onSuccess({ items: mockFeedItems, existMoreItems: false });
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user }}>
          <HomePage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Todavía no hay rutinas disponibles/i)).toBeInTheDocument();
    });

    const feedButton = screen.getByRole("button", { name: /Siguiendo/i });
    userEvent.click(feedButton);

    expect(backend.routineService.viewFeed).toHaveBeenCalledWith(
      0,
      4,
      expect.any(Function),
      expect.any(Function)
    );

    await waitFor(() => {
      expect(screen.getByText(/Training Feed 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Desc feed/i)).toBeInTheDocument();
      expect(screen.getByText(/50 min · 2 ejercicios/i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje si no hay actividades en el feed", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    backend.routineService.viewFeed.mockImplementation((page, size, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user }}>
          <HomePage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    const feedButton = screen.getByRole("button", { name: /Siguiendo/i });
    userEvent.click(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/No hay actividades de tus seguidos/i)).toBeInTheDocument();
    });
  });

  it("muestra error si falla la carga del feed", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    backend.routineService.viewFeed.mockImplementation((page, size, onSuccess, onError) => {
      onError("Error en feed");
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user }}>
          <HomePage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    const feedButton = screen.getByRole("button", { name: /Siguiendo/i });
    userEvent.click(feedButton);

    await waitFor(() => {
      expect(screen.getByText(/Error en feed/i)).toBeInTheDocument();
    });
  });
});
