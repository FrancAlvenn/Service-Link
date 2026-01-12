import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PortalDashboard from '../PortalDashboard';
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
const mockJobRequests = [
  { reference_number: "JR-001", title: "Request 1", created_at: "2023-01-01T10:00:00Z", type: "Job Request", requester: "U-1", status: "Pending" },
  { reference_number: "JR-002", title: "Request 2", created_at: "2023-01-02T10:00:00Z", type: "Job Request", requester: "U-1", status: "Pending" },
];

const mockUser = { reference_number: "U-1", designation_id: 2 };

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
                      <PortalDashboard />
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

describe("PortalDashboard Sorting", () => {
  test("renders requests and sorts them correctly", async () => {
    renderComponent();

    // Default sort is descending (Newest First)
    // Request 2 (Jan 2) should be before Request 1 (Jan 1)
    const items = screen.getAllByText(/Request \d/);
    expect(items[0]).toHaveTextContent("Request 2");
    expect(items[1]).toHaveTextContent("Request 1");

    // Click Sort Button
    const sortButton = screen.getByLabelText(/Sort by date/i);
    fireEvent.click(sortButton);

    // Now Ascending (Oldest First)
    const itemsAfterSort = screen.getAllByText(/Request \d/);
    expect(itemsAfterSort[0]).toHaveTextContent("Request 1");
    expect(itemsAfterSort[1]).toHaveTextContent("Request 2");
  });
});
