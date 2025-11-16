import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { ToastProvider } from "../../modules/app/components/common/toast-provider.jsx";

import ViewFollowRequestsPage from "../../modules/app/pages/view-follow-requests-page.jsx";
import * as userService from "../../backend/userService.js";

jest.mock("../../backend/userService.js", () => ({
    getFollowRequests: jest.fn(),
    acceptFollowRequest: jest.fn(),
    rejectFollowRequest: jest.fn(),
}));

describe("ViewFollowRequestsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderPage = () => {
        return render(
            <MemoryRouter>
                <ToastProvider>
                    <ViewFollowRequestsPage />
                </ToastProvider>
            </MemoryRouter>
        );
    };


    it("muestra mensaje de carga mientras carga solicitudes", () => {
        userService.getFollowRequests.mockImplementation(() => {});

        renderPage();

        expect(screen.getByText(/Cargando solicitudes/i)).toBeInTheDocument();
    });


    it("renderiza solicitudes pendientes correctamente", async () => {
        userService.getFollowRequests.mockImplementation((onSuccess) => {
            onSuccess([
                { id: 10, senderUserName: "Alice" },
                { id: 11, senderUserName: "Bob" },
            ]);
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
        });
    });


    it("muestra mensaje cuando no hay solicitudes", async () => {
        userService.getFollowRequests.mockImplementation((onSuccess) => {
            onSuccess([]);
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/No tienes solicitudes pendientes/i)).toBeInTheDocument();
        });
    });


    it("permite aceptar una solicitud", async () => {
        userService.getFollowRequests.mockImplementation((onSuccess) => {
            onSuccess([{ id: 20, senderUserName: "Carlos" }]);
        });

        userService.acceptFollowRequest.mockImplementation((id, onSuccess) => {
            onSuccess(true);
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Carlos")).toBeInTheDocument();
        });

        const btn = screen.getByRole("button", { name: /Aceptar/i });
        fireEvent.click(btn);

        expect(userService.acceptFollowRequest).toHaveBeenCalledWith(
            20,
            expect.any(Function),
            expect.any(Function)
        );

        await waitFor(() => {
            expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
        });
    });


    it("permite rechazar una solicitud", async () => {
        userService.getFollowRequests.mockImplementation((onSuccess) => {
            onSuccess([{ id: 30, senderUserName: "Diego" }]);
        });

        userService.rejectFollowRequest.mockImplementation((id, onSuccess) => {
            onSuccess(true);
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Diego")).toBeInTheDocument();
        });

        const btn = screen.getByRole("button", { name: /Rechazar/i });
        fireEvent.click(btn);

        expect(userService.rejectFollowRequest).toHaveBeenCalledWith(
            30,
            expect.any(Function),
            expect.any(Function)
        );

        await waitFor(() => {
            expect(screen.queryByText("Diego")).not.toBeInTheDocument();
        });
    });


    it("deshabilita botones mientras procesa una solicitud", async () => {
        userService.getFollowRequests.mockImplementation((onSuccess) => {
            onSuccess([{ id: 40, senderUserName: "Eva" }]);
        });

        // nunca llama onSuccess → se queda “procesando”
        userService.acceptFollowRequest.mockImplementation(() => {});

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Eva")).toBeInTheDocument();
        });

        const btn = screen.getByRole("button", { name: /Aceptar/i });
        fireEvent.click(btn);

        expect(btn).toBeDisabled();
    });
});
