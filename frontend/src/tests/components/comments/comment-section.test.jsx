import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import CommentSection from "../../../modules/app/components/comments/comment-section";
import { getComments } from "../../../backend/commentService";

jest.mock("../../../backend/commentService", () => ({
    getComments: jest.fn(),
}));

jest.mock("../../../backend/commentService", () => ({
    getComments: jest.fn(),
}));

jest.mock("../../../modules/app/components/comments/comment-form", () => () => (
    <div data-testid="mock-comment-form">FORM</div>
));

jest.mock("../../../modules/app/components/comments/comment", () => ({ comment }) => (
    <div data-testid="mock-comment">{comment.mensaje}</div>
));

describe("CommentSection", () => {
    const trainingId = 77;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("muestra mensaje de carga inicialmente", () => {
        getComments.mockImplementation(() => {});

        render(<CommentSection trainingId={trainingId} />);
        expect(screen.getByText("Cargando comentarios...")).toBeInTheDocument();
    });

    it("muestra formulario y mensaje cuando no hay comentarios", async () => {
        getComments.mockImplementation((id, opts, ok) =>
            ok({ items: [], existMoreItems: false })
        );

        render(<CommentSection trainingId={trainingId} />);

        await waitFor(() =>
            expect(screen.getByTestId("mock-comment-form")).toBeInTheDocument()
        );

        expect(screen.getByText("Sé tú el primero en comentar algo!")).toBeInTheDocument();
    });

    it("renderiza comentarios correctamente", async () => {
        getComments.mockImplementation((id, opts, ok) =>
            ok({
                items: [{ id: 1, mensaje: "Hola!" }],
                existMoreItems: false,
            })
        );

        render(<CommentSection trainingId={trainingId} />);

        await waitFor(() =>
            expect(screen.getByTestId("mock-comment")).toHaveTextContent("Hola!")
        );
    });

    it("muestra error si getComments falla", async () => {
        getComments.mockImplementation((id, opts, ok, fail) =>
            fail("Error inesperado al cargar comentarios")
        );

        render(<CommentSection trainingId={trainingId} />);

        await waitFor(() =>
            expect(screen.getByText("Error inesperado al cargar comentarios")).toBeInTheDocument()
        );
    });

    it("cambia de página correctamente", async () => {
        getComments.mockImplementation((id, opts, ok) => {
            ok({
                items: [{ id: 1, mensaje: `Página ${opts.page}` }],
                existMoreItems: true,
            });
        });

        render(<CommentSection trainingId={trainingId} />);

        await waitFor(() =>
            expect(screen.getByText("Página 0")).toBeInTheDocument()
        );

        const buttons = screen.getAllByRole("button");
        const nextButton = buttons[1]; 

        fireEvent.click(nextButton);

        await waitFor(() =>
            expect(screen.getByText("Página 1")).toBeInTheDocument()
        );
    });
});
