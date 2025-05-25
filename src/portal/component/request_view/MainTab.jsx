import { useState, useEffect, useContext } from "react";
import { CaretDown, UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { AuthContext } from "../../../features/authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import ApprovalStatusModal from "../../../utils/approverStatusModal";
import {
  FloppyDisk,
  PencilSimpleLine,
  Plus,
  Prohibit,
  X,
} from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
} from "@material-tailwind/react";

// MainTab Component
const MainTab = ({
  request,
  setRequest,
  requestType,
  fetchRequests,
  onClose,
  isApprover,
}) => {
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

  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(""); // "approved" or "rejected"
  const [actionComment, setActionComment] = useState("");

  useEffect(() => {
    if (request) {
      setIsAuthorized(
        request?.authorized_access?.includes(user.reference_number)
      );
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
      await axios.put(
        `/${requestType}/${request.reference_number}`,
        {
          ...request,
          purpose: editedPurpose,
          requester: user.reference_number,
        },
        { withCredentials: true }
      );

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
      const res = await axios.put(
        `/${requestType}/${request.reference_number}`,
        {
          requester: user.reference_number,
          details: updatedDetails,
        },
        { withCredentials: true }
      );

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
      const res = await axios.put(
        `/${requestType}/${request.reference_number}`,
        {
          requester: user.reference_number,
          details: updatedDetails,
        },
        { withCredentials: true }
      );

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
      const res = await axios.delete(
        `/${requestType}/${request.reference_number}/archive/1`,
        {
          data: {
            requester: user.reference_number,
          },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", "Request archived successfully.");
        onClose();
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to delete the request.");
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleRequestApproveStatus = async (status, comment = "") => {
    try {
      const flattened = request.approvers.flat();
      const currentApprover = flattened.find(
        (approver) => approver.reference_number === user.reference_number
      );

      console.log(flattened);

      if (!currentApprover) {
        ToastNotification.error("Error", "You are not listed as an approver.");
        return;
      }

      const currentPositionId = currentApprover.position.id;

      const updatedApprovers = flattened.map((approver) => {
        if (approver.position.id === currentPositionId) {
          return { ...approver, status: status };
        }
        return approver;
      });

      const res = await axios.put(
        `/${requestType}/${request.reference_number}`,
        {
          approvers: updatedApprovers,
          requester: user.reference_number,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        ToastNotification.success("Approved", "Request has been approved.");
        fetchRequests();
        onClose();

        // Format action text for log
        const capitalizedStatus =
          status.charAt(0).toUpperCase() + status.slice(1);
        const actionText = `Request has been ${capitalizedStatus} by ${currentApprover.position.position}`;

        await axios.post(
          "/request_activity",
          {
            reference_number: request.reference_number,
            visibility: "external",
            type: "status_change",
            action: actionText,
            details: comment,
            performed_by: user.reference_number,
          },
          { withCredentials: true }
        );
      }
    } catch (error) {
      console.error("Approval error:", error);
      ToastNotification.error("Error", "Failed to approve request.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Request Access */}
      <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600">
        <span className="flex items-center mb-2">
          <UserCircle size={24} className="text-gray-700 dark:text-gray-300" />
          <p className="ml-2 text-sm text-gray-900 dark:text-gray-300">
            <span className="font-semibold">
              {getUserByReferenceNumber(request.requester)}
            </span>{" "}
            raised this request
          </p>
        </span>

        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          Purpose
        </p>
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
            <p
              onClick={handleEditPurpose}
              className="cursor-pointer text-gray-900 dark:text-gray-300"
            >
              {request.purpose}
            </p>
          )
        ) : (
          <p className="text-gray-900 dark:text-gray-300">{request.purpose}</p>
        )}
      </div>

      {/* Particulars Section as Table */}
      {Array.isArray(request.details) && request.details.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold mt-5 text-gray-600 dark:text-gray-400">
            Particulars
          </p>
          <div className="overflow-x-auto  rounded-lg dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Particulars
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  {isAuthorized && (
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {request.details.map((detail, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                      {isAuthorized && editingIndex === index ? (
                        <input
                          type="text"
                          className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                          placeholder="Particulars"
                          value={editedParticular.particulars}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              particulars: e.target.value,
                            })
                          }
                        />
                      ) : (
                        detail.particulars
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                      {isAuthorized && editingIndex === index ? (
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                          placeholder="Quantity"
                          value={editedParticular.quantity}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              quantity: e.target.value,
                            })
                          }
                        />
                      ) : (
                        `x${detail.quantity}`
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                      {isAuthorized && editingIndex === index ? (
                        <textarea
                          className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                          placeholder="Description"
                          value={editedParticular.description}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        detail.description
                      )}
                    </td>
                    {isAuthorized && (
                      <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-200">
                        {editingIndex === index ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(index)}
                              title="Save"
                              className="text-red-500 hover:text-green-500"
                            >
                              <FloppyDisk size={18} />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              title="Cancel"
                              className="text-red-500 hover:text-red-500"
                            >
                              <Prohibit size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(index)}
                              title="Edit"
                              className="text-blue-500 hover:text-blue-500"
                            >
                              <PencilSimpleLine size={18} />
                            </button>
                            <button
                              onClick={() => handleDetailRemove(index)}
                              title="Delete"
                              className="text-red-500 hover:text-red-500"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isAuthorized && (
            <button
              className="font-normal text-sm mt-3 flex items-center gap-2 text-green-600  p-2 rounded-lg border border-green-500  hover:bg-green-50 w-fit"
              onClick={handleAddParticular}
            >
              <Plus size={16} />
              Add Particular
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center gap-2 w-full">
        {/* Approval Button */}
        {isApprover && (
          <div className="mt-4 w-full">
            <button
              onClick={() => {
                setApprovalStatus("approved");
                setOpenApprovalDialog(true);
              }}
              className="w-full p-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Approve Request
            </button>
          </div>
        )}

        {/* Approval Button */}
        {isApprover && (
          <div className="mt-4 w-full">
            <button
              onClick={() => {
                setApprovalStatus("rejected");
                setOpenApprovalDialog(true);
              }}
              className="w-full p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Reject Request
            </button>
          </div>
        )}
      </div>

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

      <Dialog open={openApprovalDialog} handler={setOpenApprovalDialog}>
        <DialogHeader>
          {approvalStatus === "approved" ? "Approve Request" : "Reject Request"}
        </DialogHeader>
        <DialogBody>
          <Typography
            variant="small"
            className="mb-2 text-gray-700 dark:text-gray-300"
          >
            Please provide a reason or comment for this action:
          </Typography>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
            rows={4}
            placeholder="Enter your reason here..."
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
          />
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            color="red"
            onClick={() => {
              setOpenApprovalDialog(false);
              setActionComment("");
              setApprovalStatus("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={() => {
              setOpenApprovalDialog(false);
              handleRequestApproveStatus(approvalStatus, actionComment);
              setActionComment("");
              setApprovalStatus("");
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        handler={setOpenDeleteModal}
        size="sm"
        className="dark:text-gray-100 dark:bg-gray-800"
      >
        <DialogHeader className="text-gray-900 dark:text-gray-200">
          Confirm Request Deletion
        </DialogHeader>
        <DialogBody className="w-full bg-white dark:bg-gray-800">
          <Typography className="font-normal text-sm text-gray-800 dark:text-gray-300">
            Are you sure you want to delete this request? This action cannot be
            undone.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            color="gray"
            onClick={() => setOpenDeleteModal(false)}
            className="mr-2 bg-gray-500 dark:bg-gray-700 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRequest}
            className="bg-red-500 dark:bg-red-600 cursor-pointer"
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MainTab;
