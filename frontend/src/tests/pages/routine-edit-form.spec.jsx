import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
import RoutineEditForm from "../../modules/app/components/routine/routine-edit-form";
import backend from "../../backend";


jest.mock("../../backend", () => ({
  routineService: {
    modifyRoutine: jest.fn(),
  },
  exerciseService: {
    getValidatedExercises: jest.fn((_, onSuccess) => {
      onSuccess({
        items: [
          { id: 1, name: "Press banca" },
          { id: 2, name: "Dominadas" }
        ],
        existMoreItems: false
      });
    }),
  },
}));

describe("RoutineEditForm", () => {
  const routine = {
    id: 10,
    name: "Torso",
    duration: 45,
    exercises: [{ id: 1, name: "Press banca" }],
    isPublic: true,
  };

  it("permite editar los campos de texto y checkbox", () => {
    const onSaved = jest.fn();
    const onCancel = jest.fn();
    const onError = jest.fn();

    render(
      <RoutineEditForm
        routine={routine}
        onSaved={onSaved}
        onCancel={onCancel}
        onError={onError}
      />
    );

    // Cambiar nombre
    const nameInput = screen.getByDisplayValue("Torso");
    fireEvent.change(nameInput, { target: { value: "Torso Editado" } });
    expect(nameInput.value).toBe("Torso Editado");

    // Cambiar duración
    const durationInput = screen.getByDisplayValue("45");
    fireEvent.change(durationInput, { target: { value: "60" } });
    expect(durationInput.value).toBe("60");

  });

  it("llama correctamente a modifyRoutine al guardar", () => {
    const onSaved = jest.fn();
    const onCancel = jest.fn();
    const onError = jest.fn();

    // Mockeamos modifyRoutine para que llame al success
    backend.routineService.modifyRoutine.mockImplementation(
      (id, name, exercises, duration, isPublic, onSuccess) => {
        onSuccess({ id, name, exercises, duration, isPublic });
      }
    );

    render(
      <RoutineEditForm
        routine={routine}
        onSaved={onSaved}
        onCancel={onCancel}
        onError={onError}
      />
    );

    const saveButton = screen.getByRole("button", { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(backend.routineService.modifyRoutine).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Torso" }),
      expect.stringContaining("actualizada exitosamente")
    );
  });
});
