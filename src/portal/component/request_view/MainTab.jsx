import { useState, useEffect, useContext } from "react";
import { CaretDown, UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { AuthContext } from "../../../features/authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import ApprovalStatusModal from "../../../utils/approverStatusModal";
import { FloppyDisk, PencilSimpleLine, Plus, Prohibit, X } from "@phosphor-icons/react";
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Typography } from "@material-tailwind/react";

// MainTab Component
const MainTab = ({ request, setRequest, requestType, fetchRequests, onClose }) => {
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

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
        data: {
          requester: user.reference_number,
        },
        withCredentials: true,
      });

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", "Request archived successfully.");
        onClose();
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to delete the request.");
    }finally {
      setOpenDeleteModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Request Access */}
      <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600">
        <span className="flex items-center mb-2">
          <UserCircle size={24} className="text-gray-700 dark:text-gray-300" />
          <p className="ml-2 text-sm text-gray-900 dark:text-gray-300">
            <span className="font-semibold">{getUserByReferenceNumber(request.requester)}</span> raised this request
          </p>
        </span>

        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Purpose</p>
        {isAuthorized ? (
          isEditingPurpose ? (
            <textarea
              className="text-sm p-2 border w-full border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              value={editedPurpose}
              onChange={(e) => setEditedPurpose(e.target.value)}
              onBlur={handleSavePurpose}
              autoFocus
            />
          ) : (
            <p onClick={handleEditPurpose} className="cursor-pointer text-gray-900 dark:text-gray-300">{request.purpose}</p>
          )
        ) : (
          <p className="text-gray-900 dark:text-gray-300">{request.purpose}</p>
        )}
      </div>

      {/* Particulars Section */}
      {Array.isArray(request.details) && request.details.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold mt-5 text-gray-600 dark:text-gray-400">Particulars</p>
          <div className="flex flex-col gap-3">
            {request.details.map((detail, index) => (
              <div key={index} className="flex flex-col gap-1 p-3 border-gray-400 dark:border-gray-600 border rounded-md bg-white dark:bg-gray-800">
                <span className="flex gap-4 items-center">
                  {isAuthorized && editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        className="text-sm font-semibold p-1 min-w-20 w-full max-w-32 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
                        className="text-sm font-semibold p-1 w-20 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">{detail.particulars}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">x{detail.quantity}</p>
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
                {isAuthorized && editingIndex === index ? (
                  <textarea
                    value={editedParticular.description}
                    className="text-sm p-1 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 mt-1"
                    placeholder="Description"
                    onChange={(e) => setEditedParticular({
                      ...editedParticular,
                      description: e.target.value,
                    })}
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-gray-300">{detail.description}</p>
                )}
              </div>
            ))}
          </div>

          {isAuthorized && (
            <button
              onClick={handleAddParticular}
              className="flex items-center gap-1 p-3 border-gray-400 dark:border-gray-600 border rounded-md bg-white dark:bg-gray-800 hover:text-green-500 dark:hover:text-green-400"
            >
              Add Particular
              <span className="hover:scale-[1.2] ml-auto"><Plus size={18} /></span>
            </button>
          )}
        </div>
      )}

      {/* Delete Request Button with Confirmation */}
      {isAuthorized && (
        <div className="mt-4">
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="w-full p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete Request
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} handler={setOpenDeleteModal} size="sm">
        <DialogHeader className="text-gray-900 dark:text-gray-200">Confirm Request Deletion</DialogHeader>
        <DialogBody className="w-full bg-white dark:bg-gray-800">
          <Typography className="font-normal text-sm text-gray-800 dark:text-gray-300">
            Are you sure you want to delete this request? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button color="gray" onClick={() => setOpenDeleteModal(false)} className="mr-2 bg-gray-500 dark:bg-gray-700 cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleDeleteRequest} className="bg-red-500 dark:bg-red-600 cursor-pointer">
            Confirm Delete
          </Button>
        </DialogFooter>
      </Dialog>

    </div>
  );

};

export default MainTab;
