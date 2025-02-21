import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Menu, MenuHandler, MenuList, MenuItem, Typography, Chip } from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";
import ToastNotification from "./ToastNotification";
import AuthContext from "../features/authentication/context/AuthContext";

function ApprovalStatusModal({ input, referenceNumber, requestType, approvingPosition, onStatusUpdate }) {
  const { user } = useContext(AuthContext);
  const { fetchJobRequests } = useContext(JobRequestsContext);

  // Predefined approval status options
  const statusOptions = [
    { id: 1, status: "Approved", color: "green" },
    { id: 2, status: "Rejected", color: "red" },
    { id: 3, status: "Pending", color: "amber" }
  ];

  const [currentStatus, setCurrentStatus] = useState(input);

  // Sync status when `input` prop changes
  useEffect(() => {
    setCurrentStatus(input);
  }, [input]);

  // Handle status update
  const handleStatusChange = async (status) => {
    setCurrentStatus(status);

    try {
      const response = await axios.patch(
        `/${requestType}/${referenceNumber}/${approvingPosition}/${status}`,
        { requester: user.reference_number },
        { withCredentials: true }
      );

      if (response.status === 200) {
        fetchJobRequests();
        ToastNotification.success("Success!", response.data.message);

        // Notify parent component if needed
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
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-2 ring-black/5 border-none">
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <MenuItem
                  key={option.id}
                  className="flex justify-between items-center px-4 py-2 text-xs"
                  onClick={() => handleStatusChange(option.status)}
                >
                  <Chip size="sm" variant="ghost" value={option.status} color={option.color}>
                    {option.status}
                  </Chip>
                </MenuItem>
              ))}
            </div>
            <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100">
              <Typography color="blue-gray" className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer">
                <PlusCircle size={18} className="cursor-pointer" />
                Add new status
              </Typography>
            </div>
          </div>
        </MenuList>
      </Menu>
    </div>
  );
}

export default ApprovalStatusModal;
