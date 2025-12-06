import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import CommentForm from "../../../modules/app/components/comments/comment-form";
import { addComment } from "../../../backend/commentService";

jest.mock("../../../backend/commentService", () => ({
    addComment: jest.fn(),
}));

describe("CommentForm", () => {
    const trainingId = 10;
    const onCommentAdded = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renderiza textarea y botón", () => {
        render(<CommentForm trainingId={trainingId} />);

        expect(screen.getByPlaceholderText("Escribe un comentario...")).toBeInTheDocument();
        expect(screen.getByText("Publicar")).toBeInTheDocument();
    });

    it("muestra error si comentario está vacío", () => {
        render(<CommentForm trainingId={trainingId} />);

        fireEvent.click(screen.getByText("Publicar"));
        expect(screen.getByText("El comentario no puede estar vacío")).toBeInTheDocument();
    });

    it("llama addComment con datos correctos", () => {
        render(<CommentForm trainingId={trainingId} onCommentAdded={onCommentAdded} />);

        const textarea = screen.getByPlaceholderText("Escribe un comentario...");
        fireEvent.change(textarea, { target: { value: "Hola!" } });

        fireEvent.click(screen.getByText("Publicar"));

        expect(addComment).toHaveBeenCalled();
        expect(addComment.mock.calls[0][0]).toBe(trainingId);
        expect(addComment.mock.calls[0][1]).toBe("Hola!");
    });

    it("resetea textarea al añadir comentario correctamente", () => {
        addComment.mockImplementation((tid, msg, ok) => ok());

        render(<CommentForm trainingId={trainingId} onCommentAdded={onCommentAdded} />);

        const textarea = screen.getByPlaceholderText("Escribe un comentario...");
        fireEvent.change(textarea, { target: { value: "Test comentario" } });

        fireEvent.click(screen.getByText("Publicar"));

        expect(textarea.value).toBe("");
        expect(onCommentAdded).toHaveBeenCalledTimes(1);
    });

    it("muestra mensaje de error cuando addComment falla", () => {
        addComment.mockImplementation((tid, msg, ok, fail) => fail("Error al enviar"));

        render(<CommentForm trainingId={trainingId} />);

        fireEvent.change(screen.getByPlaceholderText("Escribe un comentario..."), {
            target: { value: "Algo" },
        });

        fireEvent.click(screen.getByText("Publicar"));

        expect(screen.getByText("Error al enviar")).toBeInTheDocument();
    });
});
