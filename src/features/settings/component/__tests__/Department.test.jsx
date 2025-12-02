import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Department from "../Department.jsx";
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

test("Save Department disabled until required fields are set", () => {
  const ctx = {
    departments: [],
    fetchDepartments: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
  };

  renderWithSettings(<Department />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save department/i });
  expect(saveBtn).toBeDisabled();
});

test("Create department triggers context create call when valid", async () => {
  const ctx = {
    departments: [],
    fetchDepartments: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
  };

  renderWithSettings(<Department />, { contextValue: ctx });

  const nameInput = screen.getByRole("textbox", { name: /name/i });
  const descriptionInput = screen.getByRole("textbox", { name: /description/i });
  fireEvent.change(nameInput, { target: { name: "name", value: "IT" } });
  fireEvent.change(descriptionInput, { target: { name: "description", value: "Information Technology" } });

  const saveBtn = screen.getByRole("button", { name: /save department/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createDepartment).toHaveBeenCalledTimes(1));
  expect(ctx.createDepartment).toHaveBeenCalledWith({ name: "IT", description: "Information Technology" });
});

test("Edit department opens dialog and triggers update", async () => {
  const ctx = {
    departments: [
      { id: 10, name: "HR", description: "Human Resources" },
    ],
    fetchDepartments: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
  };

  renderWithSettings(<Department />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updateDepartment).toHaveBeenCalledTimes(1));
  expect(ctx.updateDepartment).toHaveBeenCalledWith(10, { name: "HR", description: "Human Resources" });
});

test("Delete department confirms and triggers delete", async () => {
  const ctx = {
    departments: [
      { id: 20, name: "Ops", description: "Operations" },
    ],
    fetchDepartments: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
  };

  renderWithSettings(<Department />, { contextValue: ctx });

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  const confirmBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => expect(ctx.deleteDepartment).toHaveBeenCalledTimes(1));
  expect(ctx.deleteDepartment).toHaveBeenCalledWith(20);
});
