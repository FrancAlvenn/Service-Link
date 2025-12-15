import React, { useContext, useEffect, useState } from "react";
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { Typography, Chip, Button } from "@material-tailwind/react";
import { AuthContext } from "../../../features/authentication";
import axios from "axios";
import { ReadCvLogo } from "@phosphor-icons/react";
import RequestDetailsPage from "../request_view/RequestDetailsPage";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import service_request from "../../../assets/service_requests.png";
import EmployeeContext from "../../../features/employee_management/context/EmployeeContext";

function ForVerification() {
  const { jobRequests } = useContext(JobRequestsContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { searchQuery } = useOutletContext();
  const [forVerification, setForVerification] = useState([]);
  const { employees, fetchEmployees } = useContext(EmployeeContext);

  // Get status options from backend
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
  }, []);

  // Open RequestDetailsPage
  const openRequestDetails = (referenceNumber) => {
    const request = jobRequests.find(
      (req) => req.reference_number === referenceNumber
    );
    setSelectedRequest(request);
  };

  // Close RequestDetailsPage
  const closeRequestDetails = () => setSelectedRequest(null);

  // Filter job requests with pending approvals
  useEffect(() => {
    const isValidRef = (ref) =>
      typeof ref === "string" && /^[A-Za-z0-9_-]{3,50}$/.test(ref);

    const normalize = (ref) => (typeof ref === "string" ? ref.trim().toUpperCase() : "");

    const currentRef = normalize(user?.reference_number);
    if (!isValidRef(currentRef)) {
      console.error("Invalid current user reference number");
      setForVerification([]);
      return;
    }

    const toRefs = (assigned) => {
      if (!assigned) return [];
      const arr = Array.isArray(assigned) ? assigned : [];
      return arr
        .map((entry) => {
          if (typeof entry === "string") return normalize(entry);
          if (entry && typeof entry === "object") return normalize(entry.reference_number);
          return "";
        })
        .filter((ref) => {
          const valid = isValidRef(ref);
          if (!valid && ref) console.error("Invalid assigned reference number", ref);
          return valid;
        });
    };

    const forVerification = Object.values(jobRequests).filter((req) => {
      const statusOk = req.status?.toLowerCase() === "pending";
      const notVerified = req.verified === false;
      const assignedRefs = toRefs(req.assigned_to);
      const includesCurrent = assignedRefs.includes(currentRef);
      return statusOk && notVerified && includesCurrent;
    });

    setForVerification(forVerification);
  }, [jobRequests, employees, user]);

  // Apply search filter
  const searchedRequests = forVerification.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.title?.toLowerCase().includes(query) ||
      request.purpose?.toLowerCase().includes(query) ||
      request.reference_number?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen h-full bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-1 py-4 flex flex-col gap-4 pb-24">
      <Typography variant="h5" className="text-gray-800 dark:text-gray-200">
        Job Requests For Verification
      </Typography>

      {/* Filter Button - Only Job Requests */}
      <div className="flex flex-wrap gap-1">
        <Button
          size="sm"
          color="blue"
          variant="filled"
          className="md:min-w-fit"
        >
          Job Requests
        </Button>
      </div>

      {/* Scrollable Container */}
      <div className="flex flex-wrap gap-4 overflow-y-auto">
        {searchedRequests.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm py-3 text-center flex flex-col gap-3 items-center justify-center w-full">
            <img
              src={service_request}
              alt="No job requests"
              className="bg-transparent w-full h-auto max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm"
            />

            <Typography
              variant="h6"
              className="text-gray-500 dark:text-gray-400"
            >
              No job requests pending verification
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
                  <span className="p-2 rounded-md bg-blue-500">
                    <ReadCvLogo size={24} color="white" />
                  </span>
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between w-full items-center gap-2">
                      <Typography
                        variant="small"
                        className="font-semibold mb-1 dark:text-gray-200"
                      >
                        {request.title || "Job Request"}
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

              {/* Show classification if available */}
              {request.job_category && (
                <Chip
                  size="sm"
                  variant="outlined"
                  color="blue"
                  value={request.job_category.toUpperCase()}
                  className="mt-2 capitalize w-fit bg-blue-200 dark:bg-blue-700"
                />
              )}
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
                isApprover={false}
                forVerification={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ForVerification;
