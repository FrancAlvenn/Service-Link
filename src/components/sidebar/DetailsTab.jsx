import { CaretDown, Pencil } from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import ToastNotification from "../../utils/ToastNotification";
import { UserContext } from "../../context/UserContext";
import { formatDate } from "../../utils/dateFormatter";
import DepartmentModal from "../../utils/departmentModal";

const requestFieldConfig = {
    job_request: [
      { key: "reference_number", label: "Reference Number", type: "text", readOnly: true },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "department", label: "Department", type: "text", readOnly: true },
      { key: "date_required", label: "Date Required", type: "date" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],
  
    purchasing_request: [
      { key: "reference_number", label: "Reference Number", type: "text", readOnly: true },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "supply_category", label: "Supply Category", type: "text" },
      { key: "department", label: "Department", type: "text", readOnly: true },
      { key: "date_required", label: "Date Required", type: "date" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],
  
    venue_request: [
      { key: "reference_number", label: "Reference Number", type: "text", readOnly: true },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "department", label: "Department", type: "text", readOnly: true },
      { key: "organization", label: "Organization", type: "text" },
      { key: "event_title", label: "Event Title", type: "text" },
      { key: "event_nature", label: "Event Nature", type: "text" },
      { key: "event_dates", label: "Event Date", type: "date" },
      { key: "event_start_time", label: "Start Time", type: "time" },
      { key: "event_end_time", label: "End Time", type: "time" },
      { key: "participants", label: "Participants", type: "text" },
      { key: "pax_estimation", label: "Estimated Participants", type: "number" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],
  
    vehicle_request: [
      { key: "reference_number", label: "Reference Number", type: "text", readOnly: true },
      { key: "title", label: "Title", type: "text" },
      { key: "requester", label: "Requester", type: "text", readOnly: true },
      { key: "department", label: "Department", type: "text", readOnly: true },
      { key: "vehicle_requested", label: "Vehicle Type", type: "text" },
      { key: "date_of_trip", label: "Date of Trip", type: "date" },
      { key: "time_of_departure", label: "Departure Time", type: "time" },
      { key: "time_of_arrival", label: "Arrival Time", type: "time" },
      { key: "number_of_passengers", label: "Number of Passengers", type: "number" },
      { key: "destination", label: "Destination", type: "text" },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "created_at", label: "Created At", type: "date", readOnly: true },
      { key: "updated_at", label: "Updated At", type: "date", readOnly: true },
    ],
  };
  
  const DetailsTab = ({ selectedRequest, setSelectedRequest, requestType, fetchRequests, isAuthorized }) => {
    const { getUserByReferenceNumber } = useContext(UserContext);
    const [editedRequest, setEditedRequest] = useState({ ...selectedRequest });
    const [editingField, setEditingField] = useState(null);
  
    if (!selectedRequest) {
      return <p className="text-gray-500">Select a request to view details.</p>;
    }
  
    const fields = requestFieldConfig[requestType] || [];
  
    const handleChange = (field, value) => {
      setEditedRequest((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  
    const handleUpdate = async (field) => {
      try {
        const isDateOrTimeField = [
          "date_required", "created_at", "updated_at",
          "event_dates", "date_of_trip", "time_of_departure", "time_of_arrival"
        ].includes(field);
  
        await axios({
          method: "PUT",
          url: `/${requestType}/${editedRequest.reference_number}`,
          data: {
            ...selectedRequest,
            [field]: isDateOrTimeField
              ? editedRequest[field] || selectedRequest[field]
              : editedRequest[field],
          },
        });
  
        fetchRequests();
        setSelectedRequest((prev) => ({
          ...prev,
          [field]: isDateOrTimeField
            ? editedRequest[field] || prev[field]
            : editedRequest[field],
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
      if (event.key === "Enter") {
        event.target.blur();
      } else if (event.key === "Escape") {
        setEditedRequest({ ...selectedRequest });
        setEditingField(null);
      }
    };
  
    return (
      <div className="flex flex-col gap-4 p-3 mb-3 border-gray-400 border rounded-md">
        <span className="flex gap-1">
          <p className="text-sm font-semibold text-gray-600">Details</p>
        </span>
  
        {fields.map(({ key, label, type, readOnly }) => (
          <span key={key} className="flex gap-1">
            <p className="font-semibold text-sm">{label}</p>
            {isAuthorized ? (
              editingField === key ? (
                type === "textarea" ? (
                  <textarea
                    className="text-sm p-1 ml-auto min-w-52 w-52 max-w-72 border border-gray-300 rounded-md"
                    value={editedRequest[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onBlur={() => handleBlur(key)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    autoFocus
                  />
                ) : (
                  <input
                    type={type}
                    className="text-sm p-1 ml-auto min-w-52 w-52 max-w-72 border border-gray-300 rounded-md"
                    value={editedRequest[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onBlur={() => handleBlur(key)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    autoFocus
                  />
                )
              ) : (
                <p
                  className={`ml-auto text-sm cursor-pointer w-[50%] text-right  ${key === "reference_number" ? "font-semibold" : ""} ${readOnly ? "text-gray-500" : ""}`}
                  onClick={() => !readOnly && setEditingField(key)}
                >
                  {["date_required", "created_at", "updated_at", "event_dates", "date_of_trip"].includes(key)
                    ? formatDate(selectedRequest[key])
                    : key === "requester"
                    ? getUserByReferenceNumber(selectedRequest[key]) || <span className="text-gray-400 italic">Click to edit</span>
                    : key === "department"
                    ? <span className="flex items-end justify-end"><DepartmentModal request={selectedRequest} input={selectedRequest[key]} referenceNumber={selectedRequest.reference_number} requestType={requestType} /></span>
                    : selectedRequest[key] || <span className="text-gray-400 italic">Click to edit</span>
                  }
                </p>
              )
            ) : (
              <p className="ml-auto text-sm">
                {["date_required", "created_at", "updated_at", "event_dates", "date_of_trip"].includes(key)
                  ? formatDate(selectedRequest[key])
                  : key === "requester"
                  ? getUserByReferenceNumber(selectedRequest[key]) || <span className="text-gray-400 italic">N/A</span>
                  : key === "department"
                  ? <DepartmentModal request={selectedRequest} input={selectedRequest[key]} referenceNumber={selectedRequest.reference_number} requestType={requestType} />
                  : selectedRequest[key] || <span className="text-gray-400 italic">N/A</span>
                }
              </p>
            )}
          </span>
        ))}
      </div>
    );
  };
  
  export default DetailsTab;
  
