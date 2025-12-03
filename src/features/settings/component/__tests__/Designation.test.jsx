import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Designation from "../Designation.jsx";
import { SettingsContext } from "../../context/SettingsContext";
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve()),
  put: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
}));

function renderWithSettings(ui, { contextValue }) {
  return render(
    <SettingsContext.Provider value={contextValue}>{ui}</SettingsContext.Provider>
  );
}

test("Save Designation disabled until required fields are set", () => {
  const ctx = {
    designations: [],
    fetchDesignations: jest.fn(),
    createDesignation: jest.fn(),
    updateDesignation: jest.fn(),
    deleteDesignation: jest.fn(),
  };

  renderWithSettings(<Designation />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save designation/i });
  expect(saveBtn).toBeDisabled();
});

test("Create designation triggers context create call when valid", async () => {
  const ctx = {
    designations: [],
    fetchDesignations: jest.fn(),
    createDesignation: jest.fn(),
    updateDesignation: jest.fn(),
    deleteDesignation: jest.fn(),
  };

  renderWithSettings(<Designation />, { contextValue: ctx });

  const nameInput = screen.getByRole("textbox", { name: /designation/i });
  const descriptionInput = screen.getByRole("textbox", { name: /description/i });
  fireEvent.change(nameInput, { target: { name: "designation", value: "Director" } });
  fireEvent.change(descriptionInput, { target: { name: "description", value: "Department Director" } });

  const saveBtn = screen.getByRole("button", { name: /save designation/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createDesignation).toHaveBeenCalledTimes(1));
  expect(ctx.createDesignation).toHaveBeenCalledWith({ designation: "Director", description: "Department Director" });
});

test("Edit designation opens dialog and triggers update", async () => {
  const ctx = {
    designations: [
      { id: 10, designation: "Supervisor", description: "Team Supervisor" },
    ],
    fetchDesignations: jest.fn(),
    createDesignation: jest.fn(),
    updateDesignation: jest.fn(),
    deleteDesignation: jest.fn(),
  };

  renderWithSettings(<Designation />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updateDesignation).toHaveBeenCalledTimes(1));
  expect(ctx.updateDesignation).toHaveBeenCalledWith(10, { designation: "Supervisor", description: "Team Supervisor" });
});

test("Protected designation disables edit and delete", () => {
  const ctx = {
    designations: [
      { id: 1, designation: "Admin", description: "Protected" },
    ],
    fetchDesignations: jest.fn(),
    createDesignation: jest.fn(),
    updateDesignation: jest.fn(),
    deleteDesignation: jest.fn(),
  };

  renderWithSettings(<Designation />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  expect(editBtn).toBeDisabled();
  expect(deleteBtn).toBeDisabled();
});
