import { useState, useEffect, useContext } from "react";
import { CaretDown, UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { AuthContext } from "../../../features/authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import ApprovalStatusModal from "../../../utils/approverStatusModal";
import { FloppyDisk, PencilSimpleLine, Plus, Prohibit, X } from "@phosphor-icons/react";

// MainTab Component
const MainTab = ({ request, setRequest, requestType, fetchRequests, onClose }) => {
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [editedPurpose, setEditedPurpose] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    if (request) {
      setIsAuthorized(request?.authorized_access?.includes(user.reference_number));
    }
  }, [request, user]);

  // Handle Purpose Edit
  const handleEditPurpose = () => {
    setEditedPurpose(request.purpose);
    setIsEditingPurpose(true);
  };

  const handleSavePurpose = async () => {
    if (!editedPurpose.trim() || editedPurpose === request.purpose) {
      setIsEditingPurpose(false);
      return;
    }
    try {
      await axios.put(`/${requestType}/${request.reference_number}`, {
        ...request,
        purpose: editedPurpose,
        requester: user.reference_number,
      }, { withCredentials: true });

      fetchRequests();
      setIsEditingPurpose(false);
      setEditedPurpose("");
    } catch (error) {
      console.error("Error updating purpose:", error);
      ToastNotification.error("Error", "Failed to update purpose.");
    }
  };

  // Handle Particulars Editing
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedParticular({ ...request.details[index] });
  };

  const handleSaveEdit = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails[index] = editedParticular;
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    try {
      const res = await axios.put(`/${requestType}/${request.reference_number}`, {
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

  const handleDetailRemove = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    try {
      const res = await axios.put(`/${requestType}/${request.reference_number}`, {
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

  const handleAddParticular = () => {
    const newDetail = { particulars: "", quantity: 0, description: "" };
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: [...prevRequest.details, newDetail],
    }));
  };

  const handleDeleteRequest = async () => {
    try {
      const res = await axios.delete(`/${requestType}/${request.reference_number}/archive/1`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", "Request archived successfully.");
        onClose();
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to delete the request.");
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Request Access */}
      <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
        <span className="flex items-center mb-2">
          <UserCircle size={24} />
          <p className="ml-2 text-sm">
            <span className="font-semibold">{getUserByReferenceNumber(request.requester)}</span> raised this request
          </p>
        </span>

        <p className="text-sm font-semibold text-gray-600">Purpose</p>
        {isAuthorized ? (
          isEditingPurpose ? (
            <textarea
              className="text-sm p-2 border w-full border-gray-300 rounded-md"
              value={editedPurpose}
              onChange={(e) => setEditedPurpose(e.target.value)}
              onBlur={handleSavePurpose}
              autoFocus
            />
          ) : (
            <p onClick={handleEditPurpose} className="cursor-pointer">{request.purpose}</p>
          )
        ) : (
          <p>{request.purpose}</p>
        )}
      </div>

      {/* Particulars Section */}
      {Array.isArray(request.details) && request.details.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold mt-5 text-gray-600">Particulars</p>
          <div className="flex flex-col gap-3">
            {request.details.map((detail, index) => (
              <div key={index} className="flex flex-col gap-1 p-3 border-gray-400 border rounded-md">
                <span className="flex gap-4 items-center">
                  {isAuthorized && editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        className="text-sm font-semibold p-1 min-w-20 w-full max-w-32 border border-gray-300 rounded-md"
                        placeholder="Particulars"
                        value={editedParticular.particulars}
                        onChange={(e) =>
                          setEditedParticular({
                            ...editedParticular,
                            particulars: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        className="text-sm font-semibold p-1 w-20 border border-gray-300 rounded-md"
                        placeholder="Quantity"
                        value={editedParticular.quantity}
                        onChange={(e) =>
                          setEditedParticular({
                            ...editedParticular,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">{detail.particulars}</p>
                      <p className="text-sm font-semibold">x{detail.quantity}</p>
                    </>
                  )}

                  <span className="flex gap-3 ml-auto">
                    {isAuthorized && editingIndex === index ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(index)}
                          title="Save"
                          className="hover:scale-[1.2] hover:text-green-500"
                        >
                          <FloppyDisk size={18} />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          title="Cancel"
                          className="hover:scale-[1.2] hover:text-red-500"
                        >
                          <Prohibit size={18} />
                        </button>
                      </>
                    ) : (
                      isAuthorized && (
                        <button
                          onClick={() => handleEditClick(index)}
                          title="Edit"
                          className="hover:scale-[1.2] hover:text-blue-500"
                        >
                          <PencilSimpleLine size={18} />
                        </button>
                      )
                    )}
                    {isAuthorized && (
                      <X
                        size={18}
                        title="Delete"
                        onClick={() => handleDetailRemove(index)}
                        className="cursor-pointer hover:scale-[1.2] hover:text-red-500"
                      />
                    )}
                  </span>
                </span>
                {isAuthorized && editingIndex === index ?(
                  <textarea
                    value={editedParticular.description}
                    className="text-sm p-1 w-full border border-gray-300 rounded-md mt-1"
                    placeholder="Description"
                    onChange={(e) => setEditedParticular({
                      ...editedParticular,
                      description: e.target.value,
                    })}
                  />
                ) : (
                  <p className="text-sm">{detail.description}</p>
                )}
              </div>
            ))}
        </div>

        {isAuthorized && (
          <button
            onClick={handleAddParticular}
            className="flex items-center gap-1 p-3 border-gray-400 border rounded-md hover:text-green-500"
          >
            Add Particular
            <span className="hover:scale-[1.2] ml-auto"><Plus size={18} /></span>
          </button>
        )}
      </div>
    )}

    {/* Delete Request Button at the Bottom */}
    {isAuthorized && (
      <div className="mt-4">
        <button
          onClick={handleDeleteRequest}
          className="w-full p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          Delete Request
        </button>
      </div>
    )}

    </div>
  );
};

export default MainTab;
