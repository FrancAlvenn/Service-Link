import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ApprovalRuleByRequestType from "../ApprovalRuleByRequestType.jsx";
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

test("RequestType list uses scrollable container pattern", () => {
  const ctx = {
    approvalRulesByRequestType: [
      { id: 1, request_type: "Leave", position_id: "P-1", required: true, position: { position: "Manager" } },
    ],
    fetchApprovalRulesByRequestType: jest.fn(),
    createApprovalRuleByRequestType: jest.fn(),
    updateApprovalRuleByRequestType: jest.fn(),
    deleteApprovalRuleByRequestType: jest.fn(),
    departments: [],
    fetchDepartments: jest.fn(),
    positions: [],
    fetchPositions: jest.fn(),
  };

  renderWithSettings(<ApprovalRuleByRequestType />, { contextValue: ctx });

  const list = screen.getByRole("list", { name: /existing approver rules/i });
  expect(list).toHaveClass("overflow-y-auto");
  expect(list).toHaveClass("max-h-[35vh]");
});

