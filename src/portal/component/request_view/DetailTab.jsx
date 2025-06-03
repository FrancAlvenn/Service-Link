import { CaretDown, Pencil } from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import { formatDate } from "../../../utils/dateFormatter";
import DepartmentModal from "../../../utils/departmentModal";
import { Chip } from "@material-tailwind/react";

const DetailTab = ({
  selectedRequest,
  setSelectedRequest,
  requestType,
  fetchRequests,
  isAuthorized,
}) => {
  const { getUserByReferenceNumber } = useContext(UserContext);
  const [editedRequest, setEditedRequest] = useState({ ...selectedRequest });
  const [editingField, setEditingField] = useState(null);

  const [venueOptions, setVenueOptions] = useState([]);

  useEffect(() => {
    axios({
      method: "GET",
      url: "/assets/",
      withCredentials: true,
    })
      .then((response) => {
        const venueAssets = [];
        response.data.forEach((asset) => {
          if (asset.asset_type === "Venue") {
            venueAssets.push(asset);
          }
        });
        setVenueOptions(venueAssets);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (!selectedRequest) {
    return <p className="text-gray-500">Select a request to view details.</p>;
  }

  const statusOptions = [
    { status: "Pending", color: "yellow" },
    { status: "Approved", color: "green" },
    { status: "Rejected", color: "red" },
    { status: "In-review", color: "blue" },
  ];

  const requestFieldConfig = {
    job_request: [
      {
        key: "reference_number",
        label: "Reference Number",
        type: "text",
        readOnly: true,
      },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "date_required", label: "Date Required", type: "date" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],

    purchasing_request: [
      {
        key: "reference_number",
        label: "Reference Number",
        type: "text",
        readOnly: true,
      },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "supply_category", label: "Supply Category", type: "text" },
      { key: "date_required", label: "Date Required", type: "date" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],

    venue_request: [
      {
        key: "reference_number",
        label: "Reference Number",
        type: "text",
        readOnly: true,
      },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "organization", label: "Organization", type: "text" },
      { key: "venue_requested", label: "Venue Requested", type: "select" },
      { key: "event_nature", label: "Event Nature", type: "text" },
      { key: "event_dates", label: "Event Date", type: "date" },
      { key: "event_start_time", label: "Start Time", type: "time" },
      { key: "event_end_time", label: "End Time", type: "time" },
      { key: "participants", label: "Participants", type: "text" },
      {
        key: "pax_estimation",
        label: "Estimated Participants",
        type: "number",
      },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],

    vehicle_request: [
      {
        key: "reference_number",
        label: "Reference Number",
        type: "text",
        readOnly: true,
      },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },

      // { key: "vehicle_requested", label: "Vehicle Type", type: "text" },
      { key: "date_of_trip", label: "Date of Trip", type: "date" },
      { key: "time_of_departure", label: "Departure Time", type: "time" },
      { key: "time_of_arrival", label: "Arrival Time", type: "time" },
      {
        key: "number_of_passengers",
        label: "Number of Passengers",
        type: "number",
      },
      { key: "destination", label: "Destination", type: "text" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],
  };

  const fields = requestFieldConfig[requestType] || [];

  const handleChange = (field, value) => {
    setEditedRequest((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (field) => {
    try {
      await axios.put(`/${requestType}/${editedRequest.reference_number}`, {
        ...selectedRequest,
        [field]: editedRequest[field],
      });
      fetchRequests();
      setSelectedRequest((prev) => ({
        ...prev,
        [field]: editedRequest[field],
      }));
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", `Failed to update ${field}.`);
    }
  };

  const handleBlur = (field) => {
    handleUpdate(field);
    setEditingField(null);
  };

  const handleKeyDown = (event, field) => {
    if (event.key === "Enter") event.target.blur();
    else if (event.key === "Escape") {
      setEditedRequest({ ...selectedRequest });
      setEditingField(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-3 mb-3">
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
        Details
      </p>

      {fields.map(({ key, label, type, readOnly }) => (
        <div key={key} className="flex flex-col gap-1">
          <p className="font-semibold text-sm dark:text-gray-300">{label}</p>
          {isAuthorized ? (
            editingField === key ? (
              type === "textarea" ? (
                <textarea
                  className="text-sm p-2 w-full border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={editedRequest[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={() => handleBlur(key)}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  autoFocus
                />
              ) : type === "select" ? (
                <select
                  className="text-sm p-2 w-full border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={editedRequest[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={() => handleBlur(key)}
                  autoFocus
                >
                  <option value="">Select a venue</option>
                  {venueOptions.map((venue) => (
                    <option key={venue.id} value={venue.name}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  className="text-sm p-2 w-full border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={editedRequest[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={() => handleBlur(key)}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  autoFocus
                />
              )
            ) : (
              <p
                className={`text-sm p-2 w-full border border-gray-300 rounded-md cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
                  readOnly ? "text-gray-500 dark:text-gray-500" : ""
                }`}
                onClick={() => !readOnly && setEditingField(key)}
              >
                {[
                  "date_required",
                  "created_at",
                  "updated_at",
                  "event_dates",
                  "date_of_trip",
                ].includes(key) ? (
                  formatDate(selectedRequest[key])
                ) : key === "requester" ? (
                  getUserByReferenceNumber(selectedRequest[key]) || (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      Click to edit
                    </span>
                  )
                ) : key === "department" ? (
                  <DepartmentModal
                    request={selectedRequest}
                    input={selectedRequest[key]}
                    referenceNumber={selectedRequest.reference_number}
                    requestType={requestType}
                  />
                ) : (
                  selectedRequest[key] || (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      Click to edit
                    </span>
                  )
                )}
              </p>
            )
          ) : (
            <p className="text-sm p-2 w-full border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              {[
                "date_required",
                "created_at",
                "updated_at",
                "event_dates",
                "date_of_trip",
              ].includes(key) ? (
                formatDate(selectedRequest[key])
              ) : key === "requester" ? (
                getUserByReferenceNumber(selectedRequest[key]) || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    N/A
                  </span>
                )
              ) : key === "department" ? (
                <DepartmentModal
                  request={selectedRequest}
                  input={selectedRequest[key]}
                  referenceNumber={selectedRequest.reference_number}
                  requestType={requestType}
                />
              ) : (
                selectedRequest[key] || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    N/A
                  </span>
                )
              )}
            </p>
          )}
        </div>
      ))}

      {/* Approvers Section */}
      {/* Dynamic Approvers Section */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold dark:text-gray-300">
          Approver Statuses
        </p>
        {(() => {
          if (!selectedRequest?.approvers) return null;

          // Flatten and group by position
          const groupedByPosition = {};
          selectedRequest.approvers.flat().forEach((approver) => {
            const position = approver.position?.position || "Unknown Position";
            if (!groupedByPosition[position]) {
              groupedByPosition[position] = [];
            }
            groupedByPosition[position].push(approver);
          });

          return Object.entries(groupedByPosition).map(
            ([positionName, approversInPosition]) => {
              // Determine the current status for this position
              const status =
                approversInPosition.find((a) => a.status === "approved")
                  ?.status ||
                approversInPosition.find((a) => a.status === "rejected")
                  ?.status ||
                approversInPosition.find((a) => a.status === "in-review")
                  ?.status ||
                "Pending";

              const chipColor =
                statusOptions.find(
                  (option) =>
                    option.status.toLowerCase() === status.toLowerCase()
                )?.color || "gray";

              return (
                <div key={positionName} className="flex flex-col gap-1">
                  <p className="text-sm font-semibold dark:text-gray-300">
                    {positionName} Approval
                  </p>
                  <Chip
                    key={status}
                    size="sm"
                    variant="ghost"
                    value={status}
                    className="text-center h-9 cursor-pointer w-full dark:bg-gray-800 dark:text-white"
                    color={chipColor}
                  />
                </div>
              );
            }
          );
        })()}
      </div>
    </div>
  );
};

export default DetailTab;
