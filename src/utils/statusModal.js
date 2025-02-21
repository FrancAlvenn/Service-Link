import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Menu, MenuHandler, MenuList, MenuItem, Typography, Chip } from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import AuthContext from "../features/authentication/context/AuthContext";
import ToastNotification from "./ToastNotification";
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../features/request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../features/request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../features/request_management/context/VenueRequestsContext";

function StatusModal({ input, referenceNumber, requestType, onStatusUpdate }) {
  const [statusOptions, setStatusOptions] = useState([]); 
  const [currentStatus, setCurrentStatus] = useState(input); 

  const { user } = useContext(AuthContext);

  const { fetchJobRequests } = useContext(JobRequestsContext);
  const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { fetchVehicleRequests } = useContext(VehicleRequestsContext);
  const { fetchVenueRequests } = useContext(VenueRequestsContext);

  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  };

  // Fetch status options from backend
  useEffect(() => {
    const getStatus = async () => {
      try {
        const response = await axios.get("/settings/status", { withCredentials: true });

        if (Array.isArray(response.data.status)) {
          setStatusOptions(response.data.status);
        } else {
          console.error("Invalid response: 'status' is not an array");
        }
      } catch (error) {
        console.error("Error fetching status options:", error);
      }
    };

    getStatus();
  }, []);

  // Update status when `input` prop changes
  useEffect(() => {
    setCurrentStatus(input);
  }, [input]);

  // Handle status change
  const handleStatusChange = async (status) => {
    try {
      setCurrentStatus(status);

      const response = await axios.patch(
        `/${requestType}/${referenceNumber}/status`,
        { requester: user.reference_number, status },
        { withCredentials: true }
      );

      if (response.status === 200) {
        ToastNotification.success("Success!", response.data.message);
        fetchAllRequests();

        // Trigger parent update if provided
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update status.");
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentStatus || "Select Status"}
            className="text-center w-fit cursor-pointer"
            color={statusOptions.find(option => option.status === currentStatus)?.color || "gray"}
          />
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
          {statusOptions.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    className="flex justify-between items-center px-4 py-2 text-xs"
                    onClick={() => handleStatusChange(option.status)}
                  >
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={option.status}
                      className="text-center w-fit cursor-pointer"
                      color={option.color}
                    >
                      {option.status}
                    </Chip>
                  </MenuItem>
                ))}
              </div>
              <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100">
                <Typography
                  color="blue-gray"
                  className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer"
                >
                  <PlusCircle size={18} className="cursor-pointer" />
                  Add new status
                </Typography>
              </div>
            </div>
          ) : (
            <MenuItem className="flex items-center justify-center text-xs text-gray-500">
              Loading status options...
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
}

export default StatusModal;
