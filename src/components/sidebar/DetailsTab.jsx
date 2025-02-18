import { CaretDown, Pencil } from "@phosphor-icons/react";
import React, { useContext, useState } from "react";
import axios from "axios";
import ToastNotification from "../../utils/ToastNotification";
import { UserContext } from "../../context/UserContext";
import { formatDate } from "../../utils/dateFormatter";

const DetailsTab = ({ selectedRequest, setSelectedRequest, requestType, fetchRequests }) => {
  const { getUserByReferenceNumber } = useContext(UserContext);
  const [editedRequest, setEditedRequest] = useState({ ...selectedRequest });
  const [editingField, setEditingField] = useState(null); // Tracks which field is being edited

  if (!selectedRequest) {
    return <p className="text-gray-500">Select a request to view details.</p>;
  }

  // Handle input changes per field
  const handleChange = (field, value) => {
    setEditedRequest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Update Request
  const handleUpdate = async (field) => {
    try {
      await axios({
        method: "PUT",
        url: `/${requestType}/${editedRequest.reference_number}`,
        data: {
            ...selectedRequest,
            [field]: editedRequest[field]
        },
      });

      //ToastNotification.success("Success", `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      fetchRequests();
      setSelectedRequest((prev) => ({ ...prev, [field]: editedRequest[field] }));
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", `Failed to update ${field}.`);
    }
  };

  // Handles when a field loses focus (auto-save)
  const handleBlur = (field) => {
    handleUpdate(field);
    setEditingField(null);
  };

  // Handles pressing "Enter" to save or "Escape" to cancel
  const handleKeyDown = (event, field) => {
    if (event.key === "Enter") {
      event.target.blur(); // Trigger blur to save
    } else if (event.key === "Escape") {
      setEditedRequest({ ...selectedRequest }); // Revert changes
      setEditingField(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3 border-gray-400 border rounded-md">
      <span className="flex gap-1">
        <p className="text-sm font-semibold text-gray-600">Details</p>
      </span>

      {/* Reference Number (Read-Only) */}
      <span className="flex gap-1">
        <p className="font-semibold text-sm">Reference Number</p>
        <p className="ml-auto text-sm">{selectedRequest.reference_number}</p>
      </span>

      {/* Requester */}
      <span className="flex gap-1">
        <p className="font-semibold text-sm">Requester</p>
        {/* {editingField === "requester" ? (
          <input
            type="text"
            className="text-sm p-1 ml-auto min-w-52 w-52 max-w-72 border border-gray-300 rounded-md"
            value={editedRequest.requester}
            onChange={(e) => handleChange("requester", e.target.value)}
            onBlur={() => handleBlur("requester")}
            onKeyDown={(e) => handleKeyDown(e, "requester")}
            autoFocus
          />
        ) : ( */}
          <p className="ml-auto text-sm" onClick={() => setEditingField("requester")}>
            {getUserByReferenceNumber(selectedRequest.requester)}
          </p>
        {/* )} */}
      </span>

      {/* Department */}
      <span className="flex gap-1">
        <p className="font-semibold text-sm">Department</p>
        {editingField === "department" ? (
          <input
            type="text"
            className="text-sm p-1 ml-auto min-w-52 w-52 max-w-72 border border-gray-300 rounded-md"
            value={editedRequest.department}
            onChange={(e) => handleChange("department", e.target.value)}
            onBlur={() => handleBlur("department")}
            onKeyDown={(e) => handleKeyDown(e, "department")}
            autoFocus
          />
        ) : (
          <p className="ml-auto text-sm cursor-pointer" onClick={() => setEditingField("department")}>
            {selectedRequest.department}
          </p>
        )}
      </span>

        {/* Date Required */}
        <span className="flex gap-1 items-center">
            <p className="font-semibold text-sm">Date Required</p>
            {editingField === "date_required" ? (
                <input
                type="date"
                className="text-sm p-1 ml-auto min-w-52 w-52 max-w-72 border border-gray-300 rounded-md"
                value={editedRequest.date_required ? editedRequest.date_required : selectedRequest.date_required}
                onChange={(e) => handleChange("date_required", e.target.value)}
                onBlur={() => handleBlur("date_required")}
                onKeyDown={(e) => handleKeyDown(e, "date_required")}
                autoFocus
                />
            ) : (
                <p 
                className="ml-auto text-sm cursor-pointer"
                onClick={() => setEditingField("date_required")}
                >
                {formatDate(selectedRequest.date_required)}
                </p>
            )}
        </span>

    </div>
  );
};

export default DetailsTab;
