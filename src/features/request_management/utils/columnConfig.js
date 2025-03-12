import { Typography, Chip } from "@material-tailwind/react";
import StatusModal from "../../../utils/statusModal.js";
import ApprovalStatusModal from "../../../utils/approverStatusModal.js";
import ArchiveStatusModal from "../../../utils/archiveStatusModal.js";
import { formatDate, formatTime } from "../../../utils/dateFormatter.js";
import DepartmentModal from "../../../utils/departmentModal.js";

const normalText = "text-center font-semibold rounded-full flex items-center justify-center";

/**
 * Get the column configuration based on the request type
 * @param {string} requestType - The type of request (e.g., "job_request", "venue_request", "purchasing_request", "vehicle_request")
 * @param {function} setSidebarOpen - Function to open the sidebar
 * @param {function} setSelectedReferenceNumber - Function to set the selected reference number
 * @param {function} getUserByReferenceNumber - Function to get user info
 * @returns {Array} Column configuration
 */
export const getColumnConfig = (requestType, setSidebarOpen, setSelectedReferenceNumber, getUserByReferenceNumber) => {
  switch (requestType) {
    case "job_request":
      return [
        {
            key: "id",
            label: "ID",
            header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
            render: (row) => (
              <div className="flex justify-center">
                <Chip size="sm" variant="ghost" color="red" className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5" value={row.id} />
              </div>
            ),
          },
          {
            key: "reference_number",
            label: "Reference Number",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Reference Number</Typography>,
            render: (row) => (
              <Typography
                variant="small"
                color="blue-gray"
                className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
                onClick={() => {
                  setSidebarOpen(true);
                  setSelectedReferenceNumber(row.reference_number);
                }}
              >
                {row.reference_number}
              </Typography>
            ),
          },
          {
            key: "title",
            label: "Title",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Title</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.title}</Typography>,
          },
          {
            key: "status",
            label: "Status",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
            render: (row) => <StatusModal input={row.status} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "date_required",
            label: "Date Required",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Date Required</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.date_required)}</Typography>,
          },
          {
            key: "department",
            label: "Department",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Department</Typography>,
            render: (row) => <DepartmentModal request={row} input={row.department} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "purpose",
            label: "Purpose",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Purpose</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText} dangerouslySetInnerHTML={{ __html: row.purpose }}></Typography>,
          },
          {
            key: "requester",
            label: "Requester",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Requester</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{getUserByReferenceNumber(row.requester)}</Typography>,
          },
          {
            key: "immediate_head_approval",
            label: "Immediate Head Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Immediate Head Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.immediate_head_approval} referenceNumber={row.reference_number} approvingPosition="immediate_head_approval" requestType={requestType} />
            ),
          },
          {
            key: "gso_director_approval",
            label: "GSO Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>GSO Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.gso_director_approval} referenceNumber={row.reference_number} approvingPosition="gso_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "operations_director_approval",
            label: "Operations Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Operations Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.operations_director_approval} referenceNumber={row.reference_number} approvingPosition="operations_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "archived",
            label: "Archived",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Archived</Typography>,
            render: (row) => <ArchiveStatusModal input={row.archived} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "remarks",
            label: "Remarks",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Remarks</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.remarks}</Typography>,
          },
          {
            key: "created_at",
            label: "Created At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Created At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.created_at)}</Typography>,
          },
          {
            key: "updated_at",
            label: "Updated At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Updated At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.updated_at)}</Typography>,
          },
      ];

    case "purchasing_request":
      return [
        {
            key: "id",
            label: "ID",
            header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
            render: (row) => (
              <div className="flex justify-center">
                <Chip size="sm" variant="ghost" color="amber" className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5" value={row.id} />
              </div>
            ),
          },
          {
            key: "reference_number",
            label: "Reference Number",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Reference Number</Typography>,
            render: (row) => (
              <Typography
                variant="small"
                color="blue-gray"
                className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
                onClick={() => {
                  setSidebarOpen(true);
                  setSelectedReferenceNumber(row.reference_number);
                }}
              >
                {row.reference_number}
              </Typography>
            ),
          },
          {
            key: "title",
            label: "Title",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Title</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.title}</Typography>,
          },
          {
            key: "status",
            label: "Status",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
            render: (row) => <StatusModal input={row.status} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "date_required",
            label: "Date Required",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Date Required</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.date_required)}</Typography>,
          },
          {
            key: "department",
            label: "Department",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Department</Typography>,
            render: (row) => <DepartmentModal request={row} input={row.department} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "purpose",
            label: "Purpose",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Purpose</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText} dangerouslySetInnerHTML={{ __html: row.purpose }}></Typography>,
          },
          {
            key: "requester",
            label: "Requester",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Requester</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{getUserByReferenceNumber(row.requester)}</Typography>,
          },
          {
            key: "supply_category",
            label: "Supply Category",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Supply Category</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.supply_category}</Typography>,
          },
          {
            key: "immediate_head_approval",
            label: "Immediate Head Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Immediate Head Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.immediate_head_approval} referenceNumber={row.reference_number} approvingPosition="immediate_head_approval" requestType={requestType} />
            ),
          },
          {
            key: "gso_director_approval",
            label: "GSO Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>GSO Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.gso_director_approval} referenceNumber={row.reference_number} approvingPosition="gso_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "operations_director_approval",
            label: "Operations Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Operations Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.operations_director_approval} referenceNumber={row.reference_number} approvingPosition="operations_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "archived",
            label: "Archived",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Archived</Typography>,
            render: (row) => <ArchiveStatusModal input={row.archived} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "remarks",
            label: "Remarks",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Remarks</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.remarks}</Typography>,
          },
          {
            key: "created_at",
            label: "Created At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Created At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.created_at)}</Typography>,
          },
          {
            key: "updated_at",
            label: "Updated At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Updated At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.updated_at)}</Typography>,
          },
      ];

    case "venue_request":
      return [
        {
            key: "id",
            label: "ID",
            header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
            render: (row) => (
              <div className="flex justify-center">
                <Chip size="sm" variant="ghost" color="purple" className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5" value={row.id} />
              </div>
            ),
          },
          {
            key: "reference_number",
            label: "Reference Number",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Reference Number</Typography>,
            render: (row) => (
              <Typography
                variant="small"
                color="blue-gray"
                className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
                onClick={() => {
                  setSidebarOpen(true);
                  setSelectedReferenceNumber(row.reference_number);
                }}
              >
                {row.reference_number}
              </Typography>
            ),
          },
          {
            key: "title",
            label: "Title",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Title</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.title}</Typography>,
          },
          {
            key: "status",
            label: "Status",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
            render: (row) => <StatusModal input={row.status} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "venue_id",
            label: "Venue",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Venue</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.venue_id}</Typography>,
          },
          {
            key: "requester",
            label: "Requester",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Requester</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.requester}</Typography>,
          },
          {
            key: "department",
            label: "Department",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Department</Typography>,
            render: (row) => <DepartmentModal request={row} input={row.department} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "organization",
            label: "Organization",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Organization</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.organization}</Typography>,
          },
          {
            key: "event_title",
            label: "Event Title",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Event Title</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.event_title}</Typography>,
          },
          {
            key: "purpose",
            label: "Purpose",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Purpose</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText} dangerouslySetInnerHTML={{ __html: row.purpose }}></Typography>,
          },
          {
            key: "event_nature",
            label: "Event Nature",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Event Nature</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.event_nature}</Typography>,
          },
          {
            key: "event_dates",
            label: "Event Dates",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Event Dates</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.event_dates}</Typography>,
          },
          {
            key: "event_start_time",
            label: "Event Start Time",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Event Start Time</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.event_start_time}</Typography>,
          },
          {
            key: "event_end_time",
            label: "Event End Time",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Event End Time</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.event_end_time}</Typography>,
          },
          {
            key: "participants",
            label: "Participants",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Participants</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.participants}</Typography>,
          },
          {
            key: "pax_estimation",
            label: "Pax Estimation",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Pax Estimation</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.pax_estimation}</Typography>,
          },
          {
            key: "immediate_head_approval",
            label: "Immediate Head Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Immediate Head Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.immediate_head_approval} referenceNumber={row.reference_number} approvingPosition="immediate_head_approval" requestType={requestType} />
            ),
          },
          {
            key: "gso_director_approval",
            label: "GSO Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>GSO Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.gso_director_approval} referenceNumber={row.reference_number} approvingPosition="gso_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "operations_director_approval",
            label: "Operations Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Operations Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.operations_director_approval} referenceNumber={row.reference_number} approvingPosition="operations_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "archived",
            label: "Archived",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Archived</Typography>,
            render: (row) => <ArchiveStatusModal input={row.archived} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "remarks",
            label: "Remarks",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Remarks</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.remarks}</Typography>,
          },
          {
            key: "created_at",
            label: "Created At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Created At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.created_at)}</Typography>,
          },
          {
            key: "updated_at",
            label: "Updated At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Updated At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.updated_at)}</Typography>,
          },
      ];

    case "vehicle_request":
      return [
        {
            key: "id",
            label: "ID",
            header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
            render: (row) => (
              <div className="flex justify-center">
                <Chip size="sm" variant="ghost" color="green" className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5" value={row.id} />
              </div>
            ),
          },
          {
            key: "reference_number",
            label: "Reference Number",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Reference Number</Typography>,
            render: (row) => (
              <Typography
                variant="small"
                color="blue-gray"
                className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
                onClick={() => {
                  setSidebarOpen(true);
                  setSelectedReferenceNumber(row.reference_number);
                }}
              >
                {row.reference_number}
              </Typography>
            ),
          },
          {
            key: "title",
            label: "Title",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Title</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.title}</Typography>,
          },
          {
            key: "status",
            label: "Status",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
            render: (row) => <StatusModal input={row.status} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "vehicle_requested",
            label: "Vehicle Requested",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Vehicle Requested</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.vehicle_requested}</Typography>,
          },
          {
            key: "date_filled",
            label: "Date Filled",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Date Filled</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.date_filled)}</Typography>,
          },
          {
            key: "date_of_trip",
            label: "Date of Trip",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Date of Trip</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.date_of_trip)}</Typography>,
          },
          {
            key: "time_of_departure",
            label: "Time of Departure",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Time of Departure</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{(row.time_of_departure)}</Typography>,
          },
          {
            key: "time_of_arrival",
            label: "Time of Arrival",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Time of Arrival</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{(row.time_of_arrival)}</Typography>,
          },
          {
            key: "number_of_passengers",
            label: "Number of Passengers",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Number of Passengers</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.number_of_passengers}</Typography>,
          },
          {
            key: "destination",
            label: "Destination",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Destination</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.destination}</Typography>,
          },
          {
            key: "department",
            label: "Department",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Department</Typography>,
            render: (row) => <DepartmentModal request={row} input={row.department} referenceNumber={row.reference_number} requestType={requestType}  />,
          },
          {
            key: "purpose",
            label: "Purpose",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Purpose</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText} dangerouslySetInnerHTML={{ __html: row.purpose }}></Typography>,
          },
          {
            key: "requester",
            label: "Requester",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Requester</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{getUserByReferenceNumber(row.requester)}</Typography>,
          },
          {
            key: "immediate_head_approval",
            label: "Immediate Head Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Immediate Head Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.immediate_head_approval} referenceNumber={row.reference_number} approvingPosition="immediate_head_approval" requestType={requestType} />
            ),
          },
          {
            key: "gso_director_approval",
            label: "GSO Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>GSO Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.gso_director_approval} referenceNumber={row.reference_number} approvingPosition="gso_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "operations_director_approval",
            label: "Operations Director Approval",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Operations Director Approval</Typography>,
            render: (row) => (
              <ApprovalStatusModal input={row.operations_director_approval} referenceNumber={row.reference_number} approvingPosition="operations_director_approval" requestType={requestType} />
            ),
          },
          {
            key: "archived",
            label: "Archived",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Archived</Typography>,
            render: (row) => <ArchiveStatusModal input={row.archived} referenceNumber={row.reference_number} requestType={requestType} />,
          },
          {
            key: "remarks",
            label: "Remarks",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Remarks</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.remarks}</Typography>,
          },
          {
            key: "created_at",
            label: "Created At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Created At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.created_at)}</Typography>,
          },
          {
            key: "updated_at",
            label: "Updated At",
            header: <Typography variant="small" color="blue-gray" className={normalText}>Updated At</Typography>,
            render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.updated_at)}</Typography>,
          },
      ];

    default:
      return [];
  }
};
