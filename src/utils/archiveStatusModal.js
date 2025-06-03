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
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";
import ToastNotification from "./ToastNotification";
import AuthContext from "../features/authentication/context/AuthContext";

function ArchiveStatusModal({ input, referenceNumber, requestType }) {
  const { user } = useContext(AuthContext);

  const { fetchJobRequests } = useContext(JobRequestsContext);

  const [statusOptions, setStatusOptions] = useState([
    {
      id: 1,
      value: "Active",
      color: "green",
      status: false,
    },
    {
      id: 2,
      value: "Archived",
      color: "red",
      status: true,
    },
  ]);
  const [currentStatus, setCurrentStatus] = useState(input); // Set initial status from input

  // Handle status selection change
  const handleStatusChange = async (status) => {
    setCurrentStatus(status);

    let convertedStatus = status === true ? "1" : "0";

    await axios({
      method: "delete",
      url: `/${requestType}/${referenceNumber}/archive/${convertedStatus}`,
      data: {
        requester: user.reference_number,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.status === 200) {
          fetchJobRequests();
          ToastNotification.success("Success!", res.data.message);
        }
      })
      .catch((error) => {
        ToastNotification.error("Error!", "Failed to update status.");
      });
  };

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={
              currentStatus === true ? "Archived" : "Active" || "Select Status"
            }
            className="text-center w-fit cursor-pointer px-4 py-2"
            color={
              statusOptions.find((option) => option.status === currentStatus)
                ?.color || "gray"
            } // default to gray if no match
          ></Chip>
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
          {statusOptions.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                {" "}
                {/* Use grid layout with two columns */}
                {statusOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    className={`flex justify-between items-center px-4 py-2 text-xs`}
                    onClick={() => handleStatusChange(option.status)} // Handle status change
                  >
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={option.value}
                      className="text-center w-fit cursor-pointer"
                      color={option.color}
                    >
                      {option.value}
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

export default ArchiveStatusModal;
