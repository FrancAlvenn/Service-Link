import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Priority from "../Priority.jsx";
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

test("Save Priority disabled until required fields are set", () => {
  const ctx = {
    priorities: [],
    fetchPriorities: jest.fn(),
    createPriority: jest.fn(),
    updatePriority: jest.fn(),
    deletePriority: jest.fn(),
  };

  renderWithSettings(<Priority />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save priority/i });
  expect(saveBtn).toBeDisabled();
});

test("Create priority triggers context create call when valid", async () => {
  const ctx = {
    priorities: [],
    fetchPriorities: jest.fn(),
    createPriority: jest.fn(),
    updatePriority: jest.fn(),
    deletePriority: jest.fn(),
  };

  renderWithSettings(<Priority />, { contextValue: ctx });

  const priorityInput = screen.getByRole("textbox", { name: /priority/i });
  const descriptionInput = screen.getByRole("textbox", { name: /description/i });
  fireEvent.change(priorityInput, { target: { name: "priority", value: "High" } });
  fireEvent.change(descriptionInput, { target: { name: "description", value: "Urgent tasks" } });

  const colorButton = screen.getByTitle(/select color/i);
  fireEvent.click(colorButton);
  const redItem = await screen.findByText(/red/i);
  fireEvent.click(redItem);

  const saveBtn = screen.getByRole("button", { name: /save priority/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createPriority).toHaveBeenCalledTimes(1));
  expect(ctx.createPriority).toHaveBeenCalledWith({ priority: "High", description: "Urgent tasks", color: "red" });
});

test("Edit priority opens dialog and triggers update", async () => {
  const ctx = {
    priorities: [
      { id: 2, priority: "Medium", description: "Normal tasks", color: "blue" },
    ],
    fetchPriorities: jest.fn(),
    createPriority: jest.fn(),
    updatePriority: jest.fn(),
    deletePriority: jest.fn(),
  };

  renderWithSettings(<Priority />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updatePriority).toHaveBeenCalledTimes(1));
  expect(ctx.updatePriority).toHaveBeenCalledWith(2, { priority: "Medium", description: "Normal tasks", color: "blue" });
});

test("Delete priority confirms and triggers delete", async () => {
  const ctx = {
    priorities: [
      { id: 4, priority: "Low", description: "Backlog", color: "gray" },
    ],
    fetchPriorities: jest.fn(),
    createPriority: jest.fn(),
    updatePriority: jest.fn(),
    deletePriority: jest.fn(),
  };

  renderWithSettings(<Priority />, { contextValue: ctx });

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  const confirmBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => expect(ctx.deletePriority).toHaveBeenCalledTimes(1));
  expect(ctx.deletePriority).toHaveBeenCalledWith(4);
});

test("Priorities list is keyboard navigable", () => {
  const many = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    priority: `P${i + 1}`,
    description: `Desc ${i + 1}`,
    color: "red",
  }));

  const ctx = {
    priorities: many,
    fetchPriorities: jest.fn(),
    createPriority: jest.fn(),
    updatePriority: jest.fn(),
    deletePriority: jest.fn(),
  };

  renderWithSettings(<Priority />, { contextValue: ctx });

  const list = screen.getByRole("list", { name: /existing priorities/i });
  expect(list.getAttribute("tabIndex")).toBe("0");

  fireEvent.keyDown(list, { key: "ArrowDown" });
  const items = screen.getAllByRole("listitem");
  expect(items[0]).toHaveFocus();

  fireEvent.keyDown(list, { key: "ArrowDown" });
  expect(items[1]).toHaveFocus();

  fireEvent.keyDown(list, { key: "ArrowUp" });
  expect(items[0]).toHaveFocus();
});
