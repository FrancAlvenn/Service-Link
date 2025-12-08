import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AIPrompt from "../AIPrompt.jsx";

describe("AIPrompt request type visibility", () => {
  test("students only see Vehicle and Venue", () => {
    render(
      <MemoryRouter>
        <AIPrompt userRole="student" />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Job/i)).toBeNull();
    expect(screen.queryByText(/Purchasing/i)).toBeNull();
    expect(screen.getAllByText(/Vehicle/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Venue/i).length).toBeGreaterThanOrEqual(1);
  });

  test("non-students see all types", () => {
    render(
      <MemoryRouter>
        <AIPrompt userRole="non_student" />
      </MemoryRouter>
    );
    expect(screen.getByText(/Job/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchasing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Vehicle/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Venue/i).length).toBeGreaterThanOrEqual(1);
  });

  test("handles undefined role gracefully (defaults to non-student)", () => {
    render(
      <MemoryRouter>
        <AIPrompt />
      </MemoryRouter>
    );
    expect(screen.getByText(/Job/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchasing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Vehicle/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Venue/i).length).toBeGreaterThanOrEqual(1);
  });
});
