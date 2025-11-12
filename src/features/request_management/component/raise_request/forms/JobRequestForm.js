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
import { JobRequestsContext } from "../../../context/JobRequestsContext";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import { classifyJobRequest } from "../../../utils/classifyJobRequest";
import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------
// Gemini initialisation (frontend only)
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

const JobRequestForm = ({ setSelectedRequest }) => {
  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers } = useContext(UserContext);
  const { fetchJobRequests } = useContext(JobRequestsContext);
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

  const [errorMessage, setErrorMessage] = useState("");
  const [request, setRequest] = useState({
    requester: user.reference_number,
    title: "",
    job_category: "",
    date_required: "",
    purpose: "",
    remarks: "",
    details: [],
    approvers: [],
  });
  const [showParticularForm, setShowParticularForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [particularForm, setParticularForm] = useState({
    particulars: "",
    quantity: "",
    description: "",
    remarks: "",
  });
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const purposeTextareaRef = useRef(null);

  const requestType = "Job Request";

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchApprovers();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchUsers();
  }, []);

  useEffect(() => {
    const category = classifyJobRequest({
      title: request.title,
      description: request.description,
      remarks: request.remarks,
      purpose: request.purpose,
    });
    setRequest((prev) => ({ ...prev, job_category: category }));
  }, [request.title, request.description, request.remarks, request.purpose]);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/settings/department`, {
          withCredentials: true,
        });
        if (Array.isArray(response.data.departments)) {
          setDepartmentOptions(response.data.departments);
        }
      } catch (error) {
        console.error("Error fetching department options:", error);
      }
    };
    getDepartments();
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
    setParticularForm({ particulars: "", quantity: "", description: "", remarks: "" });
  };

  const handleSaveParticular = () => {
    const { particulars, quantity, description, remarks } = particularForm;
    if (!particulars || !quantity || parseInt(quantity) < 1) {
      ToastNotification.error("Error", "Particulars and a valid quantity are required.");
      return;
    }

    const newDetail = {
      particulars,
      quantity: parseInt(quantity),
      description,
      remarks,
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
    setParticularForm({ particulars: "", quantity: "", description: "", remarks: "" });
    setEditingIndex(null);
  };

  const handleEditClick = (index) => {
    setShowParticularForm(true);
    setEditingIndex(index);
    setParticularForm({ ...request.details[index] });
  };

  const handleDetailRemove = (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest((prev) => ({ ...prev, details: updatedDetails }));
  };

  const handleCancelParticular = () => {
    setShowParticularForm(false);
    setParticularForm({ particulars: "", quantity: "", description: "", remarks: "" });
    setEditingIndex(null);
  };

  // AI: Generate Purpose from Title
  const generatePurpose = async () => {
    if (!request.title.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `As the requester, write a clear and concise purpose statement (under 80 words) explaining why I am submitting this job request and what I aim to accomplish through it, based on the title: “${request.title}”.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setRequest((prev) => ({ ...prev, purpose: text }));
      }
    } catch (err) {
      ToastNotification.error("AI Error", "Failed to generate purpose.");
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Rephrase Purpose
  const rephrasePurpose = async () => {
    if (!request.purpose.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Rephrase this purpose professionally and concisely (under 80 words):\n"${request.purpose}"`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setRequest((prev) => ({ ...prev, purpose: text }));
      }
    } catch (err) {
      ToastNotification.error("AI Error", "Failed to rephrase purpose.");
    } finally {
      setAiLoading(false);
    }
  };

  const submitJobRequest = async () => {
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

      const response = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}/job_request`,
        data: requestData,
        withCredentials: true,
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchJobRequests();
        setSelectedRequest("");
        setRequest({
          requester: user.reference_number,
          title: "",
          job_category: "",
          date_required: "",
          purpose: "",
          remarks: "",
          details: [],
          approvers: [],
        });
      }
    } catch (error) {
      console.error("Error submitting job request:", error);
      ToastNotification.error("Error", "Failed to submit request.");
    }
  };

  return (
    <div className="py-2 text-sm space-y-4 overflow-y-auto">
      {/* Requester & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
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
          value={request.date_required || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
        {errorMessage && (
          <p className="text-red-500 font-semibold text-xs pt-1">{errorMessage}</p>
        )}
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 md:p-20 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 resize-none"
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
                Particulars
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
                Description / Nature of Work
              </label>
              <textarea
                name="description"
                value={particularForm.description}
                onChange={handleParticularFormChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={particularForm.remarks}
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
                className="flex items-center gap-1 px-2 py-1 border rounded-md hover:text-red-500 dark:border-gray-600"
              >
                <Prohibit size={18} />
                <Typography className="text-xs font-semibold normal-case">Cancel</Typography>
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto pt-3">
          <table className="min-w-full text-left text-sm border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold">Quantity</th>
                <th className="px-4 py-2 text-xs font-semibold">Particulars</th>
                <th className="px-4 py-2 text-xs font-semibold">Description / Nature of Work</th>
                <th className="px-4 py-2 text-xs font-semibold">Remarks</th>
                <th className="px-4 py-2 text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {request.details.map((detail, index) => (
                <tr key={index} className="border-t border-gray-300 dark:border-gray-600">
                  <td className="px-4 py-2">x{detail.quantity}</td>
                  <td className="px-4 py-2">{detail.particulars}</td>
                  <td className="px-4 py-2">{detail.description}</td>
                  <td className="px-4 py-2">{detail.remarks}</td>
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 pt-1">
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

      {/* Submit */}
      <Button
        color="blue"
        onClick={submitJobRequest}
        disabled={!request.title || !request.date_required || !request.purpose || errorMessage}
        className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
      >
        Submit Job Request
      </Button>
    </div>
  );
};

export default JobRequestForm;