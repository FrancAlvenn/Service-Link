import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Typography, Spinner, Collapse } from "@material-tailwind/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { VehicleRequestsContext } from "../../../context/VehicleRequestsContext";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import MapboxAddressPicker from "../../../../../components/map_address_picker/MapboxAddressPicker";
import { GoogleGenAI } from "@google/genai";
import { Sparkle, ArrowClockwise, MapPin, Info, X } from "@phosphor-icons/react";

// ---------------------------------------------------------------------
// Gemini initialisation
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

const ORIGIN = "Binang 2nd, Bocaue, Bulacan, Philippines";

const VehicleRequestForm = ({ setSelectedRequest }) => {
  const mapboxAddressPickerRef = useRef();
  const purposeTextareaRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [aiLoadingAnalytics, setAiLoadingAnalytics] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [travelAnalytics, setTravelAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers } = useContext(UserContext);
  const { fetchVehicleRequests } = useContext(VehicleRequestsContext);

  const [request, setRequest] = useState({
    requester: user.reference_number,
    title: "",
    vehicle_requested: "",
    date_filled: new Date().toISOString().split("T")[0],
    date_of_trip: "",
    time_of_departure: "",
    time_of_arrival: "",
    number_of_passengers: "",
    destination: "",
    destination_coordinates: "",
    purpose: "",
    remarks: "",
    approvers: [],
  });

  const requestType = "Vehicle Request";

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});

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
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_URL}/assets/`,
      withCredentials: true,
    })
      .then((res) => {
        const vehicles = res.data.filter((a) => a.asset_type === "Vehicle");
        setVehicleOptions(vehicles);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptRes = await axios.get(`${process.env.REACT_APP_API_URL}/settings/department`, {
          withCredentials: true,
        });
        if (Array.isArray(deptRes.data.departments)) {
          setDepartmentOptions(deptRes.data.departments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...formErrors };

    if (name === "date_of_trip") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const selected = new Date(value);
      if (selected < today) {
        newErrors.date_of_trip = "Date cannot be in the past.";
      } else if (user.access_level === "user") {
        const oneWeek = new Date(today); oneWeek.setDate(today.getDate() + 7);
        if (selected < oneWeek) {
          newErrors.date_of_trip = "Requests should be at least one week prior. For urgent requests, contact GSO.";
        } else delete newErrors.date_of_trip;
      } else delete newErrors.date_of_trip;
    }

    if (name === "time_of_departure" || name === "time_of_arrival") {
      const temp = { ...request, [name]: value };
      if (temp.time_of_departure && temp.time_of_arrival && temp.time_of_departure >= temp.time_of_arrival) {
        newErrors.time = "Departure must be earlier than arrival.";
      } else delete newErrors.time;
    }

    setFormErrors(newErrors);
    setRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleDestinationSelect = (place) => {
    setRequest((prev) => ({
      ...prev,
      destination: place.place_name,
      destination_coordinates: place.coordinates,
    }));
    setSelectedLocation(place);
    // Do NOT auto-show analytics
  };

  // AI: Generate Purpose
  const generatePurpose = async (retryCount = 0) => {
    if (!request.title.trim()) return;

    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500; // ms

    setAiLoading(true);

    try {
      const prompt = `Generate a clear, professional purpose (under 80 words) from the requester’s point of view, explaining the reason, destination, and objective of the vehicle request titled: "${request.title}".`;

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

  // AI: Travel Analytics (triggered by button)

  const generateTravelAnalytics = async (retryCount = 0) => {
    if (!selectedLocation || !request.time_of_departure || !request.date_of_trip) return;

    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500; // ms

    setAiLoading(true);
    setShowAnalytics(true);

    try {
      const prompt = `
        You are a travel logistics assistant. Analyze a trip from:
        - Origin: ${ORIGIN}
        - Destination: ${selectedLocation.place_name}
        - Departure time: ${request.time_of_departure}
        - Date: ${request.date_of_trip}

        Provide **only** the following in **exact markdown format** (no extra text):

        * **Estimated travel time (with traffic):** [range, e.g. 2 hours 30 minutes - 3 hours 30 minutes]
        * **Distance:** Approximately [range, e.g. 50-55 km]
        * **Recommended departure buffer:** [range, e.g. 1 hour - 1 hour 30 minutes] (beyond the estimated travel time, due to [reason])
        * **Fuel cost estimate (PHP):** PHP [range, e.g. 260 - 280] (one-way)
        * **Safety notes:**
          * **Traffic:** [detailed traffic note]
          * **Weather:** [detailed weather note]

        Use real-time traffic logic for the given time and date.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const raw = result.text?.trim();
      const html = formatResponse(raw || "No insights available.");
      setTravelAnalytics(html);
    } catch (err) {
      console.error("Gemini Travel Analytics Error:", err);
      const isUnavailable =
        err?.status === 503 ||
        err?.code === "ECONNABORTED" ||
        /network|timeout|unavailable/i.test(err?.message ?? "");

      if (isUnavailable && retryCount < MAX_RETRIES) {
        setTimeout(() => generateTravelAnalytics(retryCount + 1), RETRY_DELAY);
        return;
      }

      const message = isUnavailable
        ? "AI travel service is temporarily unavailable. Please try again later."
        : "Failed to retrieve travel insights. Please try again.";

      ToastNotification.error("AI Unavailable", message);
      setTravelAnalytics(formatResponse(message));
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


  const submitVehicleRequest = async () => {
    try {
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
        url: `${process.env.REACT_APP_API_URL}/vehicle_request`,
        data: requestData,
        withCredentials: true,
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchVehicleRequests();
        setSelectedRequest("");
        setRequest({
          requester: user.reference_number,
          title: "",
          vehicle_requested: "",
          date_filled: new Date().toISOString().split("T")[0],
          date_of_trip: "",
          time_of_departure: "",
          time_of_arrival: "",
          number_of_passengers: "",
          destination: "",
          purpose: "",
          remarks: "",
        });
        setTravelAnalytics(null);
        setShowAnalytics(false);
      }
    } catch (error) {
      console.error("Error submitting vehicle request:", error);
      ToastNotification.error("Error", "Failed to submit request.");
    }
  };

  // Helper: can show analytics?
  const canShowAnalytics =
    !!request.destination &&
    !!request.time_of_departure &&
    !!request.date_of_trip;

  return (
    <div className="py-2 text-sm space-y-4">
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
            />
          </div>

          {/* Destination + Analytics Button */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destination
            </label>
            <MapboxAddressPicker
              ref={mapboxAddressPickerRef}
              onSelect={handleDestinationSelect}
              token={process.env.REACT_APP_MAPBOX_TOKEN}
            />
            <input
              type="hidden"
              name="destination_coordinates"
              value={request.destination_coordinates ? JSON.stringify(request.destination_coordinates) : ""}
            />

            {/* Show Analytics Button */}
            <div className="mt-2">
              <Button
                size="sm"
                color="indigo"
                variant="outlined"
                onClick={generateTravelAnalytics}
                disabled={!canShowAnalytics || aiLoadingAnalytics}
                className="flex items-center gap-1 text-xs normal-case"
              >
                {aiLoadingAnalytics ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Info size={16} />
                    Show Travel Insights
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Travel Analytics Panel */}
          <Collapse open={showAnalytics && !!travelAnalytics}>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-md">
              <div className="flex justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={18} className="text-indigo-600" />
                  <Typography className="font-semibold text-sm text-indigo-800 dark:text-indigo-200">
                    AI Travel Insights
                  </Typography>
                </div>
                <div className=""> 
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => setShowAnalytics(false)}
                    className="text-indigo-600 hover:text-indigo-800"  
                  >
                    Close
                  </Button>
                </div>
              </div>

              {aiLoadingAnalytics ? (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Spinner className="h-4 w-4" />
                  Analyzing route...
                </div>
              ) : (
                <div
                  className="text-xs text-gray-700 dark:text-gray-300 font-sans space-y-1"
                  dangerouslySetInnerHTML={{ __html: travelAnalytics }}
                />
              )}
            </div>
          </Collapse>

          {/* Date, Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Trip
              </label>
              <input
                type="date"
                name="date_of_trip"
                value={request.date_of_trip || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                required
              />
              {formErrors.date_of_trip && (
                <p className="text-xs text-red-500">{formErrors.date_of_trip}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time of Departure
              </label>
              <input
                type="time"
                name="time_of_departure"
                value={request.time_of_departure || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time of Arrival
              </label>
              <input
                type="time"
                name="time_of_arrival"
                value={request.time_of_arrival || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
              {formErrors.time && (
                <p className="text-xs text-red-500 col-span-3">{formErrors.time}</p>
              )}
            </div>
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Passengers
            </label>
            <input
              type="number"
              name="number_of_passengers"
              value={request.number_of_passengers || ""}
              onChange={handleChange}
              min="1"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            />
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
              <div className="absolute bottom-2 right-2 flex gap-1 bg-white dark:bg-gray-800 p-1 md:flex-row flex-col">
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

          {/* Submit */}
          <Button
            color="blue"
            onClick={submitVehicleRequest}
            disabled={
              !request.title ||
              !request.destination ||
              !request.date_of_trip ||
              !request.time_of_departure ||
              !request.time_of_arrival ||
              !request.number_of_passengers ||
              !request.purpose ||
              Object.keys(formErrors).length > 0
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


const formatResponse = (text) => {
  // Handle bold formatting
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Split into lines
  const lines = formatted.split("\n");

  let html = "";
  let listDepth = 0;

  for (let line of lines) {
    const trimmed = line.trim();

    // Detect indentation level (2 or 4 spaces = nested)
    const indentLevel = (line.match(/^\s+/)?.[0].length || 0) / 2;

    // Close or open <ul> based on indentation change
    while (indentLevel < listDepth) {
      html += "</ul>";
      listDepth--;
    }
    while (indentLevel > listDepth) {
      html += "<ul>";
      listDepth++;
    }

    // Convert lines starting with * or • into list items
    if (/^[•*]/.test(trimmed)) {
      html += `<li>${trimmed.replace(/^[•*]\s*/, "")}</li>`;
    } else if (trimmed.length > 0) {
      html += `<p>${trimmed}</p>`;
    }
  }

  // Close any remaining lists
  while (listDepth > 0) {
    html += "</ul>";
    listDepth--;
  }

  return html;
};


export default VehicleRequestForm;