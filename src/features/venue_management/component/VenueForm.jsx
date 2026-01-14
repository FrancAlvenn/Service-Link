import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import axios from "axios";
import { AuthContext } from "../../authentication";
import VenueContext from "../context/VenueContext";
import ToastNotification from "../../../utils/ToastNotification";
import { CheckCircle, Warning, CaretLeft, CaretRight } from "@phosphor-icons/react";

const VenueForm = ({ mode = "add", initialValues, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const { fetchVenues, createVenueUnavailability, fetchVenueUnavailability } =
    useContext(VenueContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeStep, setActiveStep] = useState(mode === "edit" ? 1 : 0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month"); // "month" or "day"
  const [selectedDay, setSelectedDay] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const [venue, setVenue] = useState(() => ({
    name: "",
    description: "",
    location: "",
    capacity: "",
    amenities: [],
    hourly_rate: "",
    status: "Available",
    operating_hours_start: "08:00",
    operating_hours_end: "17:00",
    booking_advance_days: 7,
    requires_approval: true,
    assigned_department: "",
    last_maintenance: new Date().toISOString().split("T")[0],
    next_maintenance: "",
    additional_details: [],
    ...(initialValues || {}),
  }));

  const [unavailabilityEvents, setUnavailabilityEvents] = useState([]);
  const [newUnavailability, setNewUnavailability] = useState({
    start_date: "",
    end_date: "",
    reason: "",
    description: "",
    is_recurring: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Fetch existing unavailability if editing
  useEffect(() => {
    if (mode === "edit" && initialValues?.venue_id) {
      fetchVenueUnavailability(initialValues.venue_id).then((data) => {
        if (Array.isArray(data)) {
          const events = data
            .filter((item) => item.status === "Active")
            .map((item) => ({
              id: item.unavailability_id.toString(),
              title: item.reason || "Unavailable",
              start: item.start_date,
              end: item.end_date,
              extendedProps: {
                unavailability_id: item.unavailability_id,
                reason: item.reason,
                description: item.description,
              },
              backgroundColor: "#ef4444",
              borderColor: "#dc2626",
            }));
          setUnavailabilityEvents(events);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialValues?.venue_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVenue({
      ...venue,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAmenityChange = (amenity) => {
    setVenue((prev) => {
      const amenities = Array.isArray(prev.amenities) ? prev.amenities : [];
      // Check if amenity exists (either as string or object)
      const existingIndex = amenities.findIndex(a => 
        (typeof a === 'string' && a === amenity) || 
        (typeof a === 'object' && a.name === amenity)
      );

      if (existingIndex >= 0) {
        // Remove amenity
        return {
          ...prev,
          amenities: amenities.filter((_, index) => index !== existingIndex),
        };
      } else {
        // Add amenity with default quantity of 1
        return {
          ...prev,
          amenities: [...amenities, { name: amenity, quantity: 1 }],
        };
      }
    });
  };

  const handleQuantityChange = (amenityName, change) => {
    setVenue((prev) => {
      const amenities = Array.isArray(prev.amenities) ? prev.amenities : [];
      return {
        ...prev,
        amenities: amenities.map(item => {
          const itemName = typeof item === 'string' ? item : item.name;
          if (itemName !== amenityName) return item;

          // Convert string to object if needed
          const currentItem = typeof item === 'string' 
            ? { name: item, quantity: 1 } 
            : item;

          const newQuantity = Math.max(1, (currentItem.quantity || 1) + change);
          
          return { ...currentItem, quantity: newQuantity };
        })
      };
    });
  };

  const handleQuantityInput = (amenityName, value) => {
    setVenue((prev) => {
      const amenities = Array.isArray(prev.amenities) ? prev.amenities : [];
      return {
        ...prev,
        amenities: amenities.map(item => {
          const itemName = typeof item === 'string' ? item : item.name;
          if (itemName !== amenityName) return item;

          const currentItem = typeof item === 'string' 
            ? { name: item, quantity: 1 } 
            : item;

          const parsedValue = parseInt(value);
          const newQuantity = isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue;
          
          return { ...currentItem, quantity: newQuantity };
        })
      };
    });
  };

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    // Always switch to day view when clicking on a date
    // This allows adding more unavailability periods even if the day already has some
    setSelectedDay(new Date(date));
    setCalendarView("day");
    
    // Set the date in the form (without time yet)
    const dateStr = formatDateLocal(date);
    const dateTimeStr = `${dateStr}T00:00`;
    
    if (!newUnavailability.start_date) {
      setNewUnavailability({
        ...newUnavailability,
        start_date: dateTimeStr,
        end_date: dateTimeStr,
      });
    } else {
      // If start date is already set, update end date
      setNewUnavailability({
        ...newUnavailability,
        end_date: dateTimeStr,
      });
    }
  };

  const handleUnavailabilityClick = (event) => {
    // Handle clicking on an unavailability period in day view - open delete dialog
    setEventToDelete(event.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      setUnavailabilityEvents((prev) =>
        prev.filter((event) => event.id !== eventToDelete)
      );
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      ToastNotification.success("Success", "Unavailability period removed");
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleAddUnavailability = () => {
    if (!newUnavailability.start_date || !newUnavailability.end_date) {
      ToastNotification.error("Error", "Please select a date range");
      return;
    }

    // Convert datetime-local format to ISO string for FullCalendar
    const startDate = new Date(newUnavailability.start_date);
    const endDate = new Date(newUnavailability.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison

    // Check if start date is before today
    if (startDate < today) {
      ToastNotification.error("Error", "Cannot set unavailability dates in the past");
      return;
    }

    // Check if end date is before today
    if (endDate < today) {
      ToastNotification.error("Error", "Cannot set unavailability dates in the past");
      return;
    }

    if (startDate >= endDate) {
      ToastNotification.error("Error", "End date must be after start date");
      return;
    }

    const newEvent = {
      id: `temp-${Date.now()}`,
      title: newUnavailability.reason || "Unavailable",
      start: startDate,
      end: endDate,
      extendedProps: {
        ...newUnavailability,
        isNew: true,
      },
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
    };

    setUnavailabilityEvents((prev) => [...prev, newEvent]);
    setNewUnavailability({
      start_date: "",
      end_date: "",
      reason: "",
      description: "",
      is_recurring: false,
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate first step
      if (!venue.name || !venue.location) {
        ToastNotification.error("Error", "Please fill in all required fields");
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const submitVenue = async () => {
    try {
      const endpoint =
        mode === "edit"
          ? `${process.env.REACT_APP_API_URL}/venues/${venue.reference_number}`
          : `${process.env.REACT_APP_API_URL}/venues`;

      const method = mode === "edit" ? "put" : "post";

      // First, create/update the venue
      const response = await axios[method](
        endpoint,
        { ...venue, user: user?.reference_number || "system" },
        { withCredentials: true }
      );

      if ([200, 201].includes(response.status)) {
        const createdVenue = response.data.newVenue || venue;
        const venueId = createdVenue.venue_id || initialValues?.venue_id;

        // Save unavailability periods
        if (unavailabilityEvents.length > 0 && venueId) {
          for (const event of unavailabilityEvents) {
            if (event.extendedProps?.isNew) {
              try {
                await createVenueUnavailability({
                  venue_id: venueId,
                  start_date: event.start,
                  end_date: event.end,
                  reason: event.extendedProps.reason || event.title,
                  description: event.extendedProps.description || "",
                  is_recurring: event.extendedProps.is_recurring || false,
                  created_by: user?.reference_number || "system",
                  status: "Active",
                });
              } catch (error) {
                console.error("Error creating unavailability:", error);
              }
            }
          }
        }

        ToastNotification.success(
          "Success!",
          `Venue ${mode === "edit" ? "updated" : "created"} successfully.`
        );
        fetchVenues();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }

      setErrorMessage("");
    } catch (error) {
      console.error("Error saving venue:", error);
      if (error.response?.status === 401) {
        setErrorMessage("An error occurred. Please try again.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "An error occurred while saving the venue."
        );
      }
    }
  };

  const commonAmenities = [
    "Wi-Fi",
    "Air Conditioning",
    "Sound System",
    "Microphone",
    "Projector",
    "LCD Projector",
    "LED Monitor",
    "Whiteboard",
    "Chairs",
    "Tables",
    "Electric Fan",
    "Water Dispenser",
    "Parking",
    "Restrooms",
    "Accessibility",
    "Catering",
  ];

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
    
    const isDateUnavailable = (date) => {
      if (!Array.isArray(unavailabilityEvents)) return false;
      // Normalize the input date to midnight for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      return unavailabilityEvents.some((event) => {
        if (!event || !event.start || !event.end) return false;
        const eventStart = new Date(event.start);
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = new Date(event.end);
        eventEnd.setHours(23, 59, 59, 999);
        return normalizedDate >= eventStart && normalizedDate <= eventEnd;
      });
    };
    
    const isDateInPast = (date) => {
      return date < today;
    };
    
    const isDateInSelectedRange = (date) => {
      if (!newUnavailability.start_date || !newUnavailability.end_date) return false;
      const start = new Date(newUnavailability.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(newUnavailability.end_date);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    };
    
    const getDateStatus = (date) => {
      if (isDateInPast(date)) return "past";
      if (isDateUnavailable(date)) return "unavailable";
      if (isDateInSelectedRange(date)) return "selected";
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
      
      const dayName = dayNames[selectedDay.getDay()];
      const dayNumber = selectedDay.getDate();
      const monthName = monthNames[selectedDay.getMonth()];
      const year = selectedDay.getFullYear();
      
      // Check if day has unavailability periods
      const dayUnavailability = Array.isArray(unavailabilityEvents)
        ? unavailabilityEvents.filter((event) => {
            const eventStart = new Date(event.start);
            eventStart.setHours(0, 0, 0, 0);
            const eventEnd = new Date(event.end);
            eventEnd.setHours(23, 59, 59, 999);
            return selectedDay >= eventStart && selectedDay <= eventEnd;
          })
        : [];
      
      // Generate time slots (6 AM to 5 PM for venues)
      const timeSlots = [];
      for (let hour = 6; hour <= 17; hour++) {
        timeSlots.push({
          hour,
          time: `${String(hour).padStart(2, "0")}:00`,
          displayTime: hour <= 12 ? `${hour === 12 ? 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}` : `${hour - 12}:00 PM`,
        });
      }
      
      // Check if a time slot is unavailable
      const isTimeSlotUnavailable = (hour) => {
        return dayUnavailability.some((event) => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          const eventStartHour = eventStart.getHours();
          const eventEndHour = eventEnd.getHours();
          return hour >= eventStartHour && hour < eventEndHour;
        });
      };
      
      // Get unavailability for a specific hour
      const getUnavailabilityForHour = (hour) => {
        return dayUnavailability.find((event) => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          const eventStartHour = eventStart.getHours();
          const eventEndHour = eventEnd.getHours();
          return hour >= eventStartHour && hour < eventEndHour;
        });
      };
      
      // Format time for display
      const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":").map(Number);
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const ampm = hours < 12 ? "AM" : "PM";
        return `${hour12}:${String(minutes || 0).padStart(2, "0")} ${ampm}`;
      };
      
      // Check if hour is in selected range
      const isHourInRange = (hour) => {
        if (dragStart !== null && dragEnd !== null) {
          const min = Math.min(dragStart, dragEnd);
          const max = Math.max(dragStart, dragEnd);
          return hour >= min && hour < max;
        }
        
        if (newUnavailability.start_date && newUnavailability.end_date) {
          const startDate = new Date(newUnavailability.start_date);
          const endDate = new Date(newUnavailability.end_date);
          const startHour = startDate.getHours();
          const endHour = endDate.getHours();
          return hour >= startHour && hour < endHour;
        }
        
        return false;
      };
      
      // Handle time slot click/drag
      const handleTimeSlotMouseDown = (hour) => {
        if (isTimeSlotUnavailable(hour)) {
          // If clicking on an unavailable slot, open delete dialog
          const unavailability = getUnavailabilityForHour(hour);
          if (unavailability) {
            handleUnavailabilityClick(unavailability);
          }
          return;
        }
        
        const timeStr = `${String(hour).padStart(2, "0")}:00`;
        setDragStart(hour);
        setDragEnd(hour);
        setDragging(true);
        
        const dateStr = formatDateLocal(selectedDay);
        const startDateTime = `${dateStr}T${timeStr}`;
        
        setNewUnavailability((prev) => ({
          ...prev,
          start_date: startDateTime,
          end_date: startDateTime,
        }));
      };
      
      const handleTimeSlotMouseEnter = (hour) => {
        if (!dragging || isTimeSlotUnavailable(hour)) return;
        
        setDragEnd(hour);
        
        const startHour = dragStart;
        const endHour = hour;
        const minHour = Math.min(startHour, endHour);
        const maxHour = Math.max(startHour, endHour);
        
        const dateStr = formatDateLocal(selectedDay);
        const startDateTime = `${dateStr}T${String(minHour).padStart(2, "0")}:00`;
        const endDateTime = `${dateStr}T${String(maxHour + 1).padStart(2, "0")}:00`;
        
        setNewUnavailability((prev) => ({
          ...prev,
          start_date: startDateTime,
          end_date: endDateTime,
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
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
          
          {/* Time Slots */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {timeSlots.map((slot, idx) => {
              const isUnavailable = isTimeSlotUnavailable(slot.hour);
              const unavailability = getUnavailabilityForHour(slot.hour);
              const isFirstHourOfUnavailability = unavailability && new Date(unavailability.start).getHours() === slot.hour;
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
                      : isUnavailable
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 cursor-not-allowed opacity-60"
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
                      {isUnavailable && unavailability && isFirstHourOfUnavailability && (
                        <div className="flex-1">
                          <div className="text-xs font-medium text-red-700 dark:text-red-300">
                            {unavailability.title || "Unavailable"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {formatTime(new Date(unavailability.start).toTimeString().slice(0, 5))} - {formatTime(new Date(unavailability.end).toTimeString().slice(0, 5))}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                            Click to delete
                          </div>
                        </div>
                      )}
                      {isSelected && !isUnavailable && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Selected
                        </div>
                      )}
                      {!isSelected && !isUnavailable && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Available - Click & drag to select
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Selected Time Range Display */}
          {(newUnavailability.start_date || newUnavailability.end_date) && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Selected Time Range:
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {newUnavailability.start_date ? new Date(newUnavailability.start_date).toLocaleString() : "Not set"} - {newUnavailability.end_date ? new Date(newUnavailability.end_date).toLocaleString() : "Not set"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Click and drag on available time slots to select unavailability period
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
                    : status === "unavailable"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-400 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 cursor-pointer"
                    : status === "selected"
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }
                  ${isToday && status !== "selected" && status !== "unavailable" ? "ring-2 ring-blue-400" : ""}
                `}
                title={
                  status === "unavailable" ? "Click to view schedule and add more unavailability periods" :
                  status === "past" ? "Past date" :
                  status === "selected" ? "Selected for unavailability" :
                  isToday ? "Today - Click to view schedule" : "Click to view schedule"
                }
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Unavailable (Click to delete)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Selected Range</span>
          </div>
        </div>
      </div>
    );
    
    return calendarView === "day" ? <DayView /> : <MonthView />;
  };

  return (
    <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col">
      <div className="py-4 px-5 mb-5 shadow-sm">
        <Typography variant="h5" className="mb-2">
          {mode === "edit" ? "Edit Venue" : "Add New Venue"}
        </Typography>
        <Typography variant="small" className="mb-2">
          {mode === "edit"
            ? "Update venue information and unavailability schedule."
            : "Enter venue details and set unavailability schedule."}
        </Typography>
      </div>

      {/* Custom Stepper */}
      <div className="mb-4 px-5 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center flex-1 relative">
            <button
              onClick={() => setActiveStep(0)}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                activeStep === 0
                  ? "bg-blue-600 border-blue-600 text-white"
                  : activeStep > 0
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
              }`}
            >
              {activeStep > 0 ? (
                <CheckCircle size={16} weight="fill" />
              ) : (
                <span className="font-semibold text-sm">1</span>
              )}
            </button>
            <div className="mt-1 text-center">
              <Typography
                variant="small"
                className={`text-xs font-medium ${
                  activeStep >= 0 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Venue Information
              </Typography>
            </div>
            {/* Active indicator */}
            {activeStep === 0 && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-0.5 mx-3 relative -mt-4">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
                activeStep > 0 ? "bg-green-500 w-full" : "bg-gray-300 w-0"
              }`}
            ></div>
            <div className="absolute top-0 left-0 h-full w-full bg-gray-200 rounded-full -z-10"></div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center flex-1 relative">
            <button
              onClick={() => {
                if (activeStep > 0 || venue.name) {
                  setActiveStep(1);
                }
              }}
              disabled={activeStep === 0 && !venue.name}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                activeStep === 1
                  ? "bg-blue-600 border-blue-600 text-white"
                  : activeStep > 1
                  ? "bg-green-500 border-green-500 text-white"
                  : activeStep === 0 && !venue.name
                  ? "bg-white border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
              }`}
            >
              {activeStep > 1 ? (
                <CheckCircle size={16} weight="fill" />
              ) : (
                <span className="font-semibold text-sm">2</span>
              )}
            </button>
            <div className="mt-1 text-center">
              <Typography
                variant="small"
                className={`text-xs font-medium ${
                  activeStep >= 1 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Unavailability Schedule
              </Typography>
            </div>
            {/* Active indicator */}
            {activeStep === 1 && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto flex-1">
        {activeStep === 0 && (
          <>
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">
                Basic Information
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={venue.name || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={venue.location || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={venue.capacity || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Number of people"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hourly Rate (₱)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={venue.hourly_rate || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={venue.description || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">
                Operating Hours
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="operating_hours_start"
                    value={venue.operating_hours_start || "08:00"}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="operating_hours_end"
                    value={venue.operating_hours_end || "17:00"}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Booking Settings */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">
                Booking Settings
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Advance Booking (Days)
                  </label>
                  <input
                    type="number"
                    name="booking_advance_days"
                    value={venue.booking_advance_days || 7}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="requires_approval"
                    checked={venue.requires_approval || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-xs font-medium text-gray-700">
                    Requires Approval
                  </label>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">
                Amenities
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {commonAmenities.map((amenity) => {
                  const isChecked = Array.isArray(venue.amenities) && venue.amenities.some(a => 
                    (typeof a === 'string' && a === amenity) || 
                    (typeof a === 'object' && a.name === amenity)
                  );
                  
                  const currentItem = isChecked ? venue.amenities.find(a => 
                    (typeof a === 'string' && a === amenity) || 
                    (typeof a === 'object' && a.name === amenity)
                  ) : null;

                  const quantity = currentItem && typeof currentItem === 'object' ? currentItem.quantity : 1;

                  return (
                  <div key={amenity} className="flex flex-col p-2 border border-gray-200 rounded-md">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        checked={isChecked}
                        onChange={() => handleAmenityChange(amenity)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={amenity}
                        className="text-xs font-medium text-gray-700 cursor-pointer select-none"
                      >
                        {amenity}
                      </label>
                    </div>
                    
                    {isChecked && (
                      <div className="flex items-center gap-2 ml-5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(amenity, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityInput(amenity, e.target.value)}
                          className="w-12 h-6 text-center text-xs border border-gray-300 rounded px-1"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(amenity, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 text-xs"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>

            {/* Assignment & Maintenance */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">
                Assignment & Maintenance
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assigned Department
                  </label>
                  <input
                    type="text"
                    name="assigned_department"
                    value={venue.assigned_department || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={venue.status || "Available"}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Maintenance
                  </label>
                  <input
                    type="date"
                    name="last_maintenance"
                    value={venue.last_maintenance || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Next Maintenance
                  </label>
                  <input
                    type="date"
                    name="next_maintenance"
                    value={venue.next_maintenance || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === 1 && (
          <div className="space-y-4">
            <Typography variant="h6" className="mb-2">
              Set Unavailability Schedule
            </Typography>
            <Typography variant="small" className="mb-4 text-gray-600">
              Select dates on the calendar to mark periods when this venue is
              unavailable. Click on events to delete them.
            </Typography>

            {/* Horizontal Layout: Form on left, Calendar on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Add Unavailability Form - Left Side */}
              <div className="lg:col-span-1">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-full">
                  <Typography variant="small" className="font-semibold mb-3">
                    Add Unavailability Period
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newUnavailability.start_date || ""}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setNewUnavailability({
                            ...newUnavailability,
                            start_date: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newUnavailability.end_date || ""}
                        min={newUnavailability.start_date || new Date().toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setNewUnavailability({
                            ...newUnavailability,
                            end_date: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={newUnavailability.reason || ""}
                        onChange={(e) =>
                          setNewUnavailability({
                            ...newUnavailability,
                            reason: e.target.value,
                          })
                        }
                        placeholder="e.g., Maintenance, Holiday"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newUnavailability.description || ""}
                        onChange={(e) =>
                          setNewUnavailability({
                            ...newUnavailability,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleAddUnavailability}
                      color="blue"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Calendar - Right Side (Takes 2/3 of space) */}
              <div className="lg:col-span-2">
                <div className="border border-gray-200 rounded-lg p-4 h-full">
                  <CustomCalendar />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 w-full justify-between mt-4">
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined" color="blue">
              Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            {activeStep < 1 ? (
              <Button onClick={handleNext} color="blue">
                Next
              </Button>
            ) : (
              <Button
                onClick={submitVenue}
                color="blue"
                className="dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {mode === "edit" ? "Update" : "Save Venue"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 mt-2 text-sm">{errorMessage}</div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        handler={handleCancelDelete}
        size="sm"
        className="backdrop:bg-black/50"
      >
        <DialogHeader className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
          <Warning size={24} className="text-amber-500" weight="fill" />
          <span>Delete Unavailability Period</span>
        </DialogHeader>
        <DialogBody>
          <Typography className="font-normal text-sm text-gray-800 dark:text-gray-300">
            Are you sure you want to delete this unavailability period? This action
            cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            color="gray"
            onClick={handleCancelDelete}
            className="normal-case"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleConfirmDelete}
            className="normal-case"
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default VenueForm;

VenueForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
  initialValues: PropTypes.shape({
    venue_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string,
    capacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amenities: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          name: PropTypes.string,
          quantity: PropTypes.number
        })
      ])
    ),
    hourly_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    operating_hours_start: PropTypes.string,
    operating_hours_end: PropTypes.string,
    booking_advance_days: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    requires_approval: PropTypes.bool,
    assigned_department: PropTypes.string,
    last_maintenance: PropTypes.string,
    next_maintenance: PropTypes.string,
    additional_details: PropTypes.array,
  }),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

