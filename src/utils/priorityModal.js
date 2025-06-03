import { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import AuthContext from "../features/authentication/context/AuthContext";
import ToastNotification from "./ToastNotification";
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../features/request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../features/request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../features/request_management/context/VenueRequestsContext";

function PriorityModal({ input, referenceNumber, requestType }) {
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [currentPriority, setCurrentPriority] = useState(input);

  const { user } = useContext(AuthContext);

  const { fetchJobRequests, fetchArchivedJobRequests } =
    useContext(JobRequestsContext);
  const { fetchPurchasingRequests, fetchArchivedPurchasingRequests } =
    useContext(PurchasingRequestsContext);
  const { fetchVehicleRequests, fetchArchivedVehicleRequests } = useContext(
    VehicleRequestsContext
  );
  const { fetchVenueRequests, fetchArchivedVenueRequests } =
    useContext(VenueRequestsContext);

  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
    fetchArchivedJobRequests();
    fetchArchivedPurchasingRequests();
    fetchArchivedVehicleRequests();
    fetchArchivedVenueRequests();
  };

  // Fetch priority options from backend
  useEffect(() => {
    const getPriority = async () => {
      try {
        const response = await axios.get("/settings/priority", {
          withCredentials: true,
        });

        if (Array.isArray(response.data.priority)) {
          setPriorityOptions(response.data.priority);
        } else {
          console.error("Invalid response: 'priority' is not an array");
        }
      } catch (error) {
        console.error("Error fetching priority options:", error);
      }
    };

    getPriority();
  }, []);

  // Update priority when `input` prop changes
  useEffect(() => {
    setCurrentPriority(input);
  }, [input]);

  // Handle priority selection
  const handlePriorityClick = (priority) => {
    setCurrentPriority(priority);
    confirmPriorityChange(priority);
  };

  // Confirm priority change
  const confirmPriorityChange = async (selectedPriority) => {
    try {
      // Update the request priority
      const response = await axios({
        method: "put",
        url: `/${requestType}/${referenceNumber}`,
        data: {
          requester: user.reference_number,
          priority: selectedPriority,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        ToastNotification.success("Success!", response.data.message);
        fetchAllRequests();

        setCurrentPriority(selectedPriority);
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update priority.");
      console.error("Priority update failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentPriority || "Select Priority"}
            className="text-center w-fit cursor-pointer ml-auto px-4 py-2"
            color={
              priorityOptions.find(
                (option) => option.priority === currentPriority
              )?.color || "gray"
            }
          />
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none w-fit">
          {priorityOptions.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    className="flex justify-between items-center px-4 py-2 text-xs cursor-pointer"
                    onClick={() => handlePriorityClick(option.priority)} // Directly update on click
                  >
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={option.priority}
                      className="text-center w-fit px-4 py-2"
                      color={option.color} // Apply the color directly
                    />
                  </MenuItem>
                ))}
              </div>

              <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100">
                <Typography
                  color="blue-gray"
                  className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer"
                >
                  <PlusCircle size={18} className="cursor-pointer" />
                  Add new priority
                </Typography>
              </div>
            </div>
          ) : (
            <MenuItem className="flex items-center justify-center text-xs text-gray-500">
              Loading priority options...
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
}

export default PriorityModal;
