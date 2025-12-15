import { useState, useEffect, useContext, useRef } from "react";
import { CaretDown, UserCircle, Sparkle, ArrowClockwise } from "@phosphor-icons/react";
import axios from "axios";
import { AuthContext } from "../../../features/authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
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
  Spinner,
} from "@material-tailwind/react";
import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------
// Gemini initialisation (frontend only)
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

// MainTab Component
const MainTab = ({
  request,
  setRequest,
  requestType,
  fetchRequests,
  onClose,
  isApprover,
  forVerification,
  lockActions,
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

  const [selectedReason, setSelectedReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const textareaRef = useRef(null);

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
    setRequest((prev) => ({
      ...prev,
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
    setRequest((prev) => ({
      ...prev,
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
    setRequest((prev) => ({
      ...prev,
      details: [...prev.details, newDetail],
    }));
  };

  const handleDeleteRequest = async () => {
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}/archive/1`,
        {
          data: {
            requester: user.reference_number,
            action: actionComment,
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
      resetAIState();
    }
  };

  const handleRequestApproveStatus = async (status, comment = "") => {
    try {
      const flattened = request.approvers.flat();
      const currentApprover = flattened.find(
        (a) => a.reference_number === user.reference_number
      );

      if (!currentApprover) {
        ToastNotification.error("Error", "You are not listed as an approver.");
        return;
      }

      const currentPositionId = currentApprover.position.id;
      const updatedApprovers = flattened.map((a) =>
        a.position.id === currentPositionId ? { ...a, status } : a
      );

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
        {
          approvers: updatedApprovers,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        ToastNotification.success(
          status.charAt(0).toUpperCase() + status.slice(1),
          `Request has been ${status}.`
        );
        fetchRequests();
        onClose();

        const actionText = `Request has been ${status.charAt(0).toUpperCase() + status.slice(1)} by ${currentApprover.position.position} - ${currentApprover.name}`;

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
    } finally {
      resetAIState();
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

  // Predefined reasons
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

  const deletionReasons = [
    { id: 1, value: "Request no longer needed" },
    { id: 2, value: "Duplicate request" },
    { id: 3, value: "Incorrect information" },
    { id: 4, value: "Other" },
  ];

  // AI Helpers
  const generateReason = async (type) => {
    setAiLoading(true);
    try {
      let prompt = "";
      if (type === "approval") {
        prompt = `You are a professional admin. Write a short, polite reason for ${approvalStatus === "approved" ? "approving" : "rejecting"} a request. Keep under 50 words.`;
      } else if (type === "deletion") {
        prompt = `You are a professional admin. Write a short reason for cancelling a request. Keep under 50 words.`;
      }

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setAdditionalComment(text);
        setActionComment(selectedReason ? `${selectedReason}: ${text}` : text);
      }
    } catch (err) {
      ToastNotification.error("AI Error", "Failed to generate reason.");
    } finally {
      setAiLoading(false);
    }
  };

  const rephraseComment = async () => {
    if (!additionalComment.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Rephrase this comment professionally and concisely (under 60 words):\n"${additionalComment}"`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setAdditionalComment(text);
        setActionComment(selectedReason ? `${selectedReason}: ${text}` : text);
      }
    } catch (err) {
      ToastNotification.error("AI Error", "Failed to rephrase.");
    } finally {
      setAiLoading(false);
    }
  };

  const resetAIState = () => {
    setSelectedReason("");
    setAdditionalComment("");
    setActionComment("");
    setApprovalStatus("");
    setAiLoading(false);
  };

  const handleReasonChange = (e, isDelete = false) => {
    const reason = e.target.value;
    setSelectedReason(reason);
    setActionComment(additionalComment ? `${reason}: ${additionalComment}` : reason);
  };

  const handleCommentChange = (e) => {
    const comment = e.target.value;
    setAdditionalComment(comment);
    setActionComment(selectedReason ? `${selectedReason}: ${comment}` : comment);
  };

  const handleConfirmApproval = () => {
    setOpenApprovalDialog(false);
    handleRequestApproveStatus(approvalStatus, actionComment);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteModal(false);
    handleDeleteRequest();
  };

  const handleCancel = () => {
    setOpenApprovalDialog(false);
    setOpenDeleteModal(false);
    resetAIState();
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
            <p className="cursor-pointer text-gray-900 dark:text-gray-300">
              {request.purpose}
            </p>
          )
        ) : (
          <p className="text-gray-900 dark:text-gray-300">{request.purpose}</p>
        )}
      </div>

      {/* Particulars Section */}
      {Array.isArray(request.details) && request.details.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold mt-5 text-gray-600 dark:text-gray-400">
            Particulars
          </p>
          <div className="overflow-x-auto rounded-lg dark:border-gray-700">
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
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                      {requestType !== "purchasing_request" && (
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Remarks
                        </th>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {request.details.map((detail, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                      {isAuthorized && editingIndex === index ? (
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
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
                    {requestType !== "venue_request" && (
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                        {isAuthorized && editingIndex === index ? (
                          <textarea
                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
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
                    )}
                    {requestType !== "venue_request" && requestType !== "purchasing_request" && (
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                        {isAuthorized && editingIndex === index ? (
                          <textarea
                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2 w-full">
        {isApprover && (
          <>
            <div className="mt-4 w-full">
              <button
                onClick={() => {
                  setApprovalStatus("approved");
                  setOpenApprovalDialog(true);
                }}
                disabled={lockActions}
                className={`w-full p-2 text-sm text-white rounded-md ${lockActions ? "bg-blue-400 cursor-not-allowed opacity-50" : "bg-blue-500 hover:bg-blue-600"}`}
              >
                Approve Request
              </button>
            </div>
            <div className="mt-4 w-full">
              <button
                onClick={() => {
                  setApprovalStatus("rejected");
                  setOpenApprovalDialog(true);
                }}
                disabled={lockActions}
                className={`w-full p-2 text-sm text-white rounded-md ${lockActions ? "bg-red-400 cursor-not-allowed opacity-50" : "bg-red-500 hover:bg-red-600"}`}
              >
                Reject Request
              </button>
            </div>
          </>
        )}
      </div>

      {forVerification && (
        <div className="mt-4 w-full">
          <button
            onClick={handleVerification}
            disabled={lockActions}
            className={`w-full p-2 text-sm text-white rounded-md ${lockActions ? "bg-green-400 cursor-not-allowed opacity-50" : "bg-green-500 hover:bg-green-600"}`}
          >
            Verify Request
          </button>
        </div>
      )}

      {isAuthorized && (
        <div className="mt-4">
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="w-full p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Approval / Rejection Dialog */}
      <Dialog open={openApprovalDialog} handler={setOpenApprovalDialog}>
        <DialogHeader className="text-lg text-gray-900 dark:text-gray-200">
          {approvalStatus === "approved" ? "Approve Request" : "Reject Request"}
        </DialogHeader>
        <DialogBody>
          <Typography variant="small" className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            Select a reason:
          </Typography>
          <select
            value={selectedReason}
            onChange={(e) => handleReasonChange(e)}
            className="w-full border text-sm font-medium border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 mb-2"
          >
            <option value="">Select Reason</option>
            {(approvalStatus === "approved" ? approvalReasons : rejectionReasons).map((r) => (
              <option key={r.id} value={r.value}>
                {r.value}
              </option>
            ))}
          </select>

          <Typography variant="small" className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            Additional comments (optional):
          </Typography>

          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 pr-20 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 resize-none"
              rows={4}
              placeholder="Enter comments or use AI..."
              value={additionalComment}
              onChange={handleCommentChange}
            />

            <div className="absolute bottom-2 right-2 flex gap-1 bg-white dark:bg-gray-800 p-1 md:flex-row flex-col p-1 ">
              <button
                onClick={() => generateReason("approval")}
                disabled={aiLoading}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition disabled:opacity-50"
                title="Generate reason"
              >
                {aiLoading ? <Spinner className="h-4 w-4" /> : <Sparkle size={16} />}
              </button>
              <button
                onClick={rephraseComment}
                disabled={aiLoading || !additionalComment.trim()}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition disabled:opacity-50"
                title="Rephrase"
              >
                <ArrowClockwise size={16} />
              </button>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="outlined" color="red" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            color="green"
            onClick={handleConfirmApproval}
            disabled={!actionComment.trim()}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} handler={setOpenDeleteModal} size="sm">
        <DialogHeader className="text-gray-900 dark:text-gray-200">
          Confirm Request Cancellation
        </DialogHeader>
        <DialogBody>
          <Typography className="font-normal text-sm text-gray-800 dark:text-gray-300 mb-3">
            Are you sure you want to cancel this request? This action cannot be undone.
          </Typography>

          <Typography variant="small" className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            Select a reason:
          </Typography>
          <select
            value={selectedReason}
            onChange={(e) => handleReasonChange(e, true)}
            className="w-full border text-sm font-medium border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 mb-2"
          >
            <option value="">Select Reason</option>
            {deletionReasons.map((r) => (
              <option key={r.id} value={r.value}>
                {r.value}
              </option>
            ))}
          </select>

          <Typography variant="small" className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            Additional comments (optional):
          </Typography>

          <div className="relative">
            <textarea
              className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 pr-20 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 resize-none"
              rows={4}
              placeholder="Enter comments or use AI..."
              value={additionalComment}
              onChange={handleCommentChange}
            />

            <div className="absolute bottom-2 right-2 flex gap-1 bg-white dark:bg-gray-800 p-1 md:flex-row flex-col p-1">
              <button
                onClick={() => generateReason("deletion")}
                disabled={aiLoading}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition disabled:opacity-50"
                title="Generate reason"
              >
                {aiLoading ? <Spinner className="h-4 w-4" /> : <Sparkle size={16} />}
              </button>
              <button
                onClick={rephraseComment}
                disabled={aiLoading || !additionalComment.trim()}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition disabled:opacity-50"
                title="Rephrase"
              >
                <ArrowClockwise size={16} />
              </button>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="outlined" color="gray" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleConfirmDelete}
            disabled={!actionComment.trim()}
          >
            Confirm Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MainTab;
