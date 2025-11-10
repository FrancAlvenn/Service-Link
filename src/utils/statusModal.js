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
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Reason + Comment state (exactly like MainTab)
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const { user } = useContext(AuthContext);

  const { fetchJobRequests, fetchArchivedJobRequests } = useContext(JobRequestsContext);
  const { fetchPurchasingRequests, fetchArchivedPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { fetchVehicleRequests, fetchArchivedVehicleRequests } = useContext(VehicleRequestsContext);
  const { fetchVenueRequests, fetchArchivedVenueRequests } = useContext(VenueRequestsContext);

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

  // Fetch status options
  useEffect(() => {
    const getStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/settings/status`, {
          withCredentials: true,
        });

        if (Array.isArray(response.data.status)) {
          setStatusOptions(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching status options:", error);
      }
    };

    getStatus();
  }, []);

  useEffect(() => {
    setCurrentStatus(input);
  }, [input]);

  // Predefined reasons (mirroring MainTab pattern)
  const positiveReasons = [
    { id: 1, value: "Completed successfully" },
    { id: 2, value: "Requirements fully met" },
    { id: 3, value: "Approved and finalized" },
    { id: 4, value: "Delivered as expected" },
    { id: 5, value: "Verified and confirmed" },
    { id: 6, value: "Processed without issues" },
    { id: 7, value: "Other" },
  ];

  const negativeReasons = [
    { id: 1, value: "Incomplete or pending" },
    { id: 2, value: "Missing requirements" },
    { id: 3, value: "Rejected or denied" },
    { id: 4, value: "Cancelled by requester" },
    { id: 5, value: "Resource unavailable" },
    { id: 6, value: "Failed verification" },
    { id: 7, value: "Other" },
  ];

  const isPositiveStatus = (status) => {
    const positiveKeywords = ["completed", "approved", "done", "finished", "verified"];
    return positiveKeywords.some((kw) => status?.toLowerCase().includes(kw));
  };

  // Handlers
  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setSelectedReason("");
    setAdditionalComment("");
    setActionTaken("");
    setOpenModal(true);
  };

  const handleReasonChange = (e) => {
    const reason = e.target.value;
    setSelectedReason(reason);
    setActionTaken(additionalComment ? `${reason}: ${additionalComment}` : reason);
  };

  const handleCommentChange = (e) => {
    const comment = e.target.value;
    setAdditionalComment(comment);
    setActionTaken(selectedReason ? `${selectedReason}: ${comment}` : comment);
  };

  const confirmStatusChange = async () => {
    if (!actionTaken.trim()) {
      ToastNotification.error("Error!", "Please provide a reason or comment.");
      return;
    }

    try {
      setCurrentStatus(selectedStatus);
      setOpenModal(false);

      const response = await axios({
        method: "patch",
        url: `${process.env.REACT_APP_API_URL}/${requestType}/${referenceNumber}/status`,
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
        onStatusUpdate?.(selectedStatus);

        await axios({
          method: "post",
          url: `${process.env.REACT_APP_API_URL}/request_activity`,
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
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update status or log activity.");
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2 z-50">
      {/* Status Dropdown */}
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentStatus || "Select Status"}
            className="text-center w-fit cursor-pointer px-4 py-2"
            color={
              statusOptions.find((opt) => opt.status === currentStatus)?.color || "gray"
            }
          />
        </MenuHandler>

        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-2 ring-black/5 border-none w-fit">
          {statusOptions.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2 p-2">
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
                      className="text-center w-fit px-4 py-2"
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

      {/* Confirmation Dialog - EXACTLY like MainTab */}
      <Dialog open={openModal} handler={setOpenModal} size="sm">
        <DialogHeader className="text-lg text-gray-900 dark:text-gray-200">
          Confirm Status Change
        </DialogHeader>
        <DialogBody>
          <Typography
            variant="small"
            className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Select a reason for this action:
          </Typography>
          <select
            value={selectedReason}
            onChange={handleReasonChange}
            className="w-full border text-sm font-medium border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 mb-2 normal-case"
            required
          >
            <option value="">Select Reason</option>
            {(isPositiveStatus(selectedStatus) ? positiveReasons : negativeReasons).map(
              (reason) => (
                <option key={reason.id} value={reason.value}>
                  {reason.value}
                </option>
              )
            )}
          </select>

          <Typography
            variant="small"
            className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Additional comments (optional):
          </Typography>
          <textarea
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
            rows={4}
            placeholder="Enter additional comments here..."
            value={additionalComment}
            onChange={handleCommentChange}
          />
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            color="red"
            onClick={() => setOpenModal(false)}
            className="flex items-center gap-1 px-4 py-2 border rounded-md hover:text-red-500 dark:border-gray-600 normal-case"
          >
            Cancel
          </Button>
          <Button
            color="green"
            onClick={confirmStatusChange}
            className="flex items-center gap-1 px-4 py-2 normal-case"
            disabled={!selectedReason && !additionalComment}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default StatusModal;