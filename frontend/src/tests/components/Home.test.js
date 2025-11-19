import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../modules/app/components/Home";
import { config } from "../../config/constants";

jest.mock("../../modules/app/components/common/navbar", () => () => (
  <div data-testid="navbar">Navbar</div>
));

describe("Home", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve("Hola desde el backend"),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("renderiza la barra de navegación", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("obtiene mensaje de bienvenida al montar", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.BASE_PATH}/hello`
      );
    });
  });
});
