import React, { useContext, useEffect, useState } from 'react';
import { JobRequestsContext } from '../../../features/request_management/context/JobRequestsContext';
import { PurchasingRequestsContext } from '../../../features/request_management/context/PurchasingRequestsContext';
import { VenueRequestsContext } from '../../../features/request_management/context/VenueRequestsContext';
import { VehicleRequestsContext } from '../../../features/request_management/context/VehicleRequestsContext';
import { Typography, Chip, Button } from "@material-tailwind/react";
import { AuthContext } from '../../../features/authentication';
import axios from 'axios';
import { ReadCvLogo, ShoppingCart, CalendarCheck, Car } from "@phosphor-icons/react";
import RequestDetailsPage from './RequestDetailsPage';

function PortalDashboard() {
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { user } = useContext(AuthContext);

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  return (
    <div className="h-full bg-white rounded-lg w-full mt-0 px-3 py-4 flex flex-col gap-6">
      <Typography variant="h5" className="text-gray-800">My Requests</Typography>

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
        {filteredRequests.length === 0 ? (
          <Typography variant="h6" className="text-gray-500">No requests found.</Typography>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.reference_number}
              className="flex flex-col bg-gray-100 p-3 rounded-lg shadow-md w-full max-w-[full] cursor-pointer"
              onClick={() => openRequestDetails(request.reference_number)}
            >
              <div className='flex flex-col justify-between items-start gap-2'>
                <div className="flex items-center gap-2 w-full mb-1">
                  {typeIcons[request.type]}
                  <div className='flex flex-col w-full'>
                    <Typography variant="small" className="font-semibold mb-1">
                      {request.title || "Request Title"}
                    </Typography>
                    <div className='flex justify-between w-full items-center gap-2'>
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={request.status}
                        className="text-center w-fit cursor-pointer"
                        color={statusOptions.find(option => option.status === request.status)?.color || "gray"}
                      />
                      <Typography variant="small" className="text-gray-500 text-xs ml-auto">
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional: Show purpose on larger screens */}
              <Typography
                variant="small"
                className="text-gray-600 mb-1 hidden sm:block"
              >
                {request.purpose || "No description available."}
              </Typography>

            </div>
          ))
        )}
      </div>

      {selectedRequest && (
        <RequestDetailsPage
          referenceNumber={selectedRequest.reference_number}
          onClose={closeRequestDetails}
        />
      )}
    </div>
  );
}

export default PortalDashboard;
