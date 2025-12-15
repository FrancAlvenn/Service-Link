import React, { useContext, useEffect, useState, useRef } from "react";
import { Button, Typography, Spinner } from "@material-tailwind/react";
import {
  Plus,
  FloppyDisk,
  PencilSimpleLine,
  Prohibit,
  X,
  Sparkle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { PurchasingRequestsContext } from "../../../context/PurchasingRequestsContext";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import { GoogleGenAI } from "@google/genai";
import { renderDetailsTable } from "../../../../../utils/emailsTempalte";
import { sendBrevoEmail } from "../../../../../utils/brevo";

// ---------------------------------------------------------------------
// Gemini initialisation (frontend only)
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

const PurchasingRequestForm = ({ setSelectedRequest, prefillData, renderConfidence }) => {
  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers, getUserDepartmentByReferenceNumber } = useContext(UserContext);
  const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const {
    departments,
    designations,
    approvers,
    approvalRulesByDepartment,
    approvalRulesByRequestType,
    approvalRulesByDesignation,
    fetchDepartments,
    fetchDesignations,
    fetchApprovers,
    fetchApprovalRulesByDepartment,
    fetchApprovalRulesByRequestType,
    fetchApprovalRulesByDesignation,
  } = useContext(SettingsContext);

  
  const getDepartmentName = (departments ,departmentId) => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : "";
  }

  const [errorMessage, setErrorMessage] = useState("");
  const [request, setRequest] = useState(() => ({
    requester: user.reference_number,
    title: "",
    date_required: "",
    supply_category: "",
    department: getDepartmentName(departments, getUserDepartmentByReferenceNumber(user.reference_number)),
    purpose: "",
    remarks: "",
    details: [],
    approvers: [],
    ...(prefillData || {}),
  }));
  const [showParticularForm, setShowParticularForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [particularForm, setParticularForm] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [supplyCategories] = useState([
    { id: 1, name: "Office Supplies" },
    { id: 2, name: "Computer Parts / Peripherals" },
    { id: 3, name: "Electrical Supplies" },
    { id: 4, name: "Office Equipment" },
    { id: 5, name: "Tools / Equipment" },
    { id: 6, name: "Other Consumables" },
    { id: 7, name: "Machineries / Parts" },
    { id: 8, name: "Publications" },
    { id: 9, name: "Others" },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const purposeTextareaRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestType = "Purchasing Request";

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchApprovers();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchUsers();
  }, []);

  // Handle AI prefilled data
  useEffect(() => {
    if (prefillData && Object.keys(prefillData).length > 0) {
      setRequest(prev => ({
        ...prev,
        ...prefillData
      }));
    }
  }, [prefillData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentResponse = await axios.get(`${process.env.REACT_APP_API_URL}/settings/department`, {
          withCredentials: true,
        });
        if (Array.isArray(departmentResponse.data.departments)) {
          setDepartmentOptions(departmentResponse.data.departments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date_required") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      if (selectedDate < today) {
        setErrorMessage("Invalid Date. Date cannot be in the past.");
        return;
      }
      if (user.access_level === "user") {
        const oneWeekFromToday = new Date(today);
        oneWeekFromToday.setDate(today.getDate() + 7);
        if (selectedDate < oneWeekFromToday) {
          setErrorMessage(
            "Requests should be at least one week prior. For urgent requests, please contact the GSO."
          );
          setRequest({ ...request, [name]: "" });
          return;
        }
      }
    }
    setErrorMessage("");
    setRequest({ ...request, [name]: value });
  };

  const handleParticularFormChange = (e) => {
    setParticularForm({ ...particularForm, [e.target.name]: e.target.value });
  };

  const handleAddParticular = () => {
    setShowParticularForm(true);
    setEditingIndex(null);
    setParticularForm({ particulars: "", quantity: "", description: "" });
  };

  const handleSaveParticular = () => {
    const { particulars, quantity, description } = particularForm;
    if (!particulars || !quantity || parseInt(quantity) < 1) {
      ToastNotification.error("Error", "Particulars and a valid quantity are required.");
      return;
    }

    const newDetail = {
      particulars,
      quantity: parseInt(quantity),
      description,
    };

    setRequest((prev) => {
      if (editingIndex !== null) {
        const updatedDetails = [...prev.details];
        updatedDetails[editingIndex] = newDetail;
        return { ...prev, details: updatedDetails };
      }
      return { ...prev, details: [...prev.details, newDetail] };
    });

    setShowParticularForm(false);
    setParticularForm({ particulars: "", quantity: "", description: "" });
    setEditingIndex(null);
  };

  const handleEditClick = (index) => {
    setShowParticularForm(true);
    setEditingIndex(index);
    setParticularForm({ ...request.details[index] });
  };

  const handleDetailRemove = (index) => {
    setRequest((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const handleCancelParticular = () => {
    setShowParticularForm(false);
    setParticularForm({ particulars: "", quantity: "", description: "" });
    setEditingIndex(null);
  };
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };
  const removeAttachmentAt = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // AI: Generate Purpose from Title
    const generatePurpose = async (retryCount = 0) => {
    if (!request.title.trim()) return;

    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500; // ms

    setAiLoading(true);

    try {
      const prompt = `As the requester, write a clear and concise purpose statement (under 80 words) explaining why I am submitting this purchasing request, including what the items or services will be used for and how they support current operations or objectives, based on the title: “${request.title}”.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setRequest((prev) => ({ ...prev, purpose: text }));
      }
    } catch (err) {
      console.error("Gemini Error:", err);

      // Check if it's a 503 or network-related error
      const isUnavailable =
        err?.status === 503 ||
        err?.code === "ECONNABORTED" ||
        err?.message?.includes("network") ||
        err?.message?.includes("timeout") ||
        err?.message?.includes("unavailable");

      if (isUnavailable && retryCount < MAX_RETRIES) {
        // Auto-retry with delay
        setTimeout(() => {
          generatePurpose(retryCount + 1);
        }, RETRY_DELAY);
        return;
      }

      // Final failure — show friendly message
      const message = isUnavailable
        ? "AI service is temporarily unavailable. Please try again later."
        : "Failed to generate purpose. Please try again.";

      ToastNotification.error("AI Unavailable", message);
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Rephrase Purpose
  const rephrasePurpose = async (retryCount = 0) => {
    if (!request.purpose.trim()) return;

    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500;

    setAiLoading(true);
    try {
      const prompt = `Rephrase professionally and concisely (under 80 words):\n"${request.purpose}"`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) setRequest((prev) => ({ ...prev, purpose: text }));
    } catch (err) {
      console.error("Gemini Error:", err);

      // Check if it's a 503 or network-related error
      const isUnavailable =
        err?.status === 503 ||
        err?.code === "ECONNABORTED" ||
        err?.message?.includes("network") ||
        err?.message?.includes("timeout") ||
        err?.message?.includes("unavailable");

      if (isUnavailable && retryCount < MAX_RETRIES) {
        // Auto-retry with delay
        setTimeout(() => {
          generatePurpose(retryCount + 1);
        }, RETRY_DELAY);
        return;
      }

      // Final failure — show friendly message
      const message = isUnavailable
        ? "AI service is temporarily unavailable. Please try again later."
        : "Failed to generate purpose. Please try again.";

      ToastNotification.error("AI Unavailable", message);
    } finally {
      setAiLoading(false);
    }
  };

const [isDataReady, setIsDataReady] = useState(false);

useEffect(() => {
  const ready =
    allUserInfo != null &&
    departments != null &&
    approvers != null &&
    approvalRulesByDepartment != null &&
    approvalRulesByRequestType != null && 
    approvalRulesByDesignation != null && 
    departmentOptions != null; 

  setIsDataReady(ready);
}, [
  allUserInfo,
  departments,
  approvers,
  approvalRulesByDepartment,
  approvalRulesByRequestType,
  approvalRulesByDesignation,
  departmentOptions,
]);

  const submitPurchasingRequest = async () => {
    try {
      const formattedDate = request.date_required
        ? new Date(request.date_required).toISOString().split("T")[0]
        : null;
      let requestData = {
        ...request,
        date_required: formattedDate,
        authorized_access: Array.from(
          new Set([
            ...(request.authorized_access || []),
            user.reference_number,
            request.requester,
          ])
        ),
      };

      const requesterId = allUserInfo.find(
        (u) => u.reference_number === request.requester
      );

      requestData = assignApproversToRequest({
        requestType,
        requestInformation: requestData,
        approvers,
        approvalRulesByDepartment,
        approvalRulesByDesignation,
        approvalRulesByRequestType,
        department_id: requesterId?.department_id,
        designation_id: requesterId?.designation_id,
      });

      const fd = new FormData();
      Object.entries(requestData).forEach(([k, v]) => {
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : v ?? "");
      });
      attachments.forEach((f) => fd.append("attachments", f));
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/purchasing_request`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchPurchasingRequests();
        setSelectedRequest("");

        const detailsHtml = renderDetailsTable(request.details);

        try {
          await sendBrevoEmail({
            to: [
              {
                email: user?.email,
                name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "",
              },
            ],

            templateId: 6, // Your Purchasing Request Template
            params: {
              requester_name: `${user.first_name} ${user.last_name}`.trim(),
              department: request?.department_name || "N/A",
              title: request.title,
              date_required: formattedDate,
              supply_category: request.supply_category || "N/A",
              purpose: request.purpose || "N/A",
              remarks: request.remarks || "None",
              details_table: detailsHtml || "<p>No details provided</p>",
            },
          });

          console.log("Purchasing request email sent to:", user?.email);
        } catch (emailErr) {
          console.warn("Purchasing request saved, but email notification failed:", emailErr);
        }
        
        setRequest({
          requester: user.reference_number,
          title: "",
          date_required: "",
          supply_category: "",
          purpose: "",
          remarks: "",
          details: [],
          approvers: [],
        });
        setAttachments([]);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Error submitting purchasing request:", error);
      ToastNotification.error("Error", "Failed to submit request.");
    }
  };

  return (
    <div className="py-2 text-sm space-y-4 overflow-y-auto">
      {!isDataReady ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="h-8 w-8 mb-3" />
          <Typography className="text-sm text-gray-600">
            Loading ...
          </Typography>
        </div>
      ) : (
        <>
          {/* Requester */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requester
              </label>
              {user.access_level === "admin" ? (
                <select
                  name="requester"
                  value={request.requester || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  required
                >
                  <option value="">Select Requester</option>
                  {allUserInfo.map((u) => (
                    <option key={u.reference_number} value={u.reference_number}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={getUserByReferenceNumber(user.reference_number)}
                    readOnly
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  />
                  <input type="hidden" name="requester" value={user.reference_number} />
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={request.title || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              required
            />
          </div>

          {/* Date Required */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Required
            </label>
            <input
              type="date"
              name="date_required"
              min={
                user.access_level === "admin"
                  ? new Date().toISOString().split("T")[0]
                  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
              }
              value={request.date_required || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              required
            />
            {errorMessage && (
              <p className="text-red-500 font-semibold text-xs pt-1">{errorMessage}</p>
            )}
          </div>

          {/* Supply Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supply Category
            </label>
            <select
              name="supply_category"
              value={request.supply_category || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              required
            >
              <option value="">Select Category</option>
              {supplyCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose with AI */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purpose
            </label>

            <div className="relative">
              <textarea
                ref={purposeTextareaRef}
                name="purpose"
                value={request.purpose}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 md:pr-20 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 resize-none"
                rows={4}
                placeholder="Enter purpose or use AI (note: a title is required to generate with AI)..."
                required
              />

              {/* Floating AI Buttons */}
              <div className="absolute bottom-2 right-2 flex gap-1 bg-white dark:bg-gray-800 p-1 md:flex-row flex-col p-1">
                <button
                  onClick={generatePurpose}
                  disabled={aiLoading || !request.title.trim()}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition disabled:opacity-50"
                  title="Generate purpose from title"
                >
                  {aiLoading ? <Spinner className="h-4 w-4" /> : <Sparkle size={16} />}
                </button>
                <button
                  onClick={rephrasePurpose}
                  disabled={aiLoading || !request.purpose.trim()}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition disabled:opacity-50"
                  title="Rephrase purpose"
                >
                  <ArrowClockwise size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Particulars Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Particulars
              </Typography>
              <Button
                color="green"
                variant="ghost"
                onClick={handleAddParticular}
                className="flex text-xs items-center gap-1 px-3 py-2 border rounded-md hover:bg-green-600 dark:border-gray-600 normal-case"
              >
                <Plus size={15} />
                <Typography className="text-xs font-semibold">Add Particular</Typography>
              </Button>
            </div>

            {showParticularForm && (
              <div className="grid grid-cols-1 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Particulars / Items Description / Specifications
                  </label>
                  <input
                    type="text"
                    name="particulars"
                    value={particularForm.particulars}
                    onChange={handleParticularFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={particularForm.quantity}
                    onChange={handleParticularFormChange}
                    min="1"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={particularForm.description}
                    onChange={handleParticularFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-3 col-span-full ml-auto">
                  <Button
                    color="green"
                    onClick={handleSaveParticular}
                    className="flex items-center gap-1 px-2 py-1 normal-case"
                  >
                    <FloppyDisk size={18} />
                    <Typography className="text-xs font-semibold">Save</Typography>
                  </Button>
                  <Button
                    color="red"
                    variant="outlined"
                    onClick={handleCancelParticular}
                    className="flex items-center gap-1 px-2 py-1 border rounded-md hover:text-red-500 dark:border-gray-600 normal-case"
                  >
                    <Prohibit size={18} />
                    <Typography className="text-xs font-semibold">Cancel</Typography>
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto pt-3">
              <table className="min-w-full text-left text-sm border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold">Item</th>
                    <th className="px-4 py-2 text-xs font-semibold">Quantity</th>
                    <th className="px-4 py-2 text-xs font-semibold">Description</th>
                    <th className="px-4 py-2 text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {request.details.map((detail, index) => (
                    <tr key={index} className="border-t border-gray-300 dark:border-gray-600">
                      <td className="px-4 py-2">{detail.particulars}</td>
                      <td className="px-4 py-2">x{detail.quantity}</td>
                      <td className="px-4 py-2">{detail.description}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button className="text-blue-500" onClick={() => handleEditClick(index)}>
                          <PencilSimpleLine size={18} />
                        </button>
                        <button className="text-red-500" onClick={() => handleDetailRemove(index)}>
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={request.remarks}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments</label>
            <input type="file" multiple onChange={handleFilesSelected} className="text-sm" />
            {attachments.length > 0 && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2">
                {attachments.map((f, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1">
                    <span>{f.name} ({Math.round(f.size/1024)} KB)</span>
                    <button className="text-red-500" onClick={() => removeAttachmentAt(i)}><X size={14} /></button>
                  </div>
                ))}
                {uploadProgress > 0 && <div className="text-xs mt-1">Uploading: {uploadProgress}%</div>}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            color="blue"
            onClick={submitPurchasingRequest}
            disabled={
              !request.title ||
              !request.date_required ||
              !request.supply_category ||
              !request.purpose ||
              errorMessage
            }
            className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
          >
            Submit Request
          </Button>
          </>
      )}
    </div>
  );
};

export default PurchasingRequestForm;
