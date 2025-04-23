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
import { MagnifyingGlass } from "@phosphor-icons/react";
import { AuthContext } from "../../../authentication";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import SidebarView from "../../../../components/sidebar/SidebarView";

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

  const getRequestData = () => {
    switch (requestType) {
      case "job_request":
        return jobRequests;
      case "purchasing_request":
        return purchasingRequests;
      case "vehicle_request":
        return vehicleRequests;
      case "venue_request":
        return venueRequests;
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchJobRequests?.();
    fetchPurchasingRequests?.();
    fetchVehicleRequests?.();
    fetchVenueRequests?.();
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      // Trigger updateSize whenever there's a click anywhere on the page
      setInterval(() => {
        calendarRef.current?.getApi().updateSize();
      }, [50]);
    };

    // Add global click event listener
    window.addEventListener("click", handleGlobalClick);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("click", handleGlobalClick);
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

      return matchesSearch && matchesStatus && matchesDepartment;
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

  const getVehicleTripDateTime = (date, time) => {
    const departureDate = new Date(date);
    const [hours, minutes] = time.split(":");
    departureDate.setHours(hours);
    departureDate.setMinutes(minutes);
    departureDate.setSeconds(0);
    return departureDate.toISOString();
  };

  const events = filteredTasks().map((task) => {
    let start = "";
    let end = "";
    let allDay = false;

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

    return {
      title: `${task.title || "Untitled"} (${task.status})`,
      start,
      ...(end && { end }),
      allDay,
      extendedProps: {
        referenceNumber: task.reference_number,
        department: task.department,
        requestType: requestType,
      },
      backgroundColor: "white",
      borderColor: "white",
    };
  });

  const handleEventClick = (info) => {
    setSelectedReferenceNumber(info.event.extendedProps.referenceNumber);
    setSidebarOpen(true); // Open the sidebar when event is clicked
    calendarRef.current?.getApi().updateSize(); // Trigger the updateSize method on click
  };

  return (
    <div className="flex justify-between h-full bg-white">
      <div
        className={`h-full bg-white rounded-lg w-full mt-0 p-1 flex justify-between transition-[max-width] duration-300 ${
          sidebarOpen ? "max-w-[65%]" : "w-full"
        }`}
      >
        <div className="w-full bg-white dark:bg-gray-900 space-y-6 transition-colors">
          <div className="h-full bg-white rounded-lg w-full mt-0 p-1">
            <CardHeader
              floated={false}
              shadow={false}
              className="rounded-none min-h-fit pb-2"
            >
              <div className="mb-1 flex items-center justify-between gap-5">
                <Typography color="black" className="text-lg px-3 font-bold">
                  Calendar Board
                </Typography>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 gap-4 mt-2 w-full">
                <div className="relative w-full max-w-[230px] min-w-[150px]">
                  <input
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value.toLowerCase())
                    }
                  />
                  <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
                    <MagnifyingGlass size={16} />
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center gap-2 w-full">
                  <div className="w-full">
                    <RequestFilter
                      filters={filters}
                      onFilterChange={setFilters}
                    />
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
                          variant={
                            requestType === "job_request" ? "filled" : "ghost"
                          }
                          color={
                            requestType === "job_request" ? "blue" : "gray"
                          }
                          className="cursor-pointer w-fit"
                        />
                        <Chip
                          value="Purchasing Requests"
                          onClick={() => setRequestType("purchasing_request")}
                          variant={
                            requestType === "purchasing_request"
                              ? "filled"
                              : "ghost"
                          }
                          color={
                            requestType === "purchasing_request"
                              ? "green"
                              : "gray"
                          }
                          className="cursor-pointer w-fit"
                        />
                        <Chip
                          value="Vehicle Requests"
                          onClick={() => setRequestType("vehicle_request")}
                          variant={
                            requestType === "vehicle_request"
                              ? "filled"
                              : "ghost"
                          }
                          color={
                            requestType === "vehicle_request" ? "amber" : "gray"
                          }
                          className="cursor-pointer w-fit"
                        />
                        <Chip
                          value="Venue Requests"
                          onClick={() => setRequestType("venue_request")}
                          variant={
                            requestType === "venue_request" ? "filled" : "ghost"
                          }
                          color={
                            requestType === "venue_request" ? "purple" : "gray"
                          }
                          className="cursor-pointer w-fit"
                        />
                      </MenuList>
                    </Menu>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              <div className="calendar-container h-[59vh] lg:h-[70vh] lg:overflow-y-auto lg:overflow-x-auto">
                <FullCalendar
                  ref={calendarRef} // Add the ref to FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  height="auto"
                  handleWindowResize={true}
                  expandRows={true}
                  events={events}
                  eventClick={handleEventClick}
                  eventContent={(arg) => {
                    const { title, extendedProps } = arg.event;
                    const typeColor =
                      requestTypeColor[extendedProps.requestType] || "gray";

                    return (
                      <Chip
                        value={title}
                        color={typeColor}
                        className="!text-white text-wrap whitespace-normal text-xs h-fit font-medium px-2 py-1 cursor-pointer !border-none"
                      />
                    );
                  }}
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
      <SidebarView
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        referenceNumber={selectedReferenceNumber}
      />
    </div>
  );
};

export default CalendarView;
