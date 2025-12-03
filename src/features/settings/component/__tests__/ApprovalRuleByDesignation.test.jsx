import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ApprovalRuleByDesignation from "../ApprovalRuleByDesignation.jsx";
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

test("Designation list uses scrollable container pattern", () => {
  const ctx = {
    approvalRulesByDesignation: [
      { id: 1, designation_id: "G-1", position_id: "P-1", required: true, designation: { designation: "Head" }, position: { position: "Manager" } },
    ],
    fetchApprovalRulesByDesignation: jest.fn(),
    createApprovalRuleByDesignation: jest.fn(),
    updateApprovalRuleByDesignation: jest.fn(),
    deleteApprovalRuleByDesignation: jest.fn(),
    positions: [],
    fetchPositions: jest.fn(),
    designations: [],
    fetchDesignations: jest.fn(),
  };

  renderWithSettings(<ApprovalRuleByDesignation />, { contextValue: ctx });

  const list = screen.getByRole("list", { name: /existing approver rules/i });
  expect(list).toHaveClass("overflow-y-auto");
  expect(list).toHaveClass("max-h-[35vh]");
});

