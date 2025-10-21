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
  forVerification,
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
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
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
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
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
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
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
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}/archive/1`,
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

      if (!currentApprover) {
        ToastNotification.error("Error", "You are not listed as an approver.");
        return;
      }

      if (comment === "") {
        ToastNotification.error("Error", "Please provide a comment.");
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
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
        {
          approvers: updatedApprovers,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        ToastNotification.success(approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1), "Request has been " + approvalStatus + ".");
        fetchRequests();
        onClose();

        // Format action text for log
        const capitalizedStatus =
          status.charAt(0).toUpperCase() + status.slice(1);
        const actionText = `Request has been ${capitalizedStatus} by ${currentApprover.position.position}`;

        await axios.post(
          `${process.env.REACT_APP_API_URL}/request_activity`,
          {
            reference_number: request.reference_number,
            visibility: "external",
            type: "approval",
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

  const handleVerification = async () => {
    const res = await axios.put(
      `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
      {
        ...request,
        verified: true,
        verified_by: user.reference_number,
      },
      { withCredentials: true }
    );

    if (res.status === 200) {
      ToastNotification.success("Verified", "Request has been verified.");

      await axios.post(
        `${process.env.REACT_APP_API_URL}/request_activity`,
        {
          reference_number: request.reference_number,
          visibility: "internal",
          type: "verification",
          action: "Request has been verified",
          details: "",
          performed_by: user.reference_number,
        },
        { withCredentials: true }
      );

      fetchRequests();
      onClose();
    }
  };

  const [selectedReason, setSelectedReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");

  // Predefined reasons for approval and rejection
  const approvalReasons = [
    { id: 1, value: "Request meets all requirements" },
    { id: 2, value: "Urgent need verified" },
    { id: 3, value: "Budget approved" },
    { id: 4, value: "Other" },
  ];

  const rejectionReasons = [
    { id: 1, value: "Insufficient justification" },
    { id: 2, value: "Budget constraints" },
    { id: 3, value: "Item not available" },
    { id: 4, value: "Other" },
  ];

    // Handle dropdown change and update actionComment
  const handleReasonChange = (e, isDelete = false) => {
    const reason = e.target.value;
    setSelectedReason(reason);
    // Combine reason with additional comment if present
    setActionComment(additionalComment ? `${reason}: ${additionalComment}` : reason);
  };

  // Handle textarea change and update actionComment
  const handleCommentChange = (e) => {
    const comment = e.target.value;
    setAdditionalComment(comment);
    // Combine selected reason with comment if present
    setActionComment(selectedReason ? `${selectedReason}: ${comment}` : comment);
  };

  // Handle confirm action for approval/rejection
  const handleConfirmApproval = () => {
    setOpenApprovalDialog(false);
    handleRequestApproveStatus(approvalStatus, actionComment);
    setActionComment("");
    setSelectedReason("");
    setAdditionalComment("");
    setApprovalStatus("");
  };

  // Handle confirm action for deletion
  const handleConfirmDelete = () => {
    setOpenDeleteModal(false);
    handleDeleteRequest(actionComment); // Pass actionComment to handleDeleteRequest
    setActionComment("");
    setSelectedReason("");
    setAdditionalComment("");
  };

  // Reset state on cancel
  const handleCancel = () => {
    setOpenApprovalDialog(false);
    setOpenDeleteModal(false);
    setActionComment("");
    setSelectedReason("");
    setAdditionalComment("");
    setApprovalStatus("");
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
              // onClick={handleEditPurpose}
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
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Particulars
                  </th>
                  {requestType !== "venue_request" && (
                 <>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  {requestType !== "purchasing_request" && (<th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Remarks</th>)}
                </>
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
                      {isAuthorized && editingIndex === index && requestType !== "venue_request" ?  (
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
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                      {isAuthorized && editingIndex === index && requestType !== "venue_request" && requestType !== "purchasing_request" ? (
                        <textarea
                          className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                          placeholder="Remarks"
                          value={editedParticular.remarks}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              remarks: e.target.value,
                            })
                          }
                        />
                      ) : (
                        detail.remarks
                      )}
                    </td>
                    {/* {isAuthorized && (
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
                    )} */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* {isAuthorized && (
            <button
              className="font-normal text-sm mt-3 flex items-center gap-2 text-green-600  p-2 rounded-lg border border-green-500  hover:bg-green-50 w-fit"
              onClick={handleAddParticular}
            >
              <Plus size={16} />
              Add Particular
            </button>
          )} */}
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

      {forVerification && (
        <div className="mt-4 w-full">
          <button
            onClick={() => {
              handleVerification();
            }}
            className="w-full p-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Verify Request
          </button>
        </div>
      )}

      {/* Delete Request Button with Confirmation */}
      {isAuthorized && (
        <div className="mt-4">
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="w-full p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Cancel Request
          </button>
        </div>
      )}

      <Dialog open={openApprovalDialog} handler={setOpenApprovalDialog}>
        <DialogHeader className="text-lg text-gray-900 dark:text-gray-200">
          {approvalStatus === "approved" ? "Approve Request" : "Reject Request"}
        </DialogHeader>
        <DialogBody>
          <Typography
            variant="small"
            className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Select a reason for this action:
          </Typography>
          <select
            value={selectedReason}
            onChange={(e) => handleReasonChange(e)}
            className="w-full border text-sm font-medium border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 mb-2 normal-case"
            required
          >
            <option value="">Select Reason</option>
            {(approvalStatus === "approved" ? approvalReasons : rejectionReasons).map((reason) => (
              <option key={reason.id} value={reason.value}>
                {reason.value}
              </option>
            ))}
          </select>
          <Typography
            variant="small"
            className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Additional comments (optional):
          </Typography>
          <textarea
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
            rows={4}
            placeholder="Enter additional comments here..."
            value={additionalComment}
            onChange={handleCommentChange}
          />
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            color="red"
            onClick={handleCancel}
            className="flex items-center gap-1 px-4 py-2 border rounded-md hover:text-red-500 dark:border-gray-600 normal-case"
          >
            Cancel
          </Button>
          <Button
            variant=""
            color="green"
            onClick={handleConfirmApproval}
            className="flex items-center gap-1 px-4 py-2 normal-case"
            disabled={!selectedReason}
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
