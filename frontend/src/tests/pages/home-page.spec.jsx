import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../../modules/app/pages/home-page";
import { UserContext } from "../../modules/app/components/common/user-provider";
import backend from "../../backend";

jest.mock("../../backend", () => ({
  routineService: {
    viewAllRoutines: jest.fn(),
    viewFeed: jest.fn(),
  },
}));

describe("HomePage - Feed tab", () => {
  const user = { id: 1, role: "USER" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carga el feed al cambiar de pestaña y muestra actividades públicas", async () => {
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
        routineIsPublic: true,
        creationDate: "2025-12-10T12:00:00",
      },
    ];

    backend.routineService.viewFeed.mockImplementation((onSuccess, onErrors) => {
      onSuccess({ items: mockFeedItems });
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

    expect(backend.routineService.viewFeed).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));

    await waitFor(() => {
      const titleLink = screen.getByText("Training Feed 1").closest("a");
      expect(titleLink).toHaveAttribute("href", "/routines/20");

      expect(screen.getByText(/Desc feed/i)).toBeInTheDocument();
      expect(screen.getByText(/50 min · 2 ejercicios/i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje si no hay actividades en el feed", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    backend.routineService.viewFeed.mockImplementation((onSuccess, onErrors) => {
      onSuccess({ items: [] });
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

    // Esperar a que el spinner desaparezca y aparezca el mensaje
    await waitFor(() => {
      expect(screen.getByText(/No hay actividades de tus seguidos/i)).toBeInTheDocument();
    });
  });

  it("muestra error si falla la carga del feed", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    backend.routineService.viewFeed.mockImplementation((onSuccess, onErrors) => {
      onErrors("Error en feed");
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

  it("muestra el nombre como texto si la rutina no es pública", async () => {
    backend.routineService.viewAllRoutines.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    const privateFeedItem = {
      id: 102,
      name: "Training Privado",
      description: "Desc privada",
      duration: 30,
      exercises: [],
      creatorId: 6,
      creatorUserName: "trainer6",
      routineId: 21,
      routineIsPublic: false,
      creationDate: "2025-12-11T12:00:00",
    };

    backend.routineService.viewFeed.mockImplementation((onSuccess) => {
      onSuccess({ items: [privateFeedItem] });
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
      const nameElement = screen.getByText("Training Privado");
      expect(nameElement.closest("a")).toBeNull(); // no debería ser link
    });
  });
});
