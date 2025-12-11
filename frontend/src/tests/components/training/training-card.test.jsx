import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import TrainingCard from "../../../modules/app/components/training/training-card";

describe("TrainingCard", () => {
  const baseProps = {
    training: {
      creatorId: 1,
      creatorUserName: "user1",
      creatorAvatarBase64: null,
      creationDate: "2025-12-10T12:00:00",
      name: "Training 1",
      description: "Desc training",
      duration: 45,
      exercises: [{ id: 1 }, { id: 2 }],
      routineId: 10,
    },
  };

  it("muestra correctamente la info del entrenamiento con avatar nulo", () => {
    render(
      <MemoryRouter>
        <TrainingCard {...baseProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("Training 1")).toBeInTheDocument();
    expect(screen.getByText("Desc training")).toBeInTheDocument();
    expect(screen.getByText(/45 min · 2 ejercicios/i)).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument(); // avatar nulo muestra placeholder
  });

  it("muestra la imagen si creatorAvatarBase64 existe", () => {
    const props = {
      ...baseProps,
      training: { ...baseProps.training, creatorAvatarBase64: "data:image/png;base64,abc" },
    };

    render(
      <MemoryRouter>
        <TrainingCard {...props} />
      </MemoryRouter>
    );

    const img = screen.getByAltText("avatar");
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("data:image/png;base64,abc");
  });

  it("muestra el nombre como link si hay rutina asociada", () => {
    render(
      <MemoryRouter>
        <TrainingCard {...baseProps} />
      </MemoryRouter>
    );

    const link = screen.getByText("Training 1");
    expect(link.closest("a")).toHaveAttribute("href", "/routines/10");
  });

  it("muestra el nombre como texto si no hay rutina asociada", () => {
    const props = { ...baseProps, training: { ...baseProps.training, routineId: null } };

    render(
      <MemoryRouter>
        <TrainingCard {...props} />
      </MemoryRouter>
    );

    expect(screen.getByText("Training 1").closest("a")).toBeNull();
  });
});
