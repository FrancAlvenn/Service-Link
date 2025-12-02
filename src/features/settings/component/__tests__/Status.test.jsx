import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Status from "../Status.jsx";
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

test("Save Status disabled until required fields are set", () => {
  const ctx = {
    statuses: [],
    fetchStatuses: jest.fn(),
    createStatus: jest.fn(),
    updateStatus: jest.fn(),
    deleteStatus: jest.fn(),
  };

  renderWithSettings(<Status />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save status/i });
  expect(saveBtn).toBeDisabled();
});

test("Create status triggers context create call when valid", async () => {
  const ctx = {
    statuses: [],
    fetchStatuses: jest.fn(),
    createStatus: jest.fn(),
    updateStatus: jest.fn(),
    deleteStatus: jest.fn(),
  };

  renderWithSettings(<Status />, { contextValue: ctx });

  const statusInput = screen.getByRole("textbox", { name: /status/i });
  const descriptionInput = screen.getByRole("textbox", { name: /description/i });
  fireEvent.change(statusInput, { target: { name: "status", value: "Open" } });
  fireEvent.change(descriptionInput, { target: { name: "description", value: "Ticket is open" } });

  const colorButton = screen.getByTitle(/select color/i);
  fireEvent.click(colorButton);
  const blueItem = await screen.findByText(/blue/i);
  fireEvent.click(blueItem);

  const saveBtn = screen.getByRole("button", { name: /save status/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createStatus).toHaveBeenCalledTimes(1));
  expect(ctx.createStatus).toHaveBeenCalledWith({ status: "Open", description: "Ticket is open", color: "blue" });
});

test("Edit status opens dialog and triggers update", async () => {
  const ctx = {
    statuses: [
      { id: 5, status: "Closed", description: "Ticket closed", color: "red" },
    ],
    fetchStatuses: jest.fn(),
    createStatus: jest.fn(),
    updateStatus: jest.fn(),
    deleteStatus: jest.fn(),
  };

  renderWithSettings(<Status />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updateStatus).toHaveBeenCalledTimes(1));
  expect(ctx.updateStatus).toHaveBeenCalledWith(5, { status: "Closed", description: "Ticket closed", color: "red" });
});

test("Delete status confirms and triggers delete", async () => {
  const ctx = {
    statuses: [
      { id: 6, status: "Pending", description: "Awaiting action", color: "yellow" },
    ],
    fetchStatuses: jest.fn(),
    createStatus: jest.fn(),
    updateStatus: jest.fn(),
    deleteStatus: jest.fn(),
  };

  renderWithSettings(<Status />, { contextValue: ctx });

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  const confirmBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => expect(ctx.deleteStatus).toHaveBeenCalledTimes(1));
  expect(ctx.deleteStatus).toHaveBeenCalledWith(6);
});
