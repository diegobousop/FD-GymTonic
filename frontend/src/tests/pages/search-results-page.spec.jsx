import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { searchResults } from "../../backend/searchService.js";
import SearchResultsPage from "../../modules/app/pages/search-results-page.jsx";
import { UserContext } from "../../modules/app/components/common/user-provider"; // importa tu UserContext
import "@testing-library/jest-dom";
import { ToastProvider } from "../../modules/app/components/common/toast-provider.jsx";

jest.mock("../../backend/searchService.js", () => ({
  searchResults: jest.fn(),
}));

describe("SearchResultsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithUserContext = (ui, user = { id: 1, name: "Test User" }) => {
    return render(
      <UserContext.Provider value={{ user }}>
        {ui}
      </UserContext.Provider>
    );
  };

  it("renderiza resultados completos según la query", async () => {
    searchResults.mockImplementation((params, onSuccess) => {
      onSuccess({
        users: [{ id: 2, name: "Alice" }],
        routines: [{ id: 1, name: "Full Body", exercises: [{ name: "Press banca" }, { name: "Sentadilla" }] }],
        exercises: [{ id: 1, name: "Bicep Curl" }],
      });
    });

    renderWithUserContext(
      <MemoryRouter initialEntries={["/search?text=test"]}>
        <ToastProvider>
          <Routes>
            <Route path="/search" element={<SearchResultsPage />} />
          </Routes>
        </ToastProvider>
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

    renderWithUserContext(
      <MemoryRouter initialEntries={["/search?text=nada"]}>
        <ToastProvider>
          <Routes>
            <Route path="/search" element={<SearchResultsPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron resultados/i)).toBeInTheDocument();
    });
  });
});
