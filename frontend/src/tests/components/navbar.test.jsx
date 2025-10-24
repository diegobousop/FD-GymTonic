import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../../modules/app/components/common/user-provider.jsx";
import "@testing-library/jest-dom";
import { ToastProvider } from "../../modules/app/components/common/toast-provider.jsx";
import Navbar from "../../modules/app/components/common/navbar.jsx";
import backend from "../../backend";

// Mock del backend completo
jest.mock("../../backend", () => ({
  __esModule: true,
  default: {
    imageService: {
      getImageByName: jest.fn(),
    },
    notificationService: {
      getNotifications: jest.fn(),
      readNotification: jest.fn(),
      unreadNotification: jest.fn(),
    },
  },
}));

describe("Navbar - Notificaciones", () => {
  const mockUser = {
    id: 1,
    userName: "testuser",
    name: "Test",
    surname: "User",
    avatar: {
      avatarBase64: "data:image/png;base64,mockavatar",
    },
  };

  const mockNotifications = {
    items: [
      { id: 1, message: "Nueva notificación 1", read: false },
      { id: 2, message: "Nueva notificación 2", read: false },
      { id: 3, message: "Notificación leída", read: true },
    ],
  };

  beforeEach(() => { 
    // Configurar mocks previo a la ejecución de cada test
    backend.imageService.getImageByName.mockImplementation((name, onSuccess) => {
      onSuccess({ base64: "data:image/png;base64,mocklogo" });
    });

    backend.notificationService.getNotifications.mockImplementation((params, onSuccess) => {
      onSuccess(mockNotifications);
    });

    backend.notificationService.readNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    backend.notificationService.unreadNotification.mockImplementation((id, onSuccess) => {
      onSuccess();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderNavbar = (user = mockUser, activePage = "home") => {
    return render(
      <UserContext.Provider value={{ user }}>
        <MemoryRouter initialEntries={["/home"]}>
          <ToastProvider>
            <Navbar activePage={activePage} />
          </ToastProvider>
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it("muestra el icono de la campana de notificaciones cuando hay un usuario autenticado", async () => {
    renderNavbar();

    // Esperar a que se renderice el botón de notificaciones
    await waitFor(() => {
      const notificationButton = screen.getByLabelText("Notificaciones");
      expect(notificationButton).toBeInTheDocument();
    });

    // Verificar que el icono SVG de la campana está presente
    const bellIcon = screen.getByLabelText("Notificaciones").querySelector("svg");
    expect(bellIcon).toBeInTheDocument();
  });

  it("muestra el contador de notificaciones no leídas", async () => {
    renderNavbar();

    // Esperar a que se carguen las notificaciones
    await waitFor(() => {
      expect(backend.notificationService.getNotifications).toHaveBeenCalled();
    });

    // Verificar que se muestra el contador con 2 notificaciones no leídas
    await waitFor(() => {
      const badge = screen.getByText("2");
      expect(badge).toBeInTheDocument();
    });
  });

  it("abre el panel de notificaciones al hacer clic en la campana", async () => {
    renderNavbar();

    // Esperar a que se renderice el botón
    const notificationButton = await screen.findByLabelText("Notificaciones");

    // Hacer clic en el botón de notificaciones
    fireEvent.click(notificationButton);

    // Verificar que se muestra el panel (buscando el texto de una notificación)
    await waitFor(() => {
      expect(screen.getByText(/Nueva notificación 1/i)).toBeInTheDocument();
    });
  });

  it("no muestra el icono de notificaciones cuando no hay usuario autenticado", () => {
    renderNavbar(null);

    // Verificar que no se muestra el botón de notificaciones
    const notificationButton = screen.queryByLabelText("Notificaciones");
    expect(notificationButton).not.toBeInTheDocument();
  });

  it("marca una notificación como leída al hacer clic en ella", async () => {
    renderNavbar();

    // Abrir el panel de notificaciones
    const notificationButton = await screen.findByLabelText("Notificaciones");
    fireEvent.click(notificationButton);

    // Esperar a que se muestren las notificaciones
    const notification = await screen.findByText(/Nueva notificación 1/i);

    // Hacer clic en el contenedor de la notificación (el div con cursor-pointer)
    const notificationContainer = notification.closest('div[class*="cursor-pointer"]');
    fireEvent.click(notificationContainer);

    // Verificar que se llamó al servicio para marcar como leída
    await waitFor(() => {
      expect(backend.notificationService.readNotification).toHaveBeenCalledWith(
        1,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it("cierra el panel al hacer clic fuera de él", async () => {
    renderNavbar();

    // Abrir el panel
    const notificationButton = await screen.findByLabelText("Notificaciones");
    fireEvent.click(notificationButton);

    // Verificar que el panel está abierto
    await waitFor(() => {
      expect(screen.getByText(/Nueva notificación 1/i)).toBeInTheDocument();
    });

    // Simular clic fuera del panel
    fireEvent.mouseDown(document.body);

    // Verificar que el panel se cierra
    await waitFor(() => {
      expect(screen.queryByText(/Nueva notificación 1/i)).not.toBeInTheDocument();
    });
  });
});