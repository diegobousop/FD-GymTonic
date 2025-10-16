import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { searchResults } from "../../backend/searchService.js";
import SearchResultsPage from "../../modules/app/pages/search-results-page.jsx";
import "@testing-library/jest-dom";

jest.mock("../../backend/searchService.js", () => ({
  searchResults: jest.fn(),
}));

describe("SearchResultsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza resultados completos según la query", async () => {
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess({
        users: [{ name: "Alice" }],
        routines: [{ name: "Full Body", exercises: ["Press banca", "Sentadilla"] }],
        exercises: [{ name: "Bicep Curl" }],
      });
    });

    render(
      <MemoryRouter initialEntries={["/search?text=test"]}>
        <Routes>
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Body/i)).toBeInTheDocument();
      expect(screen.getByText(/Bicep Curl/i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje cuando no hay resultados", async () => {
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess({ users: [], routines: [], exercises: [] });
    });

    render(
      <MemoryRouter initialEntries={["/search?text=nada"]}>
        <Routes>
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron resultados/i)).toBeInTheDocument();
    });
  });
});
