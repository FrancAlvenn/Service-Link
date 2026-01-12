import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Typography, Checkbox, Spinner } from "@material-tailwind/react";
import { AuthContext } from "../../../../authentication";
import { UserContext } from "../../../../../context/UserContext";
import { VenueRequestsContext } from "../../../context/VenueRequestsContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import axios from "axios";
import {
  Info,
  Sparkle,
  ArrowClockwise,
  Calendar,
} from "@phosphor-icons/react";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import { GoogleGenAI } from "@google/genai";
import { renderDetailsTable } from "../../../../../utils/emailsTempalte";
import { sendBrevoEmail } from "../../../../../utils/brevo";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { validatePax, validateTimeRange } from "../../../utils/validation/venueRequestValidation";

// ---------------------------------------------------------------------
// Gemini initialisation
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});


const VenueRequestForm = ({ setSelectedRequest, prefillData, renderConfidence }) => {
  const purposeTextareaRef = useRef(null);

  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers, getUserDepartmentByReferenceNumber } = useContext(UserContext);
  const { venueRequests, fetchVenueRequests } = useContext(VenueRequestsContext);

  const {
    departments,
    organizations,
    approvers,
    approvalRulesByDepartment,
    approvalRulesByRequestType,
    approvalRulesByDesignation,
    fetchDepartments,
    fetchOrganizations,
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
  const getOrganizationName = (organizations, organizationId) => {
    if (!organizationId) return "No Organization";
    const organization = organizations.find((org) => org.id === organizationId);
    return organization ? organization.organization : "No Organization";
  }

  const [request, setRequest] = useState(() => ({
    requester: user.reference_number,
    organization: getOrganizationName(organizations, user?.organization_id),
    title: "",
    department: getDepartmentName(departments, getUserDepartmentByReferenceNumber(user.reference_number)),
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
    ...(prefillData || {}),
  }));

  const requestType = "Venue Request";

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

  useEffect(() => {
    fetchDepartments();
    fetchOrganizations();
    fetchDesignations();
    fetchApprovers();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const orgName = getOrganizationName(organizations, user?.organization_id);
    setRequest((prev) => {
      if (prev.organization && prev.organization !== "No Organization") return prev;
      return { ...prev, organization: orgName };
    });
  }, [organizations, user?.organization_id]);

  // Handle AI prefilled data
  useEffect(() => {
    if (prefillData && Object.keys(prefillData).length > 0) {
      setRequest(prev => ({
        ...prev,
        ...prefillData
      }));
    }
  }, [prefillData]);

  // Fetch venue requests once when component mounts
  useEffect(() => {
    fetchVenueRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [venueBookings, setVenueBookings] = useState([]);
  const [venueUnavailability, setVenueUnavailability] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month"); // "month" or "day"
  const [selectedDay, setSelectedDay] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/venues`, {
          withCredentials: true,
        });

        // Filter only available venues
        const data = response?.data || [];
        const availableVenues = Array.isArray(data)
          ? data.filter((venue) => venue?.status === "Available")
          : [];

        setVenueOptions(availableVenues);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
        setVenueOptions([]);
      }
    };

    fetchVenues();
  }, []);

  // Fetch bookings and unavailability when venue is selected
  useEffect(() => {
    const fetchVenueSchedule = async () => {
      if (!request.venue_id) {
        setVenueBookings([]);
        setVenueUnavailability([]);
        return;
      }

      try {
        // Fetch bookings
        const bookingsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/venue-bookings/venue/${request.venue_id}`,
          { withCredentials: true }
        );
        setVenueBookings(bookingsResponse.data || []);

        // Fetch unavailability
        const unavailabilityResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/venue-unavailability/venue/${request.venue_id}`,
          { withCredentials: true }
        );
        setVenueUnavailability(unavailabilityResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch venue schedule:", error);
        setVenueBookings([]);
        setVenueUnavailability([]);
      }
    };

    fetchVenueSchedule();
  }, [request.venue_id]);

  const checkBookingConflicts = () => {
    if (!request.venue_id || !request.event_dates || !request.event_start_time || !request.event_end_time) {
      setFormErrors((prev) => ({ ...prev, booking: "" }));
      setFormWarnings((prev) => ({ ...prev, booking: "" }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, booking: "" }));
    setFormWarnings((prev) => ({ ...prev, booking: "" }));

    const targetDate = request.event_dates;
    const newStart = new Date(`${targetDate}T${request.event_start_time}`);
    const newEnd = new Date(`${targetDate}T${request.event_end_time}`);

    // Check against confirmed bookings
    const bookingConflict = Array.isArray(venueBookings) && venueBookings.some((booking) => {
      if (booking.booking_date !== targetDate) return false;
      const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`);
      const bookingEnd = new Date(`${booking.booking_date}T${booking.end_time}`);
      return newStart < bookingEnd && newEnd > bookingStart;
    });

    // Check against unavailability
    const unavailabilityConflict = Array.isArray(venueUnavailability) && venueUnavailability
      .filter((unav) => unav.status === "Active")
      .some((unav) => {
        const unavStart = new Date(unav.start_date);
        const unavEnd = new Date(unav.end_date);
        return newStart < unavEnd && newEnd > unavStart;
      });

    // Check against pending requests
    const requestConflict = Array.isArray(venueRequests) ? venueRequests.filter((existing) => {
      const existingVenueId = Number(existing.venue_id);
      const targetVenueId = Number(request.venue_id);
      if (existingVenueId !== targetVenueId || existing.event_dates !== targetDate) return false;

      const existStart = new Date(`1970-01-01T${existing.event_start_time}`);
      const existEnd = new Date(`1970-01-01T${existing.event_end_time}`);
      const hasOverlap = newStart < existEnd && newEnd > existStart;
      return hasOverlap;
    }) : [];

    if (bookingConflict || unavailabilityConflict) {
      setFormErrors((prev) => ({
        ...prev,
        booking: "Venue is already booked or unavailable for this date/time!",
      }));
    } else if (requestConflict.length > 0) {
      const approvedConflict = requestConflict.some((c) => c.status === "Approved");
      if (approvedConflict) {
        setFormErrors((prev) => ({
          ...prev,
          booking: "Venue is already booked for this date/time!",
        }));
      } else {
        setFormWarnings((prev) => ({
          ...prev,
          booking: "Warning: Pending booking might conflict with your request",
        }));
      }
    }
  };

  useEffect(() => {
    checkBookingConflicts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, venueRequests, venueBookings, venueUnavailability]);

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
    let newErrors = { ...formErrors };
    let newWarnings = { ...formWarnings };

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
      const { error } = validateTimeRange(updatedRequest.event_start_time, updatedRequest.event_end_time);
      newErrors.time = error || "";
      if (value) {
        const [h, m] = value.split(":").map(Number);
        const total = h * 60 + m;
        const min = 6 * 60;   // 06:00
        const max = 19 * 60;  // 19:00
        if (total < min || total > max) {
          const clamped = Math.max(min, Math.min(total, max));
          const ch = String(Math.floor(clamped / 60)).padStart(2, "0");
          const cm = String(clamped % 60).padStart(2, "0");
          updatedRequest[name] = `${ch}:${cm}`;
          newErrors.time = "Events must be scheduled between 06:00 and 19:00.";
        }
      }
    }

    if (name === "pax_estimation") {
      const selectedVenue = venueOptions.find((v) => Number(v.venue_id) === Number(updatedRequest.venue_id));
      const capacity = selectedVenue?.capacity ? Number(selectedVenue.capacity) : null;
      const pax = value ? Number(value) : 0;

      if (pax < 0) {
        const msg = "Pax estimation must be a non-negative number.";
        newErrors.pax = msg;
        newWarnings.pax = "";
        setFormErrors(newErrors);
        setFormWarnings(newWarnings);
        return;
      }

      const { error, warning } = validatePax(capacity, pax);
      newErrors.pax = error || "";
      newWarnings.pax = warning || "";
    }

    setFormErrors(newErrors);
    setFormWarnings(newWarnings);
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
      if (!Array.isArray(venueBookings)) return false;
      const dateStr = formatDateLocal(date);
      // Check both confirmed and pending bookings
      return venueBookings.some(booking => 
        booking.booking_date === dateStr && 
        (booking.status === "Confirmed" || booking.status === "Pending")
      );
    };
    
    const isDateUnavailable = (date) => {
      if (!Array.isArray(venueUnavailability)) return false;
      return venueUnavailability
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
      if (!request.event_dates) return false;
      return formatDateLocal(date) === request.event_dates;
    };
    
    const handleDateClick = (date) => {
      if (isDateInPast(date)) return;
      
      const dateStr = formatDateLocal(date);
      
      // Update the event_dates field
      setRequest((prev) => ({
        ...prev,
        event_dates: dateStr,
      }));
      
      // Switch to day view when clicking on a date
      setSelectedDay(new Date(date));
      setCalendarView("day");
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
      const dayBookings = Array.isArray(venueBookings) 
        ? venueBookings.filter(booking => booking.booking_date === dayDateStr && (booking.status === "Confirmed" || booking.status === "Pending"))
        : [];
      
      // Check if day is unavailable
      const isDayUnavailable = Array.isArray(venueUnavailability) && venueUnavailability
        .filter(unav => unav.status === "Active")
        .some(unav => {
          const start = new Date(unav.start_date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(unav.end_date);
          end.setHours(23, 59, 59, 999);
          return selectedDay >= start && selectedDay <= end;
        });
      
      // Generate time slots (06:00 to 19:00)
      const timeSlots = [];
      for (let hour = 6; hour <= 19; hour++) {
        const displayHour = hour === 0 ? 12 : hour <= 12 ? hour : hour - 12;
        const ampm = hour < 12 ? "AM" : "PM";
        timeSlots.push({
          hour,
          time: `${String(hour).padStart(2, "0")}:00`,
          displayTime: `${displayHour}:00 ${ampm}`,
        });
      }
      
      // Check if a time slot is booked
      const isTimeSlotBooked = (hour) => {
        return dayBookings.some(booking => {
          const [startHour] = booking.start_time.split(":").map(Number);
          const [endHour] = booking.end_time.split(":").map(Number);
          return hour >= startHour && hour < endHour;
        });
      };
      
      // Get booking for a specific hour
      const getBookingForHour = (hour) => {
        return dayBookings.find(booking => {
          const [startHour] = booking.start_time.split(":").map(Number);
          const [endHour] = booking.end_time.split(":").map(Number);
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
        if (!dragStart && !dragEnd) return false;
        const start = dragStart || (request.event_start_time ? Number(request.event_start_time.split(":")[0]) : null);
        const end = dragEnd || (request.event_end_time ? Number(request.event_end_time.split(":")[0]) : null);
        if (start === null || end === null) return false;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        return hour >= min && hour < max;
      };
      
      // Handle time slot click/drag
      const handleTimeSlotMouseDown = (hour) => {
        if (isTimeSlotBooked(hour) || isDayUnavailable) return;
        if (hour < 6 || hour > 19) {
          setFormErrors((prev) => ({ ...prev, time: "Events must be scheduled between 06:00 and 19:00." }));
          return;
        }
        
        const timeStr = `${String(hour).padStart(2, "0")}:00`;
        setDragStart(hour);
        setDragEnd(hour);
        setDragging(true);
        
        setRequest((prev) => ({
          ...prev,
          event_start_time: timeStr,
          event_end_time: timeStr,
        }));
      };
      
      const handleTimeSlotMouseEnter = (hour) => {
        if (!dragging || isTimeSlotBooked(hour) || isDayUnavailable) return;
        if (hour < 6 || hour > 19) {
          setFormErrors((prev) => ({ ...prev, time: "Events must be scheduled between 06:00 and 19:00." }));
          return;
        }
        
        setDragEnd(hour);
        
        const startHour = dragStart;
        const endHour = hour;
        const minHour = Math.min(startHour, endHour);
        const maxHour = Math.max(startHour, endHour);
        
        setRequest((prev) => ({
          ...prev,
          event_start_time: `${String(minHour).padStart(2, "0")}:00`,
          event_end_time: `${String(maxHour + 1).padStart(2, "0")}:00`,
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
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
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
          {(dragStart !== null || dragEnd !== null || request.event_start_time || request.event_end_time) && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Selected Time Range:
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {request.event_start_time || "Not set"} - {request.event_end_time || "Not set"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Click and drag on available time slots to select your event time. Available window: 06:00–19:00.
              </p>
              {formErrors.time && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {formErrors.time}
                </p>
              )}
            </div>
          )}
          
          {/* Summary */}
          {dayBookings.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Summary: {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""} on this day
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

  const submitVenueRequest = async () => {
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

        const venueName = venueOptions.find(v => v.venue_id === Number(request.venue_id))?.name || "Unknown Venue";
        const detailsHtml = renderDetailsTable(request.details);

        try {
          await sendBrevoEmail({
            to: [
              {
                email: user?.email,
                name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "",
              },
            ],

            templateId: 8, // Venue Request Notification Template
            params: {
              requester_name: `${user.first_name} ${user.last_name}`.trim(),
              title: request.title || "Venue Reservation Request",
              organization: request.organization || "N/A",
              venue_name: venueName || "Not specified",
              event_dates: request.event_dates || "Not specified",
              event_start_time: request.event_start_time || "Not specified",
              event_end_time: request.event_end_time || "Not specified",
              participants: request.participants || "N/A",
              pax_estimation: request.pax_estimation || "Not specified",
              event_nature: request.event_nature || "General Event",
              purpose: request.purpose || "N/A",
              details_table: detailsHtml || "<p>No additional requirements specified.</p>",
            },
          });

          console.log("Venue request email successfully sent to:", user?.email);
        } catch (emailErr) {
          console.warn("Venue request saved, but email notification failed:", emailErr);
        }

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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Venue
              </label>
              <select
                name="venue_id"
                value={request.venue_id}
                onChange={(e) => {
                  handleChange(e);
                  setShowCalendar(false);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                required
              >
                <option value="">Select Venue</option>
                {venueOptions.map((v) => (
                  <option key={v.venue_id} value={v.venue_id}>
                    {v.name} {v.location ? `- ${v.location}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar View - Mobile First - Right after venue selection */}
          {request.venue_id && (
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
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="event_dates"
                      min={
                        user.access_level === "admin"
                          ? new Date().toISOString().split("T")[0]
                          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                      }
                      value={request.event_dates}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                    />
                    {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Start Time
                    </label>
                  <input
                    type="time"
                    name="event_start_time"
                    min="06:00"
                    max="19:00"
                    value={request.event_start_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                  />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      End Time
                    </label>
                  <input
                    type="time"
                    name="event_end_time"
                    min="06:00"
                    max="19:00"
                    value={request.event_end_time}
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
              </div>
            </div>
          )}

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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Nature of Participants</label>
              <input
                type="text"
                name="participants"
                value={request.participants}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <span className="flex gap-2 items-center">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">Pax Estimation</label>
                {request.venue_id && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Capacity: {venueOptions.find((v) => Number(v.venue_id) === Number(request.venue_id))?.capacity ?? "N/A"}
                  </p>
                )}
              </span>
              <input
                type="number"
                name="pax_estimation"
                value={request.pax_estimation}
                onChange={handleChange}
                min="0"
                max={
                  request.venue_id
                    ? venueOptions.find((v) => Number(v.venue_id) === Number(request.venue_id))?.capacity ?? undefined
                    : undefined
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
              />
              {formWarnings.pax && <p className="text-amber-500 text-xs mt-1">{formWarnings.pax}</p>}
              {formErrors.pax && <p className="text-red-500 text-xs mt-1">{formErrors.pax}</p>}
            </div>
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
              formErrors.booking ||
              formErrors.pax
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
