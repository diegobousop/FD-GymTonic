import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react";
import { MemoryRouter } from "react-router-dom";
import ViewAllUsers from "../../modules/app/pages/viewAllUsers-page";
import { UserContext } from "../../modules/app/components/common/user-provider";

jest.mock("../../backend/userService", () => ({
  viewAllUsers: (params, onSuccess, onError) => {
    console.log("✅ mock searchRoutines llamado con:", { params });
    mockImplementation(params, onSuccess, onError);
  },
}));

let mockImplementation;

describe("ViewUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra un usuario", async () => {
    mockImplementation = (params, onSuccess) => 
        onSuccess({
            items: [
              {
                id: 1,
                userName: "admin1",
                firstName: "Admin",
                lastName: "User",
                email: "admin1@admin.com",
                role: "ADMIN"
              }
            ], 
            existMoreItems: false,
        });

        render(
          <MemoryRouter>
            <UserContext.Provider value={{ user: { id: 1, role: "ADMIN" } }}>
              <ViewAllUsers/>
            </UserContext.Provider>
          </MemoryRouter>
        );

    await waitFor(() => {
      expect(screen.getByText(/^admin1$/i)).toBeInTheDocument();
      expect(screen.getByText(/User/i)).toBeInTheDocument();
      expect(screen.getByText(/ADMIN/)).toBeInTheDocument();
    });
  });

  it("muestra varios usuarios", async () => {
    mockImplementation = (params, onSuccess) => 
      onSuccess({
        items: [
          {
            id: 1,
            userName: "admin1",
            firstName: "Admin",
            lastName: "User",
            email: "admin1@admin.com",
            role: "ADMIN"
          },
          {
            id: 2,
            userName: "trainer1",
            firstName: "Trainer",
            lastName: "User",
            email: "admin1@admin.com",
            role: "TRAINER"
          },
          {
            id: 1,
            userName: "user1",
            firstName: "User",
            lastName: "User",
            email: "admin1@admin.com",
            role: "USER"
          }
        ],
        existMoreItems: false,
      });

      render(
        <MemoryRouter>
          <UserContext.Provider value={{ user: { id: 1, role: "ADMIN" } }}>
            <ViewAllUsers/>
          </UserContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/^admin1$/i)).toBeInTheDocument();
        expect(screen.getByText(/ADMIN/)).toBeInTheDocument();

        expect(screen.getByText(/^trainer1$/i)).toBeInTheDocument();
        expect(screen.getByText(/Trainer/)).toBeInTheDocument();

        expect(screen.getByText(/^user1$/i)).toBeInTheDocument();
        expect(screen.getByText(/USER/)).toBeInTheDocument();
      });

  });
});
