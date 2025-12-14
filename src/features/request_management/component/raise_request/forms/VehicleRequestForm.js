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
import { Sparkle, ArrowClockwise, MapPin, Info, X, CaretLeft, CaretRight, Calendar } from "@phosphor-icons/react";
import { renderDetailsTable } from "../../../../../utils/emailsTempalte";
import { sendBrevoEmail } from "../../../../../utils/brevo";
import { useFeatureFlags } from "../../../../../context/FeatureFlagsContext";

// ---------------------------------------------------------------------
// Gemini initialisation
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

const ORIGIN = "Binang 2nd, Bocaue, Bulacan, Philippines";

/**
 * @param {{
 *  setSelectedRequest: (val: any) => void,
 *  prefillData?: object,
 *  renderConfidence?: (field: string) => React.ReactNode
 * }} props
 *
 * Behavior:
 * - The attachments upload UI mounts only when `ENABLE_FILE_ATTACHMENTS` is true.
 *   When disabled, no file-related DOM nodes are rendered.
 */
const VehicleRequestForm = ({ setSelectedRequest, prefillData, renderConfidence }) => {
  const { ENABLE_FILE_ATTACHMENTS } = useFeatureFlags();
  const mapboxAddressPickerRef = useRef();
  const purposeTextareaRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [aiLoadingAnalytics, setAiLoadingAnalytics] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [travelAnalytics, setTravelAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers, getUserDepartmentByReferenceNumber } = useContext(UserContext);
  const { vehicleRequests, fetchVehicleRequests } = useContext(VehicleRequestsContext);

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

  const [request, setRequest] = useState(() => ({
    requester: user.reference_number,
    title: "",
    vehicle_id: "",
    department: getDepartmentName(departments, getUserDepartmentByReferenceNumber(user.reference_number)),
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
    ...(prefillData || {}),
  }));

  const requestType = "Vehicle Request";

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formWarnings, setFormWarnings] = useState({});
  
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [vehicleUnavailability, setVehicleUnavailability] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month"); // "month" or "day"
  const [selectedDay, setSelectedDay] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachmentsMeta, setAttachmentsMeta] = useState([]);
  const [isProcessingMeta, setIsProcessingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchApprovers();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Fetch vehicles from vehicles API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
          withCredentials: true,
        });

        // Filter only available vehicles
        const data = response?.data || [];
        const availableVehicles = Array.isArray(data)
          ? data.filter((vehicle) => vehicle?.status === "Available")
          : [];

        setVehicleOptions(availableVehicles);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        setVehicleOptions([]);
      }
    };

    fetchVehicles();
  }, []);
  
  // Fetch vehicle requests once when component mounts
  useEffect(() => {
    fetchVehicleRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch bookings and unavailability when vehicle is selected
  useEffect(() => {
  const fetchVehicleSchedule = async () => {
      if (!request.vehicle_id) {
        setVehicleBookings([]);
        setVehicleUnavailability([]);
        return;
      }

      try {
        // Fetch bookings
        const bookingsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/vehicle-bookings/vehicle/${request.vehicle_id}`,
          { withCredentials: true }
        );
        setVehicleBookings(bookingsResponse.data || []);

        // Fetch unavailability
        const unavailabilityResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/vehicle-unavailability/vehicle/${request.vehicle_id}`,
          { withCredentials: true }
        );
        setVehicleUnavailability(unavailabilityResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch vehicle schedule:", error);
        setVehicleBookings([]);
        setVehicleUnavailability([]);
      }
    };

    fetchVehicleSchedule();
  }, [request.vehicle_id]);

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

  const checkBookingConflicts = () => {
    if (!request.vehicle_id || !request.date_of_trip || !request.time_of_departure || !request.time_of_arrival) {
      setFormErrors((prev) => ({ ...prev, booking: "" }));
      setFormWarnings((prev) => ({ ...prev, booking: "" }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, booking: "" }));
    setFormWarnings((prev) => ({ ...prev, booking: "" }));

    const targetDate = request.date_of_trip;
    const newStart = new Date(`${targetDate}T${request.time_of_departure}`);
    const newEnd = new Date(`${targetDate}T${request.time_of_arrival}`);

    // Check against confirmed bookings
    const bookingConflict = Array.isArray(vehicleBookings) && vehicleBookings.some((booking) => {
      if (booking.booking_date !== targetDate) return false;
      const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`);
      const bookingEnd = new Date(`${booking.booking_date}T${booking.end_time || booking.start_time}`);
      return newStart < bookingEnd && newEnd > bookingStart;
    });

    // Check against unavailability
    const unavailabilityConflict = Array.isArray(vehicleUnavailability) && vehicleUnavailability
      .filter((unav) => unav.status === "Active")
      .some((unav) => {
        const unavStart = new Date(unav.start_date);
        unavStart.setHours(0, 0, 0, 0);
        const unavEnd = new Date(unav.end_date);
        unavEnd.setHours(23, 59, 59, 999);
        return newStart < unavEnd && newEnd > unavStart;
      });

    // Check against pending requests
    const requestConflict = Array.isArray(vehicleRequests) ? vehicleRequests.filter((existing) => {
      const existingVehicleId = Number(existing.vehicle_id);
      const targetVehicleId = Number(request.vehicle_id);
      if (existingVehicleId !== targetVehicleId || existing.date_of_trip !== targetDate) return false;

      const existStart = new Date(`1970-01-01T${existing.time_of_departure}`);
      const existEnd = new Date(`1970-01-01T${existing.time_of_arrival || existing.time_of_departure}`);
      const hasOverlap = newStart < existEnd && newEnd > existStart;
      return hasOverlap;
    }) : [];

    if (bookingConflict || unavailabilityConflict) {
      setFormErrors((prev) => ({
        ...prev,
        booking: "Vehicle is already booked or unavailable for this date/time!",
      }));
    } else if (requestConflict.length > 0) {
      const approvedConflict = requestConflict.some((c) => c.status === "Approved");
      if (approvedConflict) {
        setFormErrors((prev) => ({
          ...prev,
          booking: "Vehicle is already booked for this date/time!",
        }));
      } else {
        setFormWarnings((prev) => ({
          ...prev,
          booking: "Warning: Pending booking might conflict with your request",
        }));
      }
    }
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    setIsProcessingMeta(true);
    setAttachments((prev) => [...prev, ...files]);
    try {
      const meta = files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
      }));
      setAttachmentsMeta((prev) => [...prev, ...meta]);
    } finally {
      setIsProcessingMeta(false);
    }
  };
  const removeAttachmentAt = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachmentsMeta((prev) => prev.filter((_, i) => i !== idx));
  };
  useEffect(() => {
    checkBookingConflicts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, vehicleRequests, vehicleBookings, vehicleUnavailability]);

  // Add event listeners for mouse up outside when dragging
  useEffect(() => {
    if (dragging) {
      const handleMouseUp = () => {
        setDragging(false);
      };
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragging]);

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
      if (value) {
        const [hours, minutes] = value.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes;

        const minMinutes = 4 * 60;     // 04:00
        const maxMinutes = 19 * 60;    // 19:00

        if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
          newErrors.time = "Time must be between 4:00 AM and 7:00 PM.";
        } else {
          delete newErrors.time;
        }
      }

      // Existing departure < arrival check
      const temp = { ...request, [name]: value };
      if (temp.time_of_departure && temp.time_of_arrival) {
        if (temp.time_of_departure >= temp.time_of_arrival) {
          newErrors.time = "Departure must be earlier than arrival.";
        }
      }
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

      const fd = new FormData();
      Object.entries(requestData).forEach(([k, v]) => {
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : v ?? "");
      });
      if (ENABLE_FILE_ATTACHMENTS) {
        if (attachmentsMeta.length) {
          fd.append("attachments_meta", JSON.stringify(attachmentsMeta));
        }
        attachments.forEach((f) => fd.append("attachments", f));
      }
      setIsSubmitting(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/vehicle_request`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchVehicleRequests();
        setSelectedRequest("");
        setAttachments([]);
        setUploadProgress(0);
        
        const detailsHtml = renderDetailsTable(request.details);

        try {
          await sendBrevoEmail({
            to: [
              {
                email: user?.email,
                name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "",
              },
            ],

            templateId: 7, // Vehicle Request Notification Template
            params: {
              requester_name: `${user.first_name} ${user.last_name}`.trim(),
              title: request.title || "Vehicle Request",
              destination: request.destination || "N/A",
              date_of_trip: request.date_of_trip || "Not specified",
              time_of_departure: request.time_of_departure || "Not specified",
              time_of_arrival: request.time_of_arrival || "Not specified",
              number_of_passengers: request.number_of_passengers || "Not specified",
              purpose: request.purpose || "N/A",
              remarks: request.remarks || "None",
            },
          });

          console.log("Vehicle request email sent to:", user?.email);
        } catch (emailErr) {
          console.warn("Vehicle request saved successfully, but email notification failed:", emailErr);
          // Optional: toast.warning("Request submitted, but email could not be sent.");
        }

        setRequest({
          requester: user.reference_number,
          title: "",
          vehicle_id: "",
          date_filled: new Date().toISOString().split("T")[0],
          date_of_trip: "",
          time_of_departure: "",
          time_of_arrival: "",
          number_of_passengers: "",
          destination: "",
          destination_coordinates: "",
          purpose: "",
          remarks: "",
        });
        setTravelAnalytics(null);
        setShowAnalytics(false);
        setShowCalendar(false);
        setCalendarView("month");
        setSelectedDay(null);
      }
    } catch (error) {
      console.error("Error submitting vehicle request:", error);
      const msg = error?.response?.data?.message || "Failed to submit request.";
      ToastNotification.error("Upload Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: can show analytics?
  const canShowAnalytics =
    !!request.destination &&
    !!request.time_of_departure &&
    !!request.date_of_trip;

  // Custom Calendar Component
  const CustomCalendar = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Helper function to format date as YYYY-MM-DD in local timezone
    const formatDateLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    
    const isDateBooked = (date) => {
      if (!request.vehicle_id) return false;
      const dateStr = formatDateLocal(date);
      const vehicleId = Number(request.vehicle_id);
      
      // Check confirmed and pending bookings
      const hasBooking = Array.isArray(vehicleBookings) && vehicleBookings.some(booking => 
        booking.booking_date === dateStr && 
        (booking.status === "Confirmed" || booking.status === "Pending")
      );
      
      // Also check pending vehicle requests
      const hasPendingRequest = Array.isArray(vehicleRequests) && vehicleRequests.some(req => {
        const reqVehicleId = Number(req.vehicle_id);
        return reqVehicleId === vehicleId && 
               req.date_of_trip === dateStr && 
               (req.status === "Pending" || req.status === "Approved");
      });
      
      return hasBooking || hasPendingRequest;
    };
    
    const isDateUnavailable = (date) => {
      if (!Array.isArray(vehicleUnavailability)) return false;
      return vehicleUnavailability
        .filter(unav => unav.status === "Active")
        .some(unav => {
          const start = new Date(unav.start_date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(unav.end_date);
          end.setHours(23, 59, 59, 999);
          return date >= start && date <= end;
        });
    };
    
    const isDateInPast = (date) => {
      return date < today;
    };
    
    const isDateSelected = (date) => {
      if (!request.date_of_trip) return false;
      return formatDateLocal(date) === request.date_of_trip;
    };
    
    const handleDateClick = (date) => {
      if (isDateInPast(date)) return;
      
      const dateStr = formatDateLocal(date);
      
      // Update the date_of_trip field
      setRequest((prev) => ({
        ...prev,
        date_of_trip: dateStr,
      }));
      
      // Switch to day view when clicking on a date
      setSelectedDay(new Date(date));
      setCalendarView("day");
      
      // Auto-scroll to time inputs after a short delay
      setTimeout(() => {
        const timeInputs = document.querySelectorAll('input[name="time_of_departure"], input[name="time_of_arrival"]');
        if (timeInputs.length > 0) {
          timeInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };
    
    const getDateStatus = (date) => {
      if (isDateInPast(date)) return "past";
      if (isDateBooked(date)) return "booked";
      if (isDateUnavailable(date)) return "unavailable";
      if (isDateSelected(date)) return "selected";
      return "available";
    };
    
    const prevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };
    
    // Day View Component
    const DayView = () => {
      if (!selectedDay) return null;
      
      const dayDateStr = formatDateLocal(selectedDay);
      const dayName = dayNames[selectedDay.getDay()];
      const dayNumber = selectedDay.getDate();
      const monthName = monthNames[selectedDay.getMonth()];
      const year = selectedDay.getFullYear();
      
      // Get bookings for this day
      const dayBookings = Array.isArray(vehicleBookings) 
        ? vehicleBookings.filter(booking => booking.booking_date === dayDateStr && (booking.status === "Confirmed" || booking.status === "Pending"))
        : [];
      
      // Also get pending vehicle requests for this day and convert them to booking-like objects
      const dayPendingRequests = Array.isArray(vehicleRequests) && request.vehicle_id
        ? vehicleRequests
            .filter(req => {
              const reqVehicleId = Number(req.vehicle_id);
              const targetVehicleId = Number(request.vehicle_id);
              return reqVehicleId === targetVehicleId && 
                     req.date_of_trip === dayDateStr && 
                     (req.status === "Pending" || req.status === "Approved");
            })
            .map(req => ({
              booking_date: req.date_of_trip,
              start_time: req.time_of_departure || "00:00",
              end_time: req.time_of_arrival || req.time_of_departure || "00:00",
              event_title: req.title || "Pending Request",
              status: "Pending",
              organization: req.department || null,
              isPendingRequest: true, // Flag to identify pending requests
            }))
        : [];
      
      // Combine bookings and pending requests
      const allDayBookings = [...dayBookings, ...dayPendingRequests];
      
      // Check if day is unavailable
      const isDayUnavailable = Array.isArray(vehicleUnavailability) && vehicleUnavailability
        .filter(unav => unav.status === "Active")
        .some(unav => {
          const start = new Date(unav.start_date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(unav.end_date);
          end.setHours(23, 59, 59, 999);
          return selectedDay >= start && selectedDay <= end;
        });
      
      // Generate time slots (4 AM to 7 PM)
      const timeSlots = [];
      for (let hour = 4; hour <= 19; hour++) {
        timeSlots.push({
          hour,
          time: `${String(hour).padStart(2, "0")}:00`,
          displayTime: hour <= 12 ? `${hour === 12 ? 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}` : `${hour - 12}:00 PM`,
        });
      }
      
      // Check if a time slot is booked
      const isTimeSlotBooked = (hour) => {
        return allDayBookings.some(booking => {
          const [startHour] = booking.start_time.split(":").map(Number);
          const endTime = booking.end_time || booking.start_time;
          const [endHour] = endTime.split(":").map(Number);
          return hour >= startHour && hour < endHour;
        });
      };
      
      // Get booking for a specific hour
      const getBookingForHour = (hour) => {
        return allDayBookings.find(booking => {
          const [startHour] = booking.start_time.split(":").map(Number);
          const endTime = booking.end_time || booking.start_time;
          const [endHour] = endTime.split(":").map(Number);
          return hour >= startHour && hour < endHour;
        });
      };
      
      // Format time for display
      const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const ampm = hours < 12 ? "AM" : "PM";
        return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
      };
      
      // Check if hour is in selected range
      const isHourInRange = (hour) => {
        if (!request.time_of_departure || !request.time_of_arrival) {
          if (dragStart !== null && dragEnd !== null) {
            const min = Math.min(dragStart, dragEnd);
            const max = Math.max(dragStart, dragEnd);
            return hour >= min && hour < max;
          }
          return false;
        }
        const start = Number(request.time_of_departure.split(":")[0]);
        const end = Number(request.time_of_arrival.split(":")[0]);
        return hour >= start && hour < end;
      };
      
      // Handle time slot click/drag
      const handleTimeSlotMouseDown = (hour) => {
        if (isTimeSlotBooked(hour) || isDayUnavailable) return;
        
        const timeStr = `${String(hour).padStart(2, "0")}:00`;
        setDragStart(hour);
        setDragEnd(hour);
        setDragging(true);
        
        setRequest((prev) => ({
          ...prev,
          time_of_departure: timeStr,
          time_of_arrival: timeStr,
        }));
      };
      
      const handleTimeSlotMouseEnter = (hour) => {
        if (!dragging || isTimeSlotBooked(hour) || isDayUnavailable) return;
        
        setDragEnd(hour);
        
        const startHour = dragStart;
        const endHour = hour;
        const minHour = Math.min(startHour, endHour);
        const maxHour = Math.max(startHour, endHour);
        
        setRequest((prev) => ({
          ...prev,
          time_of_departure: `${String(minHour).padStart(2, "0")}:00`,
          time_of_arrival: `${String(maxHour + 1).padStart(2, "0")}:00`,
        }));
      };
      
      const handleTimeSlotMouseUp = () => {
        setDragging(false);
      };
      
      return (
        <div className="w-full">
          {/* Day View Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setCalendarView("month");
                setSelectedDay(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <CaretLeft size={18} />
              <span>Back to Calendar</span>
            </button>
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {dayName}, {monthName} {dayNumber}, {year}
              </h3>
              {isDayUnavailable && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Day is unavailable</p>
              )}
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
          
          {/* Time Slots */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {timeSlots.map((slot, idx) => {
              const isBooked = isTimeSlotBooked(slot.hour);
              const booking = getBookingForHour(slot.hour);
              const isFirstHourOfBooking = booking && Number(booking.start_time.split(":")[0]) === slot.hour;
              const isSelected = isHourInRange(slot.hour);
              
              return (
                <div
                  key={idx}
                  onMouseDown={() => handleTimeSlotMouseDown(slot.hour)}
                  onMouseEnter={() => handleTimeSlotMouseEnter(slot.hour)}
                  onMouseUp={handleTimeSlotMouseUp}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${isSelected
                      ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600"
                      : isBooked
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 cursor-not-allowed"
                      : isDayUnavailable
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 opacity-60 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold w-20 ${
                        isSelected 
                          ? "text-blue-700 dark:text-blue-300" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {slot.displayTime}
                      </span>
                      {isBooked && booking && isFirstHourOfBooking && (
                        <div className="flex-1">
                          <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                            {booking.event_title || "Booked"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time || booking.start_time)}
                            {booking.status === "Pending" && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-medium">
                                Pending
                              </span>
                            )}
                          </div>
                          {booking.organization && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                              {booking.organization}
                            </div>
                          )}
                        </div>
                      )}
                      {isBooked && !isFirstHourOfBooking && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          (Continued from {formatTime(booking.start_time)})
                        </div>
                      )}
                      {isSelected && !isBooked && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Selected
                        </div>
                      )}
                      {!isSelected && !isBooked && !isDayUnavailable && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Available - Click & drag to select
                        </div>
                      )}
                      {isDayUnavailable && !isBooked && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Unavailable
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Selected Time Range Display */}
          {(request.time_of_departure || request.time_of_arrival) && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Selected Time Range:
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {request.time_of_departure || "Not set"} - {request.time_of_arrival || "Not set"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Click and drag on available time slots to select your trip time
              </p>
            </div>
          )}
          
          {/* Summary */}
          {allDayBookings.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Summary: {allDayBookings.length} booking{allDayBookings.length !== 1 ? "s" : ""} on this day
                {dayPendingRequests.length > 0 && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">
                    ({dayPendingRequests.length} pending request{dayPendingRequests.length !== 1 ? "s" : ""})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      );
    };
    
    // Month View Component
    const MonthView = () => (
      <div className="w-full">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3 px-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <CaretLeft size={20} />
          </button>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <CaretRight size={20} />
          </button>
        </div>
        
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const status = getDateStatus(date);
            const isToday = formatDateLocal(date) === formatDateLocal(today);
            
            return (
              <button
                key={idx}
                onClick={() => handleDateClick(date)}
                disabled={status === "past"}
                className={`
                  aspect-square text-xs font-medium rounded-lg transition-all
                  ${!isCurrentMonth ? "text-gray-300 dark:text-gray-600" : ""}
                  ${status === "past" 
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50" 
                    : status === "booked"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-2 border-orange-400 dark:border-orange-600 hover:bg-orange-200 dark:hover:bg-orange-900/40"
                    : status === "unavailable"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-400 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-900/40"
                    : status === "selected"
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }
                  ${isToday && status !== "selected" ? "ring-2 ring-blue-400" : ""}
                `}
                title={
                  status === "booked" ? "Click to view day schedule" :
                  status === "unavailable" ? "Click to view day schedule" :
                  status === "past" ? "Past date" :
                  isToday ? "Today - Click to view schedule" : "Click to view schedule"
                }
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
    
    return calendarView === "day" ? <DayView /> : <MonthView />;
  };

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
          {/* Requester & Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Vehicle
              </label>
              <select
                name="vehicle_id"
                value={request.vehicle_id}
                onChange={(e) => {
                  handleChange(e);
                  setShowCalendar(false);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicleOptions.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.name} {v.license_plate ? `- ${v.license_plate}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar View - Mobile First - Right after vehicle selection */}
          {request.vehicle_id && (
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                    Select Date & Time
                  </Typography>
                  <Button
                    type="button"
                    variant="text"
                    size="sm"
                    className="p-1"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <Calendar size={18} />
                  </Button>
                </div>
                
                {showCalendar && (
                  <>
                    {/* Legend */}
                    {/* Color scheme: booked = orange (#FFA500), unavailable = red (#FF0000) */}
                    <div className="flex flex-wrap gap-3 text-xs mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
                        <span className="text-gray-600 dark:text-gray-400">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600"></div>
                        <span className="text-gray-600 dark:text-gray-400">Booked/Pending</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600"></div>
                        <span className="text-gray-600 dark:text-gray-400">Unavailable</span>
                      </div>
                    </div>
                    
                    {/* Custom Calendar */}
                    <CustomCalendar />
                  </>
                )}
                
                {/* Date & Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Date of Trip
                    </label>
                    <input
                      type="date"
                      name="date_of_trip"
                      min={
                        user.access_level === "admin"
                          ? new Date().toISOString().split("T")[0]
                          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                      }
                      value={request.date_of_trip || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                    />
                    {formErrors.date_of_trip && <p className="text-red-500 text-xs mt-1">{formErrors.date_of_trip}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Time of Departure
                    </label>
                    <input
                      type="time"
                      name="time_of_departure"
                      min="04:00"
                      max="19:00"
                      value={request.time_of_departure || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Time of Arrival
                    </label>
                    <input
                      type="time"
                      name="time_of_arrival"
                      min="04:00"
                      max="19:00"
                      value={request.time_of_arrival || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                    />
                    {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
                  </div>
                </div>
                
                {/* Booking Conflicts */}
                <div className="space-y-2 mt-3">
                  {formErrors.booking && (
                    <p className="text-red-500 text-xs mt-2 flex items-start gap-1">
                      {formErrors.booking}
                      <span className="relative flex group">
                        <Info size={14} className="text-red-500 cursor-pointer mt-0.5" weight="duotone" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white text-gray-700 text-xs border border-red-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <div className="absolute -bottom-1.5 right-2 w-3 h-3 bg-white border-b border-r border-red-200 rotate-45"></div>
                          This means the vehicle has already been booked for this date and time.
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
              </div>
            </div>
          )}

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
          {ENABLE_FILE_ATTACHMENTS && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments</label>
              <input type="file" multiple onChange={handleFilesSelected} className="text-sm" />
              {attachments.length > 0 && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1">
                      <span>{f.name} ({Math.round(f.size/1024)} KB)</span>
                      <button className="text-red-500" onClick={() => removeAttachmentAt(i)}>Remove</button>
                    </div>
                  ))}
                  {uploadProgress > 0 && <div className="text-xs mt-1">Uploading: {uploadProgress}%</div>}
                </div>
              )}
            </div>
          )}

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
              isProcessingMeta ||
              isSubmitting ||
              (ENABLE_FILE_ATTACHMENTS && attachments.length > 0 && attachmentsMeta.length < attachments.length)
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
