import React, { useContext, useEffect, useState } from 'react';
import { JobRequestsContext } from '../../../features/request_management/context/JobRequestsContext';
import { PurchasingRequestsContext } from '../../../features/request_management/context/PurchasingRequestsContext';
import { VenueRequestsContext } from '../../../features/request_management/context/VenueRequestsContext';
import { VehicleRequestsContext } from '../../../features/request_management/context/VehicleRequestsContext';
import { Typography, Chip, Button } from "@material-tailwind/react";
import { AuthContext } from '../../../features/authentication';
import axios from 'axios';
import { ReadCvLogo, ShoppingCart, CalendarCheck, Car } from "@phosphor-icons/react";
import RequestDetailsPage from '../request_view/RequestDetailsPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

import service_request from '../../../assets/service_requests.png';

function PortalDashboard() {
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { user } = useContext(AuthContext);

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { searchQuery } = useOutletContext();

  // Icon mapping for request types
  const typeIcons = {
    'Job Request': <span className='p-2 rounded-md bg-blue-500'><ReadCvLogo size={24} color="white" /></span>,
    'Purchasing Request': <span className='p-2 rounded-md bg-green-500'><ShoppingCart size={24} color="white" /></span>,
    'Venue Request': <span className='p-2 rounded-md bg-purple-500'><CalendarCheck size={24} color="white" /></span>,
    'Vehicle Request': <span className='p-2 rounded-md bg-red-500'><Car size={24} color="white" /></span>,
  };

  // Combine all requests and filter by user's reference number
  const allRequests = [
    ...jobRequests.map(req => ({ ...req, type: 'Job Request' })),
    ...purchasingRequests.map(req => ({ ...req, type: 'Purchasing Request' })),
    ...venueRequests.map(req => ({ ...req, type: 'Venue Request' })),
    ...vehicleRequests.map(req => ({ ...req, type: 'Vehicle Request' })),
  ].filter(req => req.requester === user?.reference_number);

  // Filter requests by selected type
  const filteredRequests = selectedType === 'All'
    ? allRequests
    : allRequests.filter(request => request.type === selectedType);

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

  // Open RequestDetailsPage
  const openRequestDetails = (referenceNumber) => {
    const request = allRequests.find(req => req.reference_number === referenceNumber);
    setSelectedRequest(request);
  };

  // Close RequestDetailsPage
  const closeRequestDetails = () => setSelectedRequest(null);

  // Apply search filter
  const searchedRequests = filteredRequests.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.title?.toLowerCase().includes(query) ||
      request.purpose?.toLowerCase().includes(query) ||
      request.reference_number?.toLowerCase().includes(query)
    );
  });


  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-3 py-4 flex flex-col gap-6 pb-24">
      <Typography variant="h5" className="text-gray-800 dark:text-gray-200">
        My Requests
      </Typography>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 overflow-x-auto md:justify-start justify-start">
        {[
          { type: 'All', color: 'blue' },
          { type: 'Job Request', color: 'blue' },
          { type: 'Venue Request', color: 'purple' },
          { type: 'Purchasing Request', color: 'green' },
          { type: 'Vehicle Request', color: 'red' },
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
            <img src={service_request} alt="No act" className="bg-transparent w-full h-auto max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm" />

            <Typography variant="h6" className="text-gray-500 dark:text-gray-400">
              Nothing to see yet. Start a request and be the first to fill this space!
            </Typography>
          </div>
        ) : (
          searchedRequests.map((request) => (
            <div
              key={request.reference_number}
              className="flex flex-col bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md w-full max-w-[full] cursor-pointer"
              onClick={() => openRequestDetails(request.reference_number)}
            >
              <div className='flex flex-col justify-between items-start gap-2'>
                <div className="flex items-center gap-2 w-full mb-1">
                  {typeIcons[request.type]}
                  <div className='flex flex-col w-full'>
                    <div className='flex justify-between w-full items-center gap-2'>
                      <Typography variant="small" className="font-semibold mb-1 dark:text-gray-200">
                        {request.title || "Request Title"}
                      </Typography>
                      <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-xs ml-auto hidden sm:block">
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className='flex justify-between w-full items-center gap-2'>
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={request.status}
                        className="text-center w-fit cursor-pointer dark:bg-opacity-20 dark:text-gray-300 dark:border-gray-600"
                        color={statusOptions.find(option => option.status === request.status)?.color || "gray"}
                      />
                      <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-xs ml-auto block sm:hidden">
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
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
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

}

export default PortalDashboard;
