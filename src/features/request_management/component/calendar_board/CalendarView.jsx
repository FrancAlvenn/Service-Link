import { useContext, useEffect, useState, useRef } from "react";
import { JobRequestsContext } from "../../context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../context/VenueRequestsContext";
import {
  CardBody,
  CardHeader,
  Chip,
  MenuHandler,
  MenuList,
  Typography,
  MenuItem,
  Menu,
} from "@material-tailwind/react";
import RequestFilter from "../../utils/requestFilter";
import {
  LockSimple,
  LockSimpleOpen,
  MagnifyingGlass,
  PencilSimple,
  PencilSimpleLine,
  PencilSimpleSlash,
} from "@phosphor-icons/react";
import { AuthContext } from "../../../authentication";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import SidebarView from "../../../../components/sidebar/SidebarView";
import { throttle } from "lodash";
import axios from "axios";
import ToastNotification from "../../../../utils/ToastNotification";
import Header from "../../../../layouts/header";
import ModalView from "../request_details_view/ModalView";

const CalendarView = () => {
  const [status, setStatus] = useState([]);
  const [requestType, setRequestType] = useState("job_request");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState(null); // Store selected reference number

  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests } = useContext(
    PurchasingRequestsContext
  );
  const { vehicleRequests, fetchVehicleRequests } = useContext(
    VehicleRequestsContext
  );
  const { venueRequests, fetchVenueRequests } =
    useContext(VenueRequestsContext);
  const { user } = useContext(AuthContext);

  const calendarRef = useRef(null); // Ref for FullCalendar

  const [isAuthorized, setIsAuthorized] = useState(false);

  const getRequestData = () => {
    let data;
    switch (requestType) {
      case "job_request":
        data = jobRequests;
        break;
      case "purchasing_request":
        data = purchasingRequests;
        break;
      case "vehicle_request":
        data = vehicleRequests;
        break;
      case "venue_request":
        data = venueRequests;
        break;
      default:
        data = [];
    }

    // FIX: Add type checking and error handling to ensure data is always an array.
    // This prevents "requestData is not a function" or similar errors when .filter() is called
    // if the context data is undefined or null (e.g., during loading or type switching).
    if (!Array.isArray(data)) {
      if (data !== undefined && data !== null) {
        console.warn(
          `CalendarView: Expected array for ${requestType}, received:`,
          data
        );
      }
      return [];
    }

    return data;
  };

  useEffect(() => {
    fetchJobRequests?.();
    fetchPurchasingRequests?.();
    fetchVehicleRequests?.();
    fetchVenueRequests?.();
  }, []);

  useEffect(() => {
    let timeoutId = null;

    const updateSize = () => {
      if (timeoutId) return;

      timeoutId = setTimeout(() => {
        calendarRef.current?.getApi().updateSize();
        timeoutId = null;
      }, 200); // Debounce with 200ms delay
    };

    const handleGlobalInteraction = () => {
      updateSize();
    };

    window.addEventListener("click", handleGlobalInteraction);
    window.addEventListener("touchend", handleGlobalInteraction); // For tablet & mobile

    return () => {
      window.removeEventListener("click", handleGlobalInteraction);
      window.removeEventListener("touchend", handleGlobalInteraction);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const filteredTasks = () => {
    return getRequestData().filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchQuery) ||
        task.reference_number?.toLowerCase().includes(searchQuery);

      const matchesStatus = filters.status
        ? task.status === filters.status
        : true;
      const matchesDepartment = filters.department
        ? task.department
            ?.toLowerCase()
            .includes(filters.department.toLowerCase())
        : true;

      const matchesPriority =
        !filters.priority || task.priority === filters.priority;

      return (
        matchesSearch && matchesStatus && matchesDepartment && matchesPriority
      );
    });
  };

  const requestTypeColor = {
    job_request: "blue",
    purchasing_request: "green",
    venue_request: "purple",
    vehicle_request: "orange",
  };

  const bgColorClass = {
    job_request: "#3b82f6", // Tailwind blue-500
    purchasing_request: "#22c55e", // Tailwind green-500
    venue_request: "#a855f7", // Tailwind purple-500
    vehicle_request: "#f59e0b", // Tailwind amber-500
  };

  const pillColorClass = {
    job_request: "bg-blue-700", // Tailwind blue-700
    purchasing_request: "bg-green-700", // Tailwind green-700
    venue_request: "bg-purple-700", // Tailwind purple-700
    vehicle_request: "bg-amber-700", // Tailwind amber-700
  };

  const getVehicleTripDateTime = (date, time) => {
    const departureDate = new Date(date);
    const [hours, minutes] = time.split(":");
    departureDate.setHours(hours);
    departureDate.setMinutes(minutes);
    departureDate.setSeconds(0);
    return departureDate.toISOString();
  };

  // Date/time display formatting standard:
  // - Locale-based date with 2-digit month/day/year
  // - 12-hour time with leading zeros and AM/PM
  // - Example: "01/22/2026 09:05 AM"
  const formatLocalDateTime = (dateObj) => {
    const datePart = dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timePart = dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  };

  const makeLocalDateFromYMDHM = (ymd, hm) => {
    const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
    const [hh = "0", mm = "0"] = (hm || "00:00").split(":");
    return new Date(y, (m || 1) - 1, d || 1, parseInt(hh, 10), parseInt(mm, 10), 0);
  };

  const getDateDisplay = (task) => {
    if (task.event_dates && task.event_start_time && task.event_end_time) {
      const startObj = makeLocalDateFromYMDHM(task.event_dates, task.event_start_time);
      const endObj = makeLocalDateFromYMDHM(task.event_dates, task.event_end_time);
      const startStr = formatLocalDateTime(startObj);
      const endStr = endObj
        ? endObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true })
        : "";
      return `${startStr}${endStr ? ` - ${endStr}` : ""}`;
    }
    if (task.date_of_trip && task.time_of_departure) {
      const tripObj = makeLocalDateFromYMDHM(task.date_of_trip, task.time_of_departure);
      return formatLocalDateTime(tripObj);
    }
    if (task.date_required) {
  const ymd = task.date_required.split(" ")[0];
  const dateObj = makeLocalDateFromYMDHM(ymd, "00:00");

  // This returns just the date portion based on the user's locale
  return dateObj.toLocaleDateString(); 
  }
    if (task.event_dates) {
      const ymd = task.event_dates.split(" ")[0];
      const dateObj = makeLocalDateFromYMDHM(ymd, "00:00");
      return formatLocalDateTime(dateObj);
    }
    return "";
  };

  const events = filteredTasks().map((task) => {
    let start = "";
    let end = "";
    let allDay = false;
     const dateDisplay = getDateDisplay(task);

    if (task.date_required) {
      start = task.date_required.split(" ")[0];
      allDay = true;
    } else if (
      task.event_dates &&
      task.event_start_time &&
      task.event_end_time
    ) {
      start = `${task.event_dates}T${task.event_start_time}`;
      end = `${task.event_dates}T${task.event_end_time}`;
    } else if (task.date_of_trip && task.time_of_departure) {
      start = getVehicleTripDateTime(task.date_of_trip, task.time_of_departure);
    } else if (task.event_dates) {
      start = task.event_dates.split(" ")[0];
      allDay = true;
    }

    const hasAccess =
      task.authorized_access?.includes(user.reference_number) ?? false;

    return {
      title: task.title || "Untitled",
      start,
      ...(end && { end }),
      allDay,
      extendedProps: {
        referenceNumber: task.reference_number,
        department: task.department,
        requestType: requestType,
        status: task.status,
        hasAccess,
        dateDisplay,
      },
      backgroundColor: "white",
      borderColor: "white",
    };
  });

  const renderEventContent = (arg) => {
    const { title, extendedProps } = arg.event;
    const { hasAccess, dateDisplay } = extendedProps;
    const typeColor = requestTypeColor[extendedProps.requestType] || "gray";

    const pillBgColor = pillColorClass[requestType] || "#4b5563";
    const chipValue = dateDisplay ? `${title} • ${dateDisplay}` : title;

    return (
      <Chip
        value={chipValue}
        color={typeColor}
        className={`!text-white text-wrap whitespace-normal text-xs h-fit font-medium px-2 py-1 cursor-pointer relative ${
          !hasAccess ? "bg-gray-400" : ""
        }`}
        icon={
          hasAccess ? (
            <div className={`w-3 h-3 rounded-full ${pillBgColor}`} />
          ) : null
        }
      />
    );
  };

  const handleEventClick = (info) => {
    setSelectedReferenceNumber(info.event.extendedProps.referenceNumber);
    setSidebarOpen(true); // Open the sidebar when event is clicked
    calendarRef.current?.getApi().updateSize(); // Trigger the updateSize method on click
  };

  const getLocalDateOnly = (date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const handleEventDrop = async (info) => {
    const { referenceNumber, requestType } = info.event.extendedProps;
    const droppedStart = info.event.start;
    const droppedEnd = info.event.end;
    const viewType = info.view.type;

    const originalDurationMs = droppedEnd
      ? droppedEnd.getTime() - droppedStart.getTime()
      : 0;

    const dateOnly = getLocalDateOnly(droppedStart);
    const startTimeOnly = droppedStart.toTimeString().substring(0, 5);

    const requests = {
      job_request: jobRequests,
      purchasing_request: purchasingRequests,
      vehicle_request: vehicleRequests,
      venue_request: venueRequests,
    };

    const foundRequest = requests[requestType]?.find(
      (req) => req.reference_number === referenceNumber
    );

    const isAuthorized =
      foundRequest?.authorized_access?.includes(user.reference_number) || false;

    if (!isAuthorized) {
      ToastNotification.warning(
        "Unauthorized",
        "You do not have access to this request."
      );
      return info.revert();
    }

    let endTimeOnly = startTimeOnly;
    if (originalDurationMs > 0) {
      const newEnd = new Date(droppedStart.getTime() + originalDurationMs);
      endTimeOnly = newEnd.toTimeString().substring(0, 5);
    }

    let updateData = {};

    if (viewType === "dayGridMonth") {
      if (
        requestType === "job_request" ||
        requestType === "purchasing_request"
      ) {
        updateData = { date_required: dateOnly };
      } else if (requestType === "vehicle_request") {
        updateData = { date_of_trip: dateOnly };
      } else if (requestType === "venue_request") {
        updateData = { event_dates: dateOnly };
      }
    } else if (viewType === "timeGridWeek" || viewType === "timeGridDay") {
      if (requestType === "vehicle_request") {
        updateData = {
          date_of_trip: dateOnly,
          time_of_departure: startTimeOnly,
        };
      } else if (requestType === "venue_request") {
        updateData = {
          event_dates: dateOnly,
          event_start_time: startTimeOnly,
          event_end_time: endTimeOnly,
        };
      } else {
        ToastNotification.warning(
          "Not Allowed",
          "Date change is only allowed in Month view for this request type."
        );
        return info.revert();
      }
    }

    try {
      await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/${requestType}/${referenceNumber}`,
        data: updateData,
        withCredentials: true,
      });

      fetchJobRequests?.();
      fetchPurchasingRequests?.();
      fetchVehicleRequests?.();
      fetchVenueRequests?.();
    } catch (err) {
      console.error("Failed to update backend:", err);
      info.revert();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-2"
      >
        <Header title={"Calendar View"} />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 gap-4 mt-2 w-full">
          <div className="relative w-full max-w-[230px] min-w-[150px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center gap-2 w-full">
            <div className="w-full">
              <RequestFilter filters={filters} onFilterChange={setFilters} />
            </div>
            <div className="flex lg:flex-row lg:justify-end items-center gap-2 w-fit">
              <span className="text-xs font-semibold whitespace-nowrap text-gray-700 text-center sm:text-left">
                GROUP BY
              </span>
              <Menu placement="bottom-end">
                <MenuHandler>
                  <div className="cursor-pointer w-fit">
                    <Chip
                      value={requestType
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      variant="filled"
                      color={requestTypeColor[requestType] || "gray"}
                      className="pointer-events-none" // Prevent Chip's default click
                    />
                  </div>
                </MenuHandler>

                <MenuList className="flex flex-col flex-wrap gap-2 px-3 py-2">
                  <Chip
                    value="Job Requests"
                    onClick={() => setRequestType("job_request")}
                    variant={requestType === "job_request" ? "filled" : "ghost"}
                    color={requestType === "job_request" ? "blue" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                  <Chip
                    value="Purchasing Requests"
                    onClick={() => setRequestType("purchasing_request")}
                    variant={
                      requestType === "purchasing_request" ? "filled" : "ghost"
                    }
                    color={
                      requestType === "purchasing_request" ? "green" : "gray"
                    }
                    className="cursor-pointer w-fit"
                  />
                  <Chip
                    value="Vehicle Requests"
                    onClick={() => setRequestType("vehicle_request")}
                    variant={
                      requestType === "vehicle_request" ? "filled" : "ghost"
                    }
                    color={requestType === "vehicle_request" ? "amber" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                  <Chip
                    value="Venue Requests"
                    onClick={() => setRequestType("venue_request")}
                    variant={
                      requestType === "venue_request" ? "filled" : "ghost"
                    }
                    color={requestType === "venue_request" ? "purple" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="flex justify-between h-full bg-white">
        <div
          className={` bg-white rounded-lg w-full mt-0 p-1 flex justify-between transition-[max-width] duration-300 ${
            sidebarOpen ? "max-w-[55%]" : "w-full"
          }`}
        >
          <div className="w-full bg-white dark:bg-gray-900 space-y-6 transition-colors">
            <div className="h-full bg-white rounded-lg w-full mt-0 p-1">
              <CardBody className={`p-4  overflow-y-auto h-[80vh]`}>
                <div className="calendar-container h-full overflow-y-auto overflow-x-auto">
                  <FullCalendar
                    ref={calendarRef} // Add the ref to FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    editable={true}
                    droppable={true}
                    height="auto"
                    handleWindowResize={true}
                    expandRows={true}
                    events={events}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    // eventContent={(arg) => {
                    //   const { title, extendedProps } = arg.event;
                    //   const typeColor =
                    //     requestTypeColor[extendedProps.requestType] || "gray";

                    //   return (
                    //     <Chip
                    //       value={title}
                    //       color={typeColor}
                    //       className="!text-white text-wrap whitespace-normal text-xs h-fit font-medium px-2 py-1 cursor-pointer !border-none"
                    //     />
                    //   );
                    // }}
                    // Trigger resize when window is resized
                    windowResize={() =>
                      calendarRef.current?.getApi().updateSize()
                    }
                    views={{
                      dayGridMonth: {
                        contentHeight: "auto", // This allows it to take the height based on the container
                      },
                    }}
                  />
                </div>
              </CardBody>
            </div>
          </div>
        </div>

        {/* Sidebar for details view */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 w-full h-full lg:max-w-[80vw] lg:max-h-[90vh] overflow-y-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalView
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                referenceNumber={selectedReferenceNumber}
                asModal={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
