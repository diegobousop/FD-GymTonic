import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MemoryRouter } from "react-router-dom";
import Comment from "../../../modules/app/components/comments/comment";
import { getProfileById } from "../../../backend/userService";
import { deleteComment } from "../../../backend/commentService";
import { UserContext } from "../../../modules/app/components/common/user-provider";

jest.mock("../../../backend/userService", () => ({
    getProfileById: jest.fn(),
}));

jest.mock("../../../backend/commentService", () => ({
    deleteComment: jest.fn(),
}));

jest.mock("../../../config/constants", () => ({
    svgIcons: {
        RoutineDeleteIcon: () => <svg data-testid="delete-icon" />,
    },
}));

describe("Comment", () => {
    const comment = {
        id: 5,
        userId: 99,
        mensaje: "Mensaje de prueba",
        fecha: "2024-10-10T15:30",
    };

    const trainingId = 20;
    const onDelete = jest.fn();

    const mockProfile = {
        userName: "Marcos",
        avatar: { avatarBase64: "data:image/png;base64,AAA" },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithUser = (user) =>
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ user }}>
                    <Comment comment={comment} trainingId={trainingId} onDelete={onDelete} />
                </UserContext.Provider>
            </MemoryRouter>
        );


    it("muestra texto de carga antes de cargar usuario", () => {
        getProfileById.mockImplementation(() => {});

        renderWithUser({});

        expect(screen.getByText("Cargando usuario...")).toBeInTheDocument();
    });

    it("muestra perfil y comentario correctamente", async () => {
        getProfileById.mockImplementation((id, ok) => ok(mockProfile));

        renderWithUser({});

        await waitFor(() =>
            expect(screen.getByText("Mensaje de prueba")).toBeInTheDocument()
        );

        expect(screen.getByText("Marcos")).toBeInTheDocument();
    });

    it("muestra botón eliminar si user es ADMIN", async () => {
        getProfileById.mockImplementation((id, ok) => ok(mockProfile));

        renderWithUser({ role: "ADMIN" });

        await waitFor(() =>
            expect(screen.getByTestId("delete-icon")).toBeInTheDocument()
        );
    });

    it("no muestra botón eliminar si no es dueño ni admin", async () => {
        getProfileById.mockImplementation((id, ok) => ok(mockProfile));

        renderWithUser({ role: "USER", userName: "otroUsuario" });

        await waitFor(() =>
            expect(screen.queryByTestId("delete-icon")).not.toBeInTheDocument()
        );
    });

    it("llama a deleteComment y onDelete cuando se elimina comentario", async () => {
        getProfileById.mockImplementation((id, ok) => ok(mockProfile));
        deleteComment.mockImplementation((id, tid, ok) => ok());

        renderWithUser({ role: "ADMIN" });

        await waitFor(() => screen.getByTestId("delete-icon"));

        fireEvent.click(screen.getByTestId("delete-icon"));

        expect(deleteComment).toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
