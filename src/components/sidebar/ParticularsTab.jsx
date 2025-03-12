import { FloppyDisk, PencilSimpleLine, Plus, Prohibit, X } from "@phosphor-icons/react";
import { useState } from "react";
import ToastNotification from "../../utils/ToastNotification";
import axios from "axios";

/**
 * ParticularsTab Component
 * Handles displaying, editing, adding, and removing particulars in a request.
 *
 * @param {{ request: object, setRequest: function, requestType: string, referenceNumber: string, fetchRequests: function, user: object }} props
 * @returns {JSX.Element}
 */
const ParticularsTab = ({ request, setRequest, requestType, referenceNumber, fetchRequests, user, isAuthorized }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

  // Handle edit click
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedParticular({ ...request.details[index] });
  };

  // Handle save edit
  const handleSaveEdit = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails[index] = editedParticular;
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    try {
      const res = await axios.put(`/${requestType}/${referenceNumber}`, {
        requester: user.reference_number,
        details: updatedDetails,
      }, { withCredentials: true });

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", res.data.message);
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update details.");
    }

    setEditingIndex(null);
  };

  // Handle delete particular
  const handleDetailRemove = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    try {
      const res = await axios.put(`/${requestType}/${referenceNumber}`, {
        requester: user.reference_number,
        details: updatedDetails,
      }, { withCredentials: true });

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", res.data.message);
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update details.");
    }
  };

  // Handle add new particular
  const handleAddParticular = () => {
    const newDetail = { particulars: "", quantity: 0, description: "" };
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: [...prevRequest.details, newDetail],
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold mt-5 text-gray-600">Particulars</p>
      <div className="flex flex-col gap-3">
        {request.details.map((detail, index) => (
          <div key={index} className="flex flex-col gap-1 p-3 border-gray-400 border rounded-md">
            <span className="flex gap-4 items-center">
              {isAuthorized && editingIndex === index ? (
                <input
                  type="text"
                  className="text-sm p-1 min-w-20 w-full max-w-32 border border-gray-300 rounded-md"
                  value={editedParticular.particulars}
                  onChange={(e) => setEditedParticular({ ...editedParticular, particulars: e.target.value })}
                />
              ) : (
                <p className="text-sm font-semibold">{detail.particulars}</p>
              )}

              {isAuthorized && editingIndex === index ? (
                <input
                  type="number"
                  className="text-sm p-1 w-20 border border-gray-300 rounded-md"
                  value={editedParticular.quantity}
                  onChange={(e) => setEditedParticular({ ...editedParticular, quantity: e.target.value })}
                />
              ) : (
                <p className="text-sm font-semibold">x{detail.quantity}</p>
              )}

              <span className="flex gap-3 ml-auto">
                {isAuthorized && editingIndex === index ? (
                  <span className="flex gap-3">
                    <button className="hover:scale-[1.2] hover:text-green-500" title="Save" onClick={() => handleSaveEdit(index)}>
                      <FloppyDisk size={18} />
                    </button>
                    <button className="hover:scale-[1.2] hover:text-red-500" title="Cancel" onClick={() => setEditingIndex(null)}>
                      <Prohibit size={18} />
                    </button>
                  </span>
                ) : (
                  <button className="hover:scale-[1.2] hover:text-blue-500" title="Edit" onClick={() => handleEditClick(index)}>
                    {isAuthorized && <PencilSimpleLine size={18} />}
                  </button>
                )}
                {isAuthorized && <X size={18} className="cursor-pointer hover:scale-[1.2] hover:text-red-500" title="Delete" onClick={() => handleDetailRemove(index)} />}
              </span>
            </span>

            {isAuthorized && editingIndex === index ? (
              <textarea
                className="w-full p-1 mt-1 text-sm border border-gray-300 rounded-md"
                value={editedParticular.description}
                onChange={(e) => setEditedParticular({ ...editedParticular, description: e.target.value })}
              />
            ) : (
              <p className="text-sm">{detail.description}</p>
            )}
          </div>
        ))}
      </div>

      {isAuthorized && <div className="flex gap-1 p-3 border-gray-400 border rounded-md hover:text-green-500" onClick={handleAddParticular}>
        <button className="text-sm text-center"> Add Particular</button>
        <Plus size={18} className="ml-auto cursor-pointer hover:scale-[1.2] hover:text-green-500" title="Add Particular" />
      </div>}
    </div>
  );
};

export default ParticularsTab;
