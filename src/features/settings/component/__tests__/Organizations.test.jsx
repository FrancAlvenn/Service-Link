import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Organizations from "../Organizations.jsx";
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

test("Save Organization disabled until required fields are set", () => {
  const ctx = {
    organizations: [],
    fetchOrganizations: jest.fn(),
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  };

  renderWithSettings(<Organizations />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save organization/i });
  expect(saveBtn).toBeDisabled();
});

test("Create organization triggers context create call when valid", async () => {
  const ctx = {
    organizations: [],
    fetchOrganizations: jest.fn(),
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  };

  renderWithSettings(<Organizations />, { contextValue: ctx });

  const nameInput = screen.getByRole("textbox", { name: /organization/i });
  const descriptionInput = screen.getByRole("textbox", { name: /description/i });
  fireEvent.change(nameInput, { target: { name: "organization", value: "Acme" } });
  fireEvent.change(descriptionInput, { target: { name: "description", value: "Acme Corp" } });

  const saveBtn = screen.getByRole("button", { name: /save organization/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createOrganization).toHaveBeenCalledTimes(1));
  expect(ctx.createOrganization).toHaveBeenCalledWith({ organization: "Acme", description: "Acme Corp" });
});

test("Edit organization opens dialog and triggers update", async () => {
  const ctx = {
    organizations: [
      { id: 7, organization: "Globex", description: "Globex Inc" },
    ],
    fetchOrganizations: jest.fn(),
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  };

  renderWithSettings(<Organizations />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updateOrganization).toHaveBeenCalledTimes(1));
  expect(ctx.updateOrganization).toHaveBeenCalledWith(7, { organization: "Globex", description: "Globex Inc" });
});

test("Delete organization confirms and triggers delete", async () => {
  const ctx = {
    organizations: [
      { id: 3, organization: "Umbrella", description: "Umbrella Co" },
    ],
    fetchOrganizations: jest.fn(),
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  };

  renderWithSettings(<Organizations />, { contextValue: ctx });

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  const confirmBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => expect(ctx.deleteOrganization).toHaveBeenCalledTimes(1));
  expect(ctx.deleteOrganization).toHaveBeenCalledWith(3);
});
