import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Typography, Select, MenuItem } from '@material-tailwind/react';
import { JobRequestsContext } from '../../context/JobRequestsContext';
import { VehicleRequestsContext } from '../../context/VehicleRequestsContext';
import { VenueRequestsContext } from '../../context/VenueRequestsContext';
import { PurchasingRequestsContext } from '../../context/PurchasingRequestsContext';
import { UserContext } from '../../../../context/UserContext';
import SidebarView from '../../../../components/sidebar/SidebarView';

const CalendarView = () => {
  // Contexts
  const { jobRequests } = useContext(JobRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { allUserInfo } = useContext(UserContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all'); // Filter state (e.g., all, job requests, asset requests)

  // Combine all requests into a single array with additional request_type info
  const allRequests = [
    ...jobRequests.map((r) => ({ ...r, request_type: 'Job' })),
    ...vehicleRequests.map((r) => ({ ...r, request_type: 'Vehicle' })),
    ...venueRequests.map((r) => ({ ...r, request_type: 'Venue' })),
    ...purchasingRequests.map((r) => ({ ...r, request_type: 'Purchasing' })),
  ];

  // Filtered events based on selected filter
  const filteredRequests = allRequests.filter((request) => {
    if (filter === 'all') return true;
    return request.request_type === filter;
  });

  // Format requests to FullCalendar's event object
  const events = filteredRequests.map((request) => {
    let startDate, endDate;

    // Determine the date fields to use based on request type
    switch (request.request_type) {
      case 'Job':
        startDate = request.date_required; // Use date_required for Job requests
        break;
      case 'Purchasing':
        startDate = request.date_required; // Use date_required for Purchasing requests
        break;
      case 'Vehicle':
        startDate = request.date_of_trip; // Use date_of_trip for Vehicle requests
        break;
      case 'Venue':
        startDate = request.event_dates; // Use event_dates for Venue requests
        endDate = request.event_end_time
          ? new Date(startDate).setHours(
              request.event_end_time.split(':')[0],
              request.event_end_time.split(':')[1]
            )
          : null; // Set end date if event_end_time exists
        break;
      default:
        startDate = request.created_at; // Fallback to created_at for any unknown request type
        break;
    }

    return {
      title: request.title,
      start: startDate,
      end: endDate, // End date for venue requests or any event with a time range
      id: request.id,
      description: request.description,
      backgroundColor: request.status === 'approved' ? 'green' : 'red', // Color based on status
    };
  });

  // Handle when an event (request) is clicked
  const handleEventClick = (info) => {
    const requestId = info.event.id;
    const request = allRequests.find((r) => r.id === requestId);
    setSelectedRequest(request); // Set the selected request for the sidebar
    setSidebarOpen(true); // Open the sidebar
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value); // Change the filter based on user selection
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-900 mt-0 px-3 flex flex-col justify-between transition-colors">
      {/* Filter */}
      <div className="filter mb-4">
        <Typography variant="h6">Filter Requests</Typography>
        <Select value={filter} onChange={handleFilterChange} className="w-full">
          <MenuItem value="all">All Requests</MenuItem>
          <MenuItem value="job">Job Requests</MenuItem>
          <MenuItem value="vehicle">Vehicle Requests</MenuItem>
          <MenuItem value="venue">Venue Requests</MenuItem>
          <MenuItem value="purchasing">Purchasing Requests</MenuItem>
        </Select>
      </div>

      {/* FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin]}
        events={events}
        eventClick={handleEventClick}
        initialView="dayGridMonth"
      />

      {/* Sidebar */}
      {selectedRequest && (
        <SidebarView
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          referenceNumber={selectedRequest.reference_number}
        />
      )}
    </div>
  );
};

export default CalendarView;
