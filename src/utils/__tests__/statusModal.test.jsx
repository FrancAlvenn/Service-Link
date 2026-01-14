import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StatusModal from "../statusModal";
import { JobRequestsContext } from "../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../features/request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../../features/request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../features/request_management/context/VenueRequestsContext";
import AuthContext from "../../features/authentication/context/AuthContext";
import axios from "axios";
import ToastNotification from "../../utils/ToastNotification";

jest.mock("axios");
jest.mock("../../utils/ToastNotification", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockStatusOptions = [
  { id: 1, status: "Pending", color: "gray" },
  { id: 2, status: "Approved", color: "blue" },
  { id: 3, status: "Completed", color: "green" },
];

const Providers = ({
  job = [],
  ajob = [],
  purch = [],
  apurch = [],
  veh = [],
  aveh = [],
  venue = [],
  avenue = [],
  children,
}) => (
  <AuthContext.Provider value={{ user: { reference_number: "U-001" } }}>
    <JobRequestsContext.Provider
      value={{
        jobRequests: job,
        archivedJobRequests: ajob,
        fetchJobRequests: jest.fn(),
        fetchArchivedJobRequests: jest.fn(),
      }}
    >
      <PurchasingRequestsContext.Provider
        value={{
          purchasingRequests: purch,
          archivedPurchasingRequests: apurch,
          fetchPurchasingRequests: jest.fn(),
          fetchArchivedPurchasingRequests: jest.fn(),
        }}
      >
        <VehicleRequestsContext.Provider
          value={{
            vehicleRequests: veh,
            archivedVehicleRequests: aveh,
            fetchVehicleRequests: jest.fn(),
            fetchArchivedVehicleRequests: jest.fn(),
          }}
        >
          <VenueRequestsContext.Provider
            value={{
              venueRequests: venue,
              archivedVenueRequests: avenue,
              fetchVenueRequests: jest.fn(),
              fetchArchivedVenueRequests: jest.fn(),
            }}
          >
            {children}
          </VenueRequestsContext.Provider>
        </VehicleRequestsContext.Provider>
      </PurchasingRequestsContext.Provider>
    </JobRequestsContext.Provider>
  </AuthContext.Provider>
);

beforeEach(() => {
  axios.get.mockResolvedValue({
    data: { status: mockStatusOptions },
  });
});

test("blocks completion when required date is in the future (job_request)", async () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  render(
    <Providers job={[{ reference_number: "JR-001", date_required: future }]}>
      <StatusModal
        input="Pending"
        referenceNumber="JR-001"
        requestType="job_request"
        editable
      />
    </Providers>
  );
  const chip = await screen.findByText(/Pending/i);
  fireEvent.click(chip);
  const completedItem = await screen.findByText("Completed");
  const menuItem = completedItem.closest("[role]");
  expect(menuItem).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(completedItem);
  await waitFor(() => expect(ToastNotification.error).toHaveBeenCalled());
  expect(screen.queryByText(/Confirm Status Change/i)).not.toBeInTheDocument();
});

test("allows completion when departure datetime is in the past (vehicle_request)", async () => {
  const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const date_of_trip = pastDate.toISOString().slice(0, 10);
  const time_of_departure = "08:00:00";
  render(
    <Providers veh={[{ reference_number: "VR-001", date_of_trip, time_of_departure }]}>
      <StatusModal
        input="Pending"
        referenceNumber="VR-001"
        requestType="vehicle_request"
        editable
      />
    </Providers>
  );
  const chip = await screen.findByText(/Pending/i);
  fireEvent.click(chip);
  const completedItem = await screen.findByText("Completed");
  const menuItem = completedItem.closest("[role]");
  expect(menuItem).not.toHaveAttribute("aria-disabled");
  fireEvent.click(completedItem);
  await waitFor(() => expect(screen.getByText(/Confirm Status Change/i)).toBeInTheDocument());
});

test("blocks completion when event dates are null (venue_request)", async () => {
  render(
    <Providers venue={[{ reference_number: "SV-001", event_dates: null }]}>
      <StatusModal
        input="Pending"
        referenceNumber="SV-001"
        requestType="venue_request"
        editable
      />
    </Providers>
  );
  const chip = await screen.findByText(/Pending/i);
  fireEvent.click(chip);
  const completedItem = await screen.findByText("Completed");
  const menuItem = completedItem.closest("[role]");
  expect(menuItem).toHaveAttribute("aria-disabled", "true");
});
