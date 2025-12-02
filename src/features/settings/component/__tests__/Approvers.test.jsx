/* eslint-disable testing-library/no-container */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Approvers from "../Approvers.jsx";
import { SettingsContext } from "../../context/SettingsContext";

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { allApprovers: [] } })),
  post: jest.fn(() => Promise.resolve()),
  put: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../../../components/user_picker/UserPicker", () => {
  return {
    __esModule: true,
    default: ({ onSelect }) => (
      <button onClick={() => onSelect({ reference_number: "U-001", first_name: "Test", last_name: "User", email: "test@example.com" })}>Select User</button>
    ),
  };
});

function renderWithSettings(ui, { contextValue }) {
  return render(
    <SettingsContext.Provider value={contextValue}>{ui}</SettingsContext.Provider>
  );
}

test("Save Approver disabled until required fields are set", () => {
  const ctx = {
    approvers: [],
    fetchApprovers: jest.fn(),
    createApprover: jest.fn(),
    updateApprover: jest.fn(),
    deleteApprover: jest.fn(),
    departments: [],
    positions: [],
    fetchDepartments: jest.fn(),
    fetchPositions: jest.fn(),
  };

  renderWithSettings(<Approvers />, { contextValue: ctx });

  const saveBtn = screen.getByRole("button", { name: /save approver/i });
  expect(saveBtn).toBeDisabled();
});

test("Create approver triggers context create call when valid", async () => {
  const ctx = {
    approvers: [],
    fetchApprovers: jest.fn(),
    createApprover: jest.fn(),
    updateApprover: jest.fn(),
    deleteApprover: jest.fn(),
    departments: [{ id: 1, name: "IT" }],
    positions: [{ id: 10, position: "Manager" }],
    fetchDepartments: jest.fn(),
    fetchPositions: jest.fn(),
  };

  const { container } = renderWithSettings(<Approvers />, { contextValue: ctx });

  const resetBtn = screen.getByRole("button", { name: /reset assignment/i });
  expect(resetBtn).toBeInTheDocument();

  const positionSelect = screen.getByRole("combobox", { name: /position/i });
  const departmentSelect = screen.getByRole("combobox", { name: /department/i });
  expect(positionSelect).toBeInTheDocument();
  expect(departmentSelect).toBeInTheDocument();

  fireEvent.change(positionSelect, { target: { name: "position_id", value: "10" } });
  fireEvent.change(departmentSelect, { target: { name: "department_id", value: "1" } });

  const pickUserBtn = screen.getByRole("button", { name: /select user/i });
  fireEvent.click(pickUserBtn);

  expect(screen.getByLabelText(/selected approver/i)).toHaveTextContent(/test user/i);

  const saveBtn = screen.getByRole("button", { name: /save approver/i });
  expect(saveBtn).toBeEnabled();
  fireEvent.click(saveBtn);

  await waitFor(() => expect(ctx.createApprover).toHaveBeenCalledTimes(1));
  expect(ctx.createApprover).toHaveBeenCalledWith({
    reference_number: "U-001",
    name: "Test User",
    email: "test@example.com",
    position_id: "10",
    department_id: "1",
  });
});

test("Shows default no user selected before picking", () => {
  const ctx = {
    approvers: [],
    fetchApprovers: jest.fn(),
    createApprover: jest.fn(),
    updateApprover: jest.fn(),
    deleteApprover: jest.fn(),
    departments: [],
    positions: [],
    fetchDepartments: jest.fn(),
    fetchPositions: jest.fn(),
  };

  renderWithSettings(<Approvers />, { contextValue: ctx });

  expect(screen.getByLabelText(/selected approver/i)).toHaveTextContent(/no user selected/i);
});

test("Edit approver opens dialog and triggers update", async () => {
  const ctx = {
    approvers: [
      {
        id: 99,
        reference_number: "U-002",
        name: "Jane Doe",
        email: "jane@example.com",
        position_id: "10",
        department_id: "1",
        position: { id: 10, position: "Manager" },
        department: { id: 1, name: "IT" },
      },
    ],
    fetchApprovers: jest.fn(),
    createApprover: jest.fn(),
    updateApprover: jest.fn(),
    deleteApprover: jest.fn(),
    departments: [{ id: 1, name: "IT" }],
    positions: [{ id: 10, position: "Manager" }],
    fetchDepartments: jest.fn(),
    fetchPositions: jest.fn(),
  };

  const { container } = renderWithSettings(<Approvers />, { contextValue: ctx });

  const editBtn = screen.getByRole("button", { name: /edit approver assignment/i });
  fireEvent.click(editBtn);

  const saveEditBtn = screen.getByRole("button", { name: /save edits/i });
  expect(saveEditBtn).toBeEnabled();
  fireEvent.click(saveEditBtn);

  await waitFor(() => expect(ctx.updateApprover).toHaveBeenCalledTimes(1));
  expect(ctx.updateApprover).toHaveBeenCalledWith(
    99,
    expect.objectContaining({
      reference_number: "U-002",
      name: "Jane Doe",
      email: "jane@example.com",
      position_id: "10",
      department_id: "1",
    })
  );
});

test("Delete approver confirms and triggers delete", async () => {
  const ctx = {
    approvers: [
      {
        id: 77,
        reference_number: "U-003",
        name: "John Smith",
        email: "john@example.com",
        position_id: "12",
        department_id: "2",
        position: { id: 12, position: "Lead" },
        department: { id: 2, name: "HR" },
      },
    ],
    fetchApprovers: jest.fn(),
    createApprover: jest.fn(),
    updateApprover: jest.fn(),
    deleteApprover: jest.fn(),
    departments: [{ id: 2, name: "HR" }],
    positions: [{ id: 12, position: "Lead" }],
    fetchDepartments: jest.fn(),
    fetchPositions: jest.fn(),
  };

  renderWithSettings(<Approvers />, { contextValue: ctx });

  const deleteBtn = screen.getByRole("button", { name: /delete approver/i });
  fireEvent.click(deleteBtn);

  const confirmBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => expect(ctx.deleteApprover).toHaveBeenCalledTimes(1));
  expect(ctx.deleteApprover).toHaveBeenCalledWith(77);
});
