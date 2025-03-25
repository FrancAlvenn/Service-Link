import React, { useContext, useState, useEffect } from 'react';
import { JobRequestsContext } from '../../../features/request_management/context/JobRequestsContext';
import { PurchasingRequestsContext } from '../../../features/request_management/context/PurchasingRequestsContext';
import { VenueRequestsContext } from '../../../features/request_management/context/VenueRequestsContext';
import { VehicleRequestsContext } from '../../../features/request_management/context/VehicleRequestsContext';
import { Typography, Button } from '@material-tailwind/react';
import MainTab from './MainTab';
import ActivityTab from './ActivityTab';
import DetailTab from './DetailTab';
import { X } from '@phosphor-icons/react';
import axios from 'axios';
import { AuthContext } from '../../../features/authentication';
import ToastNotification from '../../../utils/ToastNotification';


function RequestDetailsPage({ referenceNumber, onClose }) {
  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests, fetchVenueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests, fetchVehicleRequests } = useContext(VehicleRequestsContext);
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Main');
  const [request, setRequest] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [requestType, setRequestType] = useState('');

  // Find request by referenceNumber
  useEffect(() => {
    const allRequests = [
      ...jobRequests,
      ...purchasingRequests,
      ...venueRequests,
      ...vehicleRequests,
    ];
    const foundRequest = allRequests.find(req => req.reference_number === referenceNumber);

    //change the request type based on the reference number
    let typeName;
    switch (referenceNumber.slice(0, 2)) {
      case 'JR':
        typeName = 'job_request';
        break;
      case 'PR':
        typeName = 'purchasing_request';
        break;
      case 'VR':
        typeName = 'venue_request';
        break;
      case 'SV':
        typeName = 'vehicle_request';
        break;
      default:
        console.warn('Unknown request type:', referenceNumber);
    }
    setRequestType(typeName);

    setRequest(foundRequest || null);

    if (foundRequest) {
      setIsAuthorized(foundRequest?.authorized_access?.includes(user.reference_number));
    }
  }, [jobRequests, purchasingRequests, venueRequests, vehicleRequests, referenceNumber, user]);

  // Handle Edit Title
  const handleEditTitle = () => {
    setEditedTitle(request.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === request.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await axios.put(`/${request.request_type}/${request.reference_number}`, {
        ...request,
        title: editedTitle,
        requester: user.reference_number,
      }, { withCredentials: true });

      setRequest(prev => ({ ...prev, title: editedTitle }));
      setIsEditingTitle(false);
      setEditedTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
      ToastNotification.error('Error', 'Failed to update title.');
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center">
        <Typography variant="h6" className="text-gray-600">Request not found.</Typography>
      </div>
    );
  }

  // Fetch all requests
  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  };

  return (
    <div className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white z-100 p-6 overflow-y-auto">
      <div className="flex flex-col justify-between items-start mb-6">
        <div className="p-1 rounded-md bg-red-500 mb-3">
          <X color="white" onClick={onClose} className="cursor-pointer" />
        </div>

        {/* Editable Title */}
        {isAuthorized ? (
          isEditingTitle ? (
            <input
              type="text"
              className="border w-full border-gray-300 rounded-md p-2 font-bold text-xl"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleSaveTitle}
              autoFocus
            />
          ) : (
            <Typography variant="h5" className="text-gray-800 font-bold text-xl cursor-pointer" onClick={handleEditTitle}>
              {request.title || 'Request Details'}
            </Typography>
          )
        ) : (
          <Typography variant="h5" className="text-gray-800 font-bold text-xl">{request.title || 'Request Details'}</Typography>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 items-center justify-between bg-gray-100 shadow-sm  rounded-lg w-full max-w-full">
        {['Main', 'Details', 'Activity'].map(tab => (
          <Button
            key={tab}
            size="sm"
            className='w-full'
            variant={activeTab === tab ? 'filled' : 'text'}
            color={activeTab === tab ? 'blue' : 'black'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Render Active Tab */}
      {activeTab === 'Main' && <MainTab
        request={request}
        setRequest={setRequest}
        requestType={requestType}
        fetchRequests={fetchAllRequests}
        onClose={onClose}
      />}
      {activeTab === 'Details' && <DetailTab
        selectedRequest={request}
        setSelectedRequest={setRequest}
        requestType={requestType}
        fetchRequests={fetchAllRequests}
        isAuthorized={isAuthorized}
      />}
      {activeTab === 'Activity' && <ActivityTab
        referenceNumber={request.reference_number}
      />}
    </div>
  );
}

export default RequestDetailsPage;
