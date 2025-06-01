import { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import AuthContext from "../features/authentication/context/AuthContext";
import ToastNotification from "./ToastNotification";
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../features/request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../features/request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../features/request_management/context/VenueRequestsContext";
import { useNavigate } from "react-router-dom";

function StatusModal({ input, referenceNumber, requestType, onStatusUpdate }) {
  const navigate = useNavigate();
  const [statusOptions, setStatusOptions] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(input);
  const [selectedStatus, setSelectedStatus] = useState(null); // Status clicked
  const [actionTaken, setActionTaken] = useState(""); // Action input
  const [openModal, setOpenModal] = useState(false); // Controls popup visibility

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

  // Fetch status options from backend
  useEffect(() => {
    const getStatus = async () => {
      try {
        const response = await axios.get("/settings/status", {
          withCredentials: true,
        });

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

  // Handle status selection
  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setActionTaken(""); // Reset input field
    setOpenModal(true); // Show popup
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!actionTaken.trim()) {
      ToastNotification.error("Error!", "Please provide an action taken.");
      return;
    }

    try {
      setCurrentStatus(selectedStatus);
      setOpenModal(false); // Close popup

      // Update the request status
      const response = await axios({
        method: "patch",
        url: `/${requestType}/${referenceNumber}/status`,
        data: {
          requester: user.reference_number,
          status: selectedStatus,
          action: actionTaken,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        ToastNotification.success("Success!", response.data.message);
        fetchAllRequests();

        if (onStatusUpdate) {
          onStatusUpdate(selectedStatus);
        }

        // Log the request activity
        await axios({
          method: "post",
          url: "/request_activity",
          data: {
            reference_number: referenceNumber,
            visibility: "external",
            type: "status_change",
            action: `Status updated to <i>${selectedStatus}</i>`,
            details: actionTaken,
            performed_by: user.reference_number,
          },
          withCredentials: true,
        });
        // ToastNotification.success("Success!", "Activity logged successfully.");
        getRequestActivity();
      }
    } catch (error) {
      ToastNotification.error(
        "Error!",
        "Failed to update status or log activity."
      );
      console.error("Status update or activity log failed:", error);
    }
  };

  const getRequestActivity = async () => {
    await axios({
      method: "GET",
      url: `/request_activity/${referenceNumber}`,
      withCredentials: true,
    });
  };

  return (
    <div className="flex flex-col gap-2 z-50">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentStatus || "Select Status"}
            className="text-center w-fit cursor-pointer"
            color={
              statusOptions.find((option) => option.status === currentStatus)
                ?.color || "gray"
            }
          />
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none w-fit">
          {statusOptions.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    className="flex justify-between items-center px-4 py-2 text-xs cursor-pointer"
                    onClick={() => handleStatusClick(option.status)}
                  >
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={option.status}
                      className="text-center w-fit"
                      color={option.color}
                    />
                  </MenuItem>
                ))}
              </div>

              <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100">
                <Typography
                  color="blue-gray"
                  className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer"
                  onClick={() => navigate("/workspace/settings")}
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

      {/* Status Confirmation Modal */}
      <Dialog
        open={openModal}
        handler={setOpenModal}
        size="sm"
        className="backdrop:bg-transparent"
      >
        <DialogHeader>Confirm Status Change</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Typography variant="small" className="font-sans">
              You selected <strong>{selectedStatus}</strong>. Please enter the
              action taken before proceeding.
            </Typography>
            <input
              type="text"
              placeholder="Action Taken"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            color="gray"
            onClick={() => setOpenModal(false)}
            className="mr-2 bg-gray-500 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmStatusChange}
            disabled={!actionTaken.trim()}
            className="bg-blue-500 cursor-pointer"
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default StatusModal;
