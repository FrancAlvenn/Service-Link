import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Position from "../Position.jsx";
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

test("Save Position disabled until required fields are set", () => {
  const ctx = {
    positions: [],
    fetchPositions: jest.fn(),
    createPosition: jest.fn(),
    updatePosition: jest.fn(),
    deletePosition: jest.fn(),
  };

  renderWithSettings(<Position />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save position/i });
  expect(saveBtn).toBeDisabled();
});

test("Create position triggers context create call when valid", async () => {
  const ctx = {
    positions: [],
    fetchPositions: jest.fn(),
    createPosition: jest.fn(),
    updatePosition: jest.fn(),
    deletePosition: jest.fn(),
  };

  renderWithSettings(<Position />, { contextValue: ctx });

  const nameInput = screen.getByRole("textbox", { name: /name/i });
  const descriptionInput = screen.getByRole("textbox", { name: /description/i });
  const approvalInput = screen.getByRole("spinbutton", { name: /approval level/i });
  fireEvent.change(nameInput, { target: { name: "position", value: "Manager" } });
  fireEvent.change(descriptionInput, { target: { name: "description", value: "Manages team" } });
  fireEvent.change(approvalInput, { target: { name: "approval_level", value: "2" } });

  const saveBtn = screen.getByRole("button", { name: /save position/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createPosition).toHaveBeenCalledTimes(1));
  expect(ctx.createPosition).toHaveBeenCalledWith({ position: "Manager", description: "Manages team", approval_level: "2" });
});

test("Edit position opens dialog and triggers update", async () => {
  const ctx = {
    positions: [
      { id: 9, position: "Lead", description: "Team Lead", approval_level: "3" },
    ],
    fetchPositions: jest.fn(),
    createPosition: jest.fn(),
    updatePosition: jest.fn(),
    deletePosition: jest.fn(),
  };

  renderWithSettings(<Position />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updatePosition).toHaveBeenCalledTimes(1));
  expect(ctx.updatePosition).toHaveBeenCalledWith(9, { position: "Lead", description: "Team Lead", approval_level: "3" });
});

test("Delete position confirms and triggers delete", async () => {
  const ctx = {
    positions: [
      { id: 12, position: "Clerk", description: "Office Clerk", approval_level: "1" },
    ],
    fetchPositions: jest.fn(),
    createPosition: jest.fn(),
    updatePosition: jest.fn(),
    deletePosition: jest.fn(),
  };

  renderWithSettings(<Position />, { contextValue: ctx });

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  const confirmBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => expect(ctx.deletePosition).toHaveBeenCalledTimes(1));
  expect(ctx.deletePosition).toHaveBeenCalledWith(12);
});
