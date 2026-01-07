import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ForVerification from '../ForVerification';
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { AuthContext } from "../../../features/authentication";
import EmployeeContext from "../../../features/employee_management/context/EmployeeContext";
import { SettingsContext } from "../../../features/settings/context/SettingsContext";
import { BrowserRouter } from 'react-router-dom';

// Mock useOutletContext
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useOutletContext: () => ({ searchQuery: "" }),
  useNavigate: () => jest.fn(),
}));

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { status: [] } })),
}));

// Mock Data
const mockJobRequests = [];
const mockUser = { reference_number: "U-1" };

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user: mockUser }}>
        <JobRequestsContext.Provider value={{ jobRequests: mockJobRequests }}>
          <PurchasingRequestsContext.Provider value={{ purchasingRequests: [] }}>
            <VenueRequestsContext.Provider value={{ venueRequests: [] }}>
              <VehicleRequestsContext.Provider value={{ vehicleRequests: [] }}>
                <EmployeeContext.Provider value={{ employees: [], fetchEmployees: jest.fn() }}>
                   <SettingsContext.Provider value={{ approvers: [], fetchApprovers: jest.fn() }}>
                      <ForVerification />
                   </SettingsContext.Provider>
                </EmployeeContext.Provider>
              </VehicleRequestsContext.Provider>
            </VenueRequestsContext.Provider>
          </PurchasingRequestsContext.Provider>
        </JobRequestsContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe("ForVerification Tabs", () => {
  test("renders tabs and switches content", () => {
    renderComponent();

    // Check Tabs Headers
    const verificationTab = screen.getByText(/For Verification/i);
    const historyTab = screen.getByText(/History/i);

    expect(verificationTab).toBeInTheDocument();
    expect(historyTab).toBeInTheDocument();

    // Default should be For Verification (Active)
    expect(verificationTab).toHaveClass("text-blue-600");

    // Click History Tab
    fireEvent.click(historyTab);

    // Now History content should be visible.
    expect(screen.getByText("Request History")).toBeInTheDocument();
  });
});
