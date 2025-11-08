import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import Exercise from "../../modules/app/components/exercise/exercise";
import backend from "../../backend";
import { UserContext } from "../../modules/app/components/common/user-provider.jsx";

jest.mock("../../backend", () => ({
  exerciseService: {
    getSerieByExercise: jest.fn(),
    modifySerie: jest.fn(),
    createSerie: jest.fn(),
    deleteSerie: jest.fn(),
  },
}));

describe("Exercise", () => {
  const exercise = { id: 1, name: "Press banca" };
  const routineId = 10;

  beforeEach(() => {
    backend.exerciseService.getSerieByExercise.mockImplementation(
      (exerciseId, routineId, onSuccess) => {
        onSuccess({
          items: [
            { id: 5, numeroSerie: 1, repeticiones: 12, peso: 50, exercise: 1 },
            { id: 6, numeroSerie: 2, repeticiones: 10, peso: 40, exercise: 1 },
          ],
        });
      }
    );
    jest.clearAllMocks();
  });

  it("abre el modal de edición de series al pulsar el botón ✏️", async () => {
    render(
      <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "trainer1" } }}>
        <Exercise ex={exercise} routineId={routineId} routineCreator={"trainer1"} />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /✏️/i }));
    expect(await screen.findByText(/editar series/i)).toBeInTheDocument();
  });

  it("permite modificar repeticiones y peso de una serie", async () => {
    render(
      <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "trainer1" } }}>
        <Exercise ex={exercise} routineId={routineId} routineCreator={"trainer1"} />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /✏️/i }));

    const repsInput = await screen.findByDisplayValue("12");
    fireEvent.change(repsInput, { target: { value: "14" } });
    expect(repsInput.value).toBe("14");

    const pesoInput = screen.getByDisplayValue("50");
    fireEvent.change(pesoInput, { target: { value: "55" } });
    expect(pesoInput.value).toBe("55");
  });

  it("permite añadir una nueva serie", async () => {
    render(
      <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "trainer1" } }}>
        <Exercise ex={exercise} routineId={routineId} routineCreator={"trainer1"} />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /✏️/i }));

    const addButton = await screen.findByRole("button", { name: /añadir serie/i });
    fireEvent.click(addButton);

    const repsInputs = await screen.findAllByDisplayValue(/0/);
    expect(repsInputs.length).toBe(3); 
  });

  it("permite eliminar la última serie", async () => {
    render(
      <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "trainer1" } }}>
        <Exercise ex={exercise} routineId={routineId} routineCreator={"trainer1"} />
      </UserContext.Provider>
    );

    // Abrir modal
    fireEvent.click(screen.getByRole("button", { name: /✏️/i }));

    // Esperamos a que aparezca el botón de eliminar de la última serie
    const deleteButton = await screen.findByTitle(/Eliminar serie/i);

    // Pulsamos el botón para eliminar la última serie
    fireEvent.click(deleteButton);

    // Comprobamos que el input de la serie recién añadida desapareció
    const inputs = await screen.findAllByRole("spinbutton"); 
    expect(inputs.length).toBe(4); 
  });


  it("confirma los cambios de repeticiones y peso al pulsar continuar", async () => {
    render(
      <UserContext.Provider value={{ user: { id: 1, role: "TRAINER", userName: "trainer1" } }}>
        <Exercise ex={exercise} routineId={routineId} routineCreator={"trainer1"} />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /✏️/i }));

    const repsInput = await screen.findByDisplayValue("12");
    fireEvent.change(repsInput, { target: { value: "14" } });

    const pesoInput = screen.getByDisplayValue("50");
    fireEvent.change(pesoInput, { target: { value: "55" } });

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(backend.exerciseService.modifySerie).toHaveBeenCalledWith(
        5, // id de la serie original
        14, // reps modificadas
        55, // peso modificado
        expect.any(Function),
        expect.any(Function)
      );
    });
  });
});
