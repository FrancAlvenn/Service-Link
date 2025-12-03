import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ApprovalRuleByDepartment from "../ApprovalRuleByDepartment.jsx";
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

test("Department list uses scrollable container pattern", () => {
  const ctx = {
    approvalRulesByDepartment: [
      { id: 1, department_id: "D-1", position_id: "P-1", required: true, department: { name: "IT" }, position: { position: "Manager" } },
    ],
    fetchApprovalRulesByDepartment: jest.fn(),
    createApprovalRuleByDepartment: jest.fn(),
    updateApprovalRuleByDepartment: jest.fn(),
    deleteApprovalRuleByDepartment: jest.fn(),
    departments: [],
    fetchDepartments: jest.fn(),
    positions: [],
    fetchPositions: jest.fn(),
  };

  renderWithSettings(<ApprovalRuleByDepartment />, { contextValue: ctx });

  const list = screen.getByRole("list", { name: /existing approver rules/i });
  expect(list).toHaveClass("overflow-y-auto");
  expect(list).toHaveClass("max-h-[35vh]");
});

