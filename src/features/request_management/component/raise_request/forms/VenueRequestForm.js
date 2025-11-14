import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Typography, Checkbox, Spinner } from "@material-tailwind/react";
import { AuthContext } from "../../../../authentication";
import { UserContext } from "../../../../../context/UserContext";
import { VenueRequestsContext } from "../../../context/VenueRequestsContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import axios from "axios";
import {
  FloppyDisk,
  Info,
  PencilSimpleLine,
  Plus,
  Prohibit,
  X,
  Sparkle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------
// Gemini initialisation
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

// ---------------------------------------------------------------------
// Markdown → HTML formatter (same as VehicleRequestForm)
// ---------------------------------------------------------------------
const formatResponse = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
    .replace(/•/g, "<li>")
    .replace(/^\d+\.\s/gm, "<strong>$1</strong>")
    .replace(/<li>/g, "</ul><ul><li>")
    .replace(/<\/ul><ul>/g, "")
    .replace(/^/, "<ul>")
    .replace(/$/, "</ul>");
};

const VenueRequestForm = ({ setSelectedRequest }) => {
  const purposeTextareaRef = useRef(null);

  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers } = useContext(UserContext);
  const { venueRequests, fetchVenueRequests } = useContext(VenueRequestsContext);

  const [request, setRequest] = useState({
    requester: user.reference_number,
    organization: "",
    title: "",
    event_nature: "",
    event_nature_other: "",
    event_dates: "",
    event_start_time: "",
    event_end_time: "",
    venue_id: "",
    participants: "",
    pax_estimation: "",
    purpose: "",
    remarks: "",
    details: [],
    approvers: [],
  });

  const requestType = "Venue Request";

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [venueOptions, setVenueOptions] = useState([]);

  const [formErrors, setFormErrors] = useState({});
  const [formWarnings, setFormWarnings] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const addonsList = [
    { id: "Chairs", label: "Chairs" },
    { id: "Tables", label: "Tables" },
    { id: "Microphone", label: "Microphone" },
    { id: "Whiteboard", label: "Whiteboard" },
    { id: "LCD Projector", label: "LCD Projector" },
    { id: "Electric Fan", label: "Electric Fan" },
    { id: "Water Dispenser", label: "Water Dispenser" },
    { id: "LED Monitor", label: "LED Monitor" },
    { id: "Others", label: "Others", isCustom: true },
  ];

  const [selectedAddons, setSelectedAddons] = useState({});

  const handleCheckboxChange = (addonId) => (event) => {
    const isChecked = event.target.checked;
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: isChecked ? { quantity: 1 } : undefined,
    }));

    setRequest((prev) => {
      const newDetails = isChecked
        ? [...prev.details, { particulars: addonId, quantity: 1 }]
        : prev.details.filter((item) => item.particulars !== addonId);
      return { ...prev, details: newDetails };
    });
  };

  const handleQuantityChange = (addonId) => (event) => {
    const quantity = parseInt(event.target.value) || 1;
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: { quantity },
    }));

    setRequest((prev) => {
      const newDetails = prev.details.map((item) =>
        item.particulars === addonId ? { ...item, quantity } : item
      );
      return { ...prev, details: newDetails };
    });
  };

  const handleCustomNameChange = (addonId) => (event) => {
    const customName = event.target.value;
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: { ...prev[addonId], customName },
    }));

    setRequest((prev) => {
      const newDetails = prev.details.map((item) =>
        item.particulars === addonId || item.particulars.startsWith("*")
          ? { ...item, particulars: `*${customName}` }
          : item
      );
      return { ...prev, details: newDetails };
    });
  };

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
    axios.get(`${process.env.REACT_APP_API_URL}/assets/`, { withCredentials: true }).then((response) => {
      const venues = response.data?.filter((a) => a.category === "Venue") || [];
      setVenueOptions(venues);
    });
  }, []);

  const checkBookingConflicts = () => {
    if (!request.venue_id || !request.event_dates || !request.event_start_time || !request.event_end_time) return;

    if (!Array.isArray(venueRequests) || venueRequests.length === 0) {
      setFormErrors((prev) => ({ ...prev, booking: "" }));
      setFormWarnings((prev) => ({ ...prev, booking: "" }));
      return;
    }

    const targetVenueId = Number(request.venue_id);
    const targetDate = Number(request.event_dates.replaceAll("-", "").trim());

    const conflicts = venueRequests.filter((existing) => {
      const existingVenueId = Number(existing.venue_id);
      const existingDate = existing.event_dates
        ? Number(existing.event_dates.replaceAll("-", "").trim())
        : null;

      if (existingVenueId !== targetVenueId || existingDate !== targetDate) return false;

      const newStart = new Date(`1970-01-01T${request.event_start_time}`);
      const newEnd = new Date(`1970-01-01T${request.event_end_time}`);
      const existStart = new Date(`1970-01-01T${existing.event_start_time}`);
      const existEnd = new Date(`1970-01-01T${existing.event_end_time}`);

      const hasOverlap = newStart < existEnd && newEnd > existStart;
      const gracePeriodViolation =
        (newStart >= existStart && newStart < new Date(existEnd.getTime() + 30 * 60000)) ||
        (existStart >= newStart && existStart < new Date(newEnd.getTime() + 30 * 60000));

      return hasOverlap || gracePeriodViolation;
    });

    setFormErrors((prev) => ({ ...prev, booking: "" }));
    setFormWarnings((prev) => ({ ...prev, booking: "" }));

    if (conflicts.length > 0) {
      const approvedConflict = conflicts.some((c) => c.status === "Approved");
      const pendingConflict = conflicts.some((c) => c.status !== "Approved");

      if (approvedConflict) {
        setFormErrors((prev) => ({
          ...prev,
          booking: "Venue is already booked for this date/time!",
        }));
      } else if (pendingConflict) {
        setFormWarnings((prev) => ({
          ...prev,
          booking: "Warning: Pending booking might conflict with your request",
        }));
      }
    }
  };

  useEffect(() => {
    checkBookingConflicts();
  }, [request, venueRequests]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/settings/department`, { withCredentials: true }).then((res) => {
      if (Array.isArray(res.data.departments)) {
        setDepartmentOptions(res.data.departments);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedRequest = { ...request, [name]: value };

    if (name === "event_dates") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const oneWeekFromNow = new Date(); oneWeekFromNow.setDate(today.getDate() + 7); oneWeekFromNow.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value); selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setFormErrors((prev) => ({ ...prev, date: "Event date cannot be in the past." }));
      } else if (selectedDate < oneWeekFromNow) {
        setFormErrors((prev) => ({
          ...prev,
          date: "Requests should be at least one week prior. For urgent requests, please contact the GSO.",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, date: "" }));
      }
    }

    if (name === "event_start_time" || name === "event_end_time") {
      const start = new Date(`1970-01-01T${updatedRequest.event_start_time}`);
      const end = new Date(`1970-01-01T${updatedRequest.event_end_time}`);

      if (updatedRequest.event_start_time && updatedRequest.event_end_time) {
        if (start >= end) {
          setFormErrors((prev) => ({ ...prev, time: "End time must be later than start time." }));
        } else if ((end - start) / (1000 * 60) < 60) {
          setFormErrors((prev) => ({ ...prev, time: "Event duration must be at least 1 hour." }));
        } else {
          setFormErrors((prev) => ({ ...prev, time: "" }));
        }
      }
    }

    setRequest(updatedRequest);
  };

  // AI: Generate Purpose
  const generatePurpose = async (retryCount = 0) => {
    if (!request.title.trim()) return;

    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500; // ms

    setAiLoading(true);

    try {
      const prompt = `Generate a clear, professional purpose (under 80 words) from the requester’s point of view, explaining the reason for holding the event, its objectives, and how the requested venue supports the activity titled: "${request.title}".`;

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

  const submitVenueRequest = async () => {
    try {
      await fetchVenueRequests();

      let requestData = {
        ...request,
        authorized_access: Array.from(
          new Set([
            ...(request.authorized_access || []),
            user.reference_number,
            request.requester,
          ])
        ),
      };

      const requesterId = allUserInfo.find((u) => u.reference_number === request.requester);

      if (request.event_nature === "others" && !request.event_nature_other.trim()) {
        ToastNotification.error("Please specify the event nature.");
        return;
      }

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

      if (request.event_nature === "others") {
        requestData.event_nature = request.event_nature_other.trim();
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/venue_request`, requestData, {
        withCredentials: true,
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchVenueRequests();
        setSelectedRequest("");
        setRequest({
          requester: user.reference_number,
          organization: "",
          title: "",
          event_nature: "",
          event_nature_other: "",
          event_dates: "",
          event_start_time: "",
          event_end_time: "",
          venue_id: "",
          participants: "",
          pax_estimation: "",
          purpose: "",
          remarks: "",
          details: [],
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
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
          {/* Requester & Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Requester</label>
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

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Venue</label>
              <select
                name="venue_id"
                value={request.venue_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                required
              >
                <option value="">Select Venue</option>
                {venueOptions.map((v) => (
                  <option key={v.id} value={v.asset_id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organization & Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Organization</label>
            <input
              type="text"
              name="organization"
              value={request.organization}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              value={request.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Event Nature */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Event Nature</label>
            <select
              name="event_nature"
              value={request.event_nature}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              required
            >
              <option value="">Select Event Nature</option>
              <option value="curricular">Curricular</option>
              <option value="non-curricular">Non-Curricular</option>
              <option value="others">Others</option>
            </select>
            {request.event_nature === "others" && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Please Specify</label>
                <input
                  type="text"
                  name="event_nature_other"
                  value={request.event_nature_other}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                  required
                />
              </div>
            )}
          </div>

          {/* Participants & Pax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Participants</label>
              <input
                type="text"
                name="participants"
                value={request.participants}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Pax Estimation</label>
              <input
                type="number"
                name="pax_estimation"
                value={request.pax_estimation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Event Date</label>
              <input
                type="date"
                name="event_dates"
                value={request.event_dates}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
              {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Start Time</label>
              <input
                type="time"
                name="event_start_time"
                value={request.event_start_time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">End Time</label>
              <input
                type="time"
                name="event_end_time"
                value={request.event_end_time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
              {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
            </div>
          </div>

          {/* Booking Conflicts */}
          <div className="space-y-2">
            {formErrors.booking && (
              <p className="text-red-500 text-xs mt-2 flex items-start gap-1">
                {formErrors.booking}
                <span className="relative flex group">
                  <Info size={14} className="text-red-500 cursor-pointer mt-0.5" weight="duotone" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-white text-gray-700 text-xs border border-red-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <div className="absolute -bottom-1.5 right-2 w-3 h-3 bg-white border-b border-r border-red-200 rotate-45"></div>
                    This means the venue has already been booked for this date and time.
                  </div>
                </span>
              </p>
            )}
            {formWarnings.booking && (
              <p className="text-amber-500 text-xs mt-2 flex items-start gap-1">
                {formWarnings.booking}
                <span className="relative flex group">
                  <Info size={14} className="text-amber-500 cursor-pointer mt-0.5" weight="duotone" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-white text-gray-700 text-xs border border-amber-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <div className="absolute -bottom-1.5 right-2 w-3 h-3 bg-white border-b border-r border-amber-200 rotate-45"></div>
                    A pending request might conflict with your selected schedule.
                  </div>
                </span>
              </p>
            )}
          </div>

          {/* Purpose with AI */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
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
              <div className="absolute bottom-2 right-2 flex gap-1 bg-white dark:bg-gray-800 p-1 flex-col md:flex-row">
                <button
                  onClick={generatePurpose}
                  disabled={aiLoading || !request.title.trim()}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition disabled:opacity-50"
                  title="Generate purpose"
                >
                  {aiLoading ? <Spinner className="h-4 w-4" /> : <Sparkle size={16} />}
                </button>
                <button
                  onClick={rephrasePurpose}
                  disabled={aiLoading || !request.purpose.trim()}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition disabled:opacity-50"
                  title="Rephrase"
                >
                  <ArrowClockwise size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Particulars (Add-ons) */}
          <div className="space-y-2">
            <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">Particulars</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {addonsList.map((addon) => (
                <div key={addon.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={!!selectedAddons[addon.id]}
                      onChange={handleCheckboxChange(addon.id)}
                    />
                    <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">{addon.label}</Typography>
                  </div>
                  {selectedAddons[addon.id] && (
                    <div className="flex gap-2">
                      {addon.isCustom && (
                        <input
                          type="text"
                          value={selectedAddons[addon.id].customName || ""}
                          onChange={handleCustomNameChange(addon.id)}
                          className="w-40 p-1 text-xs border rounded"
                          placeholder="Name"
                        />
                      )}
                      <input
                        type="number"
                        value={selectedAddons[addon.id].quantity}
                        onChange={handleQuantityChange(addon.id)}
                        min="1"
                        className="w-16 p-1 text-xs border rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            color="blue"
            onClick={submitVenueRequest}
            disabled={
              !request.venue_id ||
              !request.organization ||
              !request.title ||
              !request.event_nature ||
              (request.event_nature === "others" && !request.event_nature_other) ||
              !request.event_dates ||
              !request.event_start_time ||
              !request.event_end_time ||
              !request.participants ||
              !request.pax_estimation ||
              !request.purpose ||
              formErrors.date ||
              formErrors.time ||
              formErrors.booking
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

export default VenueRequestForm;