import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Menu, MenuHandler, MenuList, MenuItem, Typography, Chip } from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import AuthContext from "../features/authentication/context/AuthContext";
import ToastNotification from "./ToastNotification";
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";

function StatusModal({ input, referenceNumber, requestType }) {
  const [statusOptions, setStatusOptions] = useState([]); // Initialize as an empty array
  const [currentStatus, setCurrentStatus] = useState(input); // Set initial status from input

  const { user } = useContext(AuthContext);

  const { fetchJobRequests } = useContext(JobRequestsContext);

  // Fetch the available statuses from the backend
  const getStatus = async () => {
    try {
      const response = await axios({
        method: "get",
        url: "/settings/status", // API endpoint for fetching available statuses
        withCredentials: true,    // Keep credentials if necessary
      });

      // Ensure the response is correct and contains a status array
      if (Array.isArray(response.data.status)) {
        setStatusOptions(response.data.status);
        console.log(response.data.status);
      } else {
        console.error("Invalid response: 'status' is not an array");
      }
    } catch (error) {
      console.error("Error fetching status options:", error);
    }
  };

  // Handle status selection change
  const handleStatusChange = async (status) => {
    setCurrentStatus(status);
    // Send the updated status to the server here
    await axios({
      method: "patch",
      url: `/${requestType}/${referenceNumber}/status`,
      data: {
        requester: user.reference_number,
        status: status,
      },
      withCredentials: true
    }).then((res) => {
        if (res.status === 200) {
            fetchJobRequests();
            ToastNotification.success('Success!', res.data.message);
        }
    }).catch((error) => {
        ToastNotification.error('Error!', 'Failed to update status.');
    });
  };

  useEffect(() => {
    getStatus();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentStatus || "Select Status"}
            className="text-center w-fit cursor-pointer"
            color={statusOptions.find(option => option.status.toLowerCase() === currentStatus.toLowerCase())?.color || "gray"} // default to gray if no match
          >
          </Chip>
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
            {statusOptions.length > 0 ? (
                <div className="flex flex-col">
                    <div className="grid grid-cols-2 gap-2"> {/* Use grid layout with two columns */}
                    {statusOptions.map((option) => (
                        <MenuItem
                        key={option.id}
                        className={`flex justify-between items-center px-4 py-2 text-xs`}
                        onClick={() => handleStatusChange(option.status)} // Handle status change
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
                    <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100 ">
                        <Typography
                            color="blue-gray"
                            className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer "
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
