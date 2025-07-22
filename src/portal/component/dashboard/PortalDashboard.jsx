import React, { useContext, useEffect, useMemo, useState } from "react";
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { Typography, Chip, Button } from "@material-tailwind/react";
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
import EmployeeContext from "../../../features/employee_management/context/EmployeeContext";
import { SettingsContext } from "../../../features/settings/context/SettingsContext";

function PortalDashboard() {
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { user } = useContext(AuthContext);
  const { employees, fetchEmployees } = useContext(EmployeeContext);
  const { approvers, fetchApprovers } = useContext(SettingsContext);
  const navigate = useNavigate();

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { searchQuery } = useOutletContext();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [forVerification, setForVerification] = useState([]);

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
    ...Object.values(jobRequests).map((req) => ({
      ...req,
      type: "Job Request",
    })),
    ...Object.values(purchasingRequests).map((req) => ({
      ...req,
      type: "Purchasing Request",
    })),
    ...Object.values(venueRequests).map((req) => ({
      ...req,
      type: "Venue Request",
    })),
    ...Object.values(vehicleRequests).map((req) => ({
      ...req,
      type: "Vehicle Request",
    })),
  ].filter((req) => req.requester === user?.reference_number);

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

  useEffect(() => {
    fetchEmployees();
    fetchApprovers();
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

  // Apply search filter
  const searchedRequests = filteredRequests.filter((request) => {
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
        (approver) =>
          approver.status?.toLowerCase() === "pending" &&
          approver.reference_number.includes(user.reference_number)
      );
    });

    setPendingApprovals(filtered);

    const employee = employees.find(
      (e) => e.reference_number === user?.reference_number
    );

    const forVerification = Object.values(jobRequests).filter((req) => {
      return (
        req.status?.toLowerCase() === "pending" &&
        req.verified === false &&
        req.job_category?.toLowerCase() === employee?.expertise?.toLowerCase()
      );
    });

    setForVerification(forVerification);
  }, [user, jobRequests, purchasingRequests, vehicleRequests, venueRequests]);

  const isApprover = useMemo(() => {
    if (!Array.isArray(approvers)) return false;
    return approvers.some((a) => a.reference_number === user?.reference_number);
  }, [user, approvers]);

  const isEmployee = useMemo(() => {
    if (!Array.isArray(employees)) return false;
    return employees.some((e) => e.reference_number === user?.reference_number);
  }, [user, employees]);

  return (
    <div className="min-h-screen h-full bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-1 py-4 flex flex-col  gap-4 pb-24">
      <div className="flex justify-between items-center">
        <Typography variant="h5" className="text-gray-800 dark:text-gray-200">
          My Requests
        </Typography>
        {user?.designation_id !== 1 && isApprover && (
          <Typography
            className="text-blue-500 dark:text-blue-800 text-xs font-semibold cursor-pointer hover:underline"
            onClick={() => handleNavigation("/portal/pending-approvals")}
          >
            Show Pending Approvals
          </Typography>
        )}
        {user?.designation_id !== 1 && isEmployee && (
          <Typography
            className="text-blue-500 dark:text-blue-800 text-xs font-semibold cursor-pointer hover:underline"
            onClick={() => handleNavigation("/portal/for-verification")}
          >
            Show For Verification
          </Typography>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-1 overflow-x-auto md:justify-start justify-start">
        {[
          { type: "All", color: "blue" },
          ...(user?.designation_id === 1 //Changeable later to dynamic if wanted to add to settings
            ? [] // Student — hide Job & Purchasing
            : [
                { type: "Job Request", color: "blue" },
                { type: "Purchasing Request", color: "green" },
              ]),
          { type: "Venue Request", color: "purple" },
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

      {pendingApprovals.length > 0 &&
        user?.designation_id !== 1 &&
        approvers.some(
          (emp) => emp.reference_number === user.reference_number
        ) && (
          <button
            className=" bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition"
            onClick={() => handleNavigation("/portal/pending-approvals")}
            aria-label="View Pending Approvals"
          >
            <Typography variant="small" className="font-bold">
              Pending Approvals ({pendingApprovals.length})
            </Typography>
          </button>
        )}

      {forVerification.length > 0 &&
        user?.designation_id !== 1 &&
        employees.some(
          (emp) => emp.reference_number === user.reference_number
        ) && (
          <button
            className=" bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg transition"
            onClick={() => handleNavigation("/portal/for-verification")}
            aria-label="View Pending Approvals"
          >
            <Typography variant="small" className="font-bold">
              For Verification ({forVerification.length})
            </Typography>
          </button>
        )}

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
                  {typeIcons[request.type]}
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
                isApprover={isApprover}
                isEmployee={isEmployee}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PortalDashboard;
