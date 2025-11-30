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
      getUnreadCount: jest.fn(),
      getNotifications: jest.fn(),
      readNotification: jest.fn(),
      unreadNotification: jest.fn(),
    },
  },
}));

describe("Navbar - Notifications", () => {
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
      { id: 1, message: "New notification 1", read: false, date: "2024-11-29T10:00:00" },
      { id: 2, message: "New notification 2", read: false, date: "2024-11-29T11:00:00" },
      { id: 3, message: "Read notification", read: true, date: "2024-11-28T09:00:00" },
    ],
  };

  beforeEach(() => { 
    // Set up mocks before executing each test
    backend.imageService.getImageByName.mockImplementation((name, onSuccess) => {
      onSuccess({ base64: "data:image/png;base64,mocklogo" });
    });

    backend.notificationService.getUnreadCount.mockImplementation((onSuccess) => {
      onSuccess(2);
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

    // Wait for the notifications button to render
    await waitFor(() => {
      const notificationButton = screen.getByLabelText("Notificaciones");
      expect(notificationButton).toBeInTheDocument();
    });

    // Verify that the bell SVG icon is present
    const bellIcon = screen.getByLabelText("Notificaciones").querySelector("svg");
    expect(bellIcon).toBeInTheDocument();
  });

  it("muestra el contador de notificaciones no leídas", async () => {
    renderNavbar();

    // Wait for notifications to load
    await waitFor(() => {
      expect(backend.notificationService.getUnreadCount).toHaveBeenCalled();
    });

    // Verify that the counter shows 2 unread notifications
    await waitFor(() => {
      const badge = screen.getByText("2");
      expect(badge).toBeInTheDocument();
    });
  });

  it("abre el panel de notificaciones al hacer clic en la campana", async () => {
    renderNavbar();

    // Wait for the button to render
    const notificationButton = await screen.findByLabelText("Notificaciones");

    // Click on the notifications button
    fireEvent.click(notificationButton);

    // Verify that the panel is displayed (by searching for notification text)
    await waitFor(() => {
      expect(screen.getByText(/New notification 1/i)).toBeInTheDocument();
    });
  });

  it("no muestra el icono de notificaciones cuando no hay usuario autenticado", () => {
    renderNavbar(null);

    // Verify that the notifications button is not displayed
    const notificationButton = screen.queryByLabelText("Notificaciones");
    expect(notificationButton).not.toBeInTheDocument();
  });

  it("marca una notificación como leída al hacer clic en ella", async () => {
    renderNavbar();

    // Open the notifications panel
    const notificationButton = await screen.findByLabelText("Notificaciones");
    fireEvent.click(notificationButton);

    // Wait for notifications to appear
    const notification = await screen.findByRole("button", { name: /New notification 1/i });

    // Click on the notification container (the div with cursor-pointer)
    fireEvent.click(notification);

    // Verify that the service was called to mark as read
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

    // Open the panel
    const notificationButton = await screen.findByLabelText("Notificaciones");
    fireEvent.click(notificationButton);

    // Verify that the panel is open
    await waitFor(() => {
      expect(screen.getByText(/New notification 1/i)).toBeInTheDocument();
    });

    // Simulate clicking outside the panel
    fireEvent.mouseDown(document.body);

    // Verify that the panel closes
    await waitFor(() => {
      expect(screen.queryByText(/New notification 1/i)).not.toBeInTheDocument();
    });
  });
});