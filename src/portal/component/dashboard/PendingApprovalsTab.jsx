import React, { useContext, useEffect, useState } from "react";
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import {
  Typography,
  Chip,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { AuthContext } from "../../../features/authentication";
import axios from "axios";
import {
  ReadCvLogo,
  ShoppingCart,
  CalendarCheck,
  Car,
} from "@phosphor-icons/react";
import RequestDetailsPage from "../request_view/RequestDetailsPage";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import service_request from "../../../assets/service_requests.png";
import HistorySection from "./components/HistorySection";

function PendingApprovalsTab() {
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { searchQuery } = useOutletContext();

  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [historyItems, setHistoryItems] = useState([]);
  const [historyComputeError, setHistoryComputeError] = useState("");

  const getRequestType = (referenceNumber) => {
    const firstTwoLetters = referenceNumber.slice(0, 2);
    switch (firstTwoLetters) {
      case "JR":
        return "Job Request";
      case "PR":
        return "Purchasing Request";
      case "VR":
        return "Venue Request";
      case "SV":
        return "Vehicle Request";
      default:
        return "Unknown";
    }
  };

  // Icon mapping for request types
  const typeIcons = {
    "Job Request": (
      <span className="p-2 rounded-md bg-blue-500">
        <ReadCvLogo size={24} color="white" />
      </span>
    ),
    "Purchasing Request": (
      <span className="p-2 rounded-md bg-green-500">
        <ShoppingCart size={24} color="white" />
      </span>
    ),
    "Venue Request": (
      <span className="p-2 rounded-md bg-purple-500">
        <CalendarCheck size={24} color="white" />
      </span>
    ),
    "Vehicle Request": (
      <span className="p-2 rounded-md bg-red-500">
        <Car size={24} color="white" />
      </span>
    ),
  };

  // Combine all requests and filter by user's reference number
  const allRequests = [
    ...(jobRequests?.length
      ? jobRequests.map((req) => ({ ...req, type: "Job Request" }))
      : []),
    ...(purchasingRequests?.length
      ? purchasingRequests.map((req) => ({
          ...req,
          type: "Purchasing Request",
        }))
      : []),
    ...(venueRequests?.length
      ? venueRequests.map((req) => ({ ...req, type: "Venue Request" }))
      : []),
    ...(vehicleRequests?.length
      ? vehicleRequests.map((req) => ({ ...req, type: "Vehicle Request" }))
      : []),
  ];

  // Filter requests by selected type
  const filteredRequests =
    selectedType === "All"
      ? allRequests
      : allRequests.filter((request) => request.type === selectedType);

  // Fetch status options from backend
  useEffect(() => {
    const getStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/settings/status`, {
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

  // Open RequestDetailsPage
  const openRequestDetails = (referenceNumber) => {
    const request = allRequests.find(
      (req) => req.reference_number === referenceNumber
    );
    setSelectedRequest(request);
  };

  // Close RequestDetailsPage
  const closeRequestDetails = () => setSelectedRequest(null);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Apply search filter on pending approvals instead of all requests
  const searchedRequests = pendingApprovals
    .filter((request) => {
      const type = getRequestType(request.reference_number);
      return selectedType === "All" || type === selectedType;
    })
    .filter((request) => {
      const query = searchQuery.toLowerCase();
      return (
        request.title?.toLowerCase().includes(query) ||
        request.purpose?.toLowerCase().includes(query) ||
        request.reference_number?.toLowerCase().includes(query)
      );
    });

  // You may need to fetch all request types from a context or API
  useEffect(() => {
    const allRequests = [
      ...Object.values(jobRequests),
      ...Object.values(purchasingRequests),
      ...Object.values(venueRequests),
      ...Object.values(vehicleRequests),
    ];

    const filtered = allRequests.filter((req) => {
      if (!Array.isArray(req.approvers)) return false;

      const flattened = req.approvers.flat(); // flatten any nested arrays

      return flattened.some(
        (approver) => approver.status?.toLowerCase() === "pending"
      );
    });

    setPendingApprovals(filtered);

    // Build history items: requests with a final action approved/rejected, optionally by current user
    try {
      const normalize = (ref) => (typeof ref === "string" ? ref.trim().toUpperCase() : "");
      const currentRef = normalize(user?.reference_number);

      const history = allRequests
        .filter((req) => {
          const status = (req.status || "").toLowerCase();
          const final = status === "approved" || status === "rejected";
          if (!final && Array.isArray(req.approvers)) {
            const acted = req.approvers.flat().some((a) => {
              const s = (a?.status || "").toLowerCase();
              return s === "approved" || s === "rejected";
            });
            return acted;
          }
          return final;
        })
        .map((req) => {
          const firstTwoLetters = (req.reference_number || "").slice(0, 2);
          const type = firstTwoLetters === "JR" ? "Job Request" : firstTwoLetters === "PR" ? "Purchasing Request" : firstTwoLetters === "VR" ? "Venue Request" : firstTwoLetters === "SV" ? "Vehicle Request" : "Unknown";
          const approverEntry = Array.isArray(req.approvers)
            ? req.approvers.flat().reverse().find((a) => {
                const s = (a?.status || "").toLowerCase();
                return s === "approved" || s === "rejected";
              })
            : null;
          const finalStatus = (req.status || approverEntry?.status || "Unknown");
          const actionUser = approverEntry?.approver_name || approverEntry?.name || approverEntry?.approver?.name || approverEntry?.reference_number || "";
          const timestamp = req.updated_at || approverEntry?.timestamp || req.approved_at || req.created_at;
          return {
            reference_number: req.reference_number,
            title: req.title,
            purpose: req.purpose,
            finalStatus,
            actionUser,
            timestamp,
            type,
          };
        });
      setHistoryItems(history);
      setHistoryComputeError("");
    } catch (e) {
      console.error("Error building history items", e);
      setHistoryItems([]);
      setHistoryComputeError("Failed to compute history items");
    }
  }, [user, jobRequests, purchasingRequests, vehicleRequests, venueRequests]);

  return (
    <div className="min-h-screen h-full bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-1 py-4 flex flex-col  gap-4 pb-24">
      <Typography variant="h5" className="text-gray-800 dark:text-gray-200">
        Pending Requests
      </Typography>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-1 overflow-x-auto md:justify-start justify-start">
        {[
          { type: "All", color: "blue" },
          { type: "Job Request", color: "blue" },
          { type: "Venue Request", color: "purple" },
          { type: "Purchasing Request", color: "green" },
          { type: "Vehicle Request", color: "red" },
        ].map(({ type, color }) => (
          <Button
            key={type}
            size="sm"
            color={color}
            variant={selectedType === type ? "filled" : "outlined"}
            onClick={() => setSelectedType(type)}
            className="md:min-w-fit"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Scrollable Container */}
      <div className="flex flex-wrap gap-4 overflow-y-auto">
        {searchedRequests.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400  text-sm py-3 text-center flex flex-col gap-3 items-center justify-center w-full">
            <img
              src={service_request}
              alt="No act"
              className="bg-transparent w-full h-auto max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm"
            />

            <Typography
              variant="h6"
              className="text-gray-500 dark:text-gray-400"
            >
              Nothing to see yet. Start a request and be the first to fill this
              space!
            </Typography>
          </div>
        ) : (
          searchedRequests.map((request) => (
            <div
              key={request.reference_number}
              className="flex flex-col bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md w-full max-w-[full] cursor-pointer"
              onClick={() => openRequestDetails(request.reference_number)}
            >
              <div className="flex flex-col justify-between items-start gap-2">
                <div className="flex items-center gap-2 w-full mb-1">
                  {typeIcons[getRequestType(request.reference_number)]}
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between w-full items-center gap-2">
                      <Typography
                        variant="small"
                        className="font-semibold mb-1 dark:text-gray-200"
                      >
                        {request.title || "Request Title"}
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-gray-500 dark:text-gray-400 text-xs ml-auto hidden sm:block"
                      >
                        Requested on:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className="flex justify-between w-full items-center gap-2">
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={request.status}
                        className="text-center w-fit cursor-pointer dark:bg-opacity-20 dark:text-gray-300 dark:border-gray-600"
                        color={
                          statusOptions.find(
                            (option) => option.status === request.status
                          )?.color || "gray"
                        }
                      />
                      <Typography
                        variant="small"
                        className="text-gray-500 dark:text-gray-400 text-xs ml-auto block sm:hidden"
                      >
                        Requested on:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <Typography
                variant="small"
                className="text-gray-600 dark:text-gray-300 mb-1 hidden sm:block"
              >
                {request.purpose || "No description available."}
              </Typography>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <>
            {/* Gray Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 bg-black z-40"
              onClick={closeRequestDetails}
            />

            {/* Sliding Request Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 shadow-lg z-50"
            >
              <RequestDetailsPage
                referenceNumber={selectedRequest.reference_number}
                onClose={closeRequestDetails}
                isApprover={true}
                lockActions={historyItems.some((h) => h.reference_number === selectedRequest.reference_number)}
              />
            </motion.div>
          </>
        )}
          </AnimatePresence>
      {/* History Section */}
      <div className="mt-6">
        {historyComputeError && (
          <Typography variant="small" className="text-red-500 mb-2">
            {historyComputeError}
          </Typography>
        )}
        <HistorySection
          items={historyItems}
          statusOptions={statusOptions}
          title="Request History"
          onOpenDetails={openRequestDetails}
        />
      </div>
    </div>
  );
}

export default PendingApprovalsTab;
