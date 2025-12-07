import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardBody, Typography, Chip } from "@material-tailwind/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { VehicleContext } from "../context/VehicleContext";
import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";
import Header from "../../../layouts/header.js";

const formatDateTime = (value) => {
  if (!value) return "";
  const locale = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date)) return String(value);
  const hasTime = typeof value === "string" ? value.includes("T") || /\d{2}:\d{2}/.test(value) : true;
  const datePart = date.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  if (!hasTime) return datePart;
  const timePart = date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  return `${datePart} at ${timePart}`;
};

const VehicleCalendar = () => {
  const { vehicles, fetchVehicles, fetchAllVehicleUnavailability, fetchVehicleUnavailabilityById, fetchVehicleBookings, loading } = useContext(VehicleContext);

  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [unavailability, setUnavailability] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [ModalComponent, setModalComponent] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLocalLoading(true);
        await fetchVehicles();
        const [u, b] = await Promise.all([
          fetchAllVehicleUnavailability(),
          fetchVehicleBookings(),
        ]);
        if (mounted) {
          setUnavailability(u || []);
          setBookings(b || []);
        }
      } catch (e) {
        if (mounted) setError("Failed to load vehicle data");
      } finally {
        setLocalLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadByFilter = async () => {
      try {
        setLocalLoading(true);
        if (vehicleFilter === "all") {
          const [u, b] = await Promise.all([
            fetchAllVehicleUnavailability(),
            fetchVehicleBookings(),
          ]);
          if (mounted) {
            setUnavailability(u || []);
            setBookings(b || []);
          }
        } else {
          const vid = vehicleFilter;
          const [u, b] = await Promise.all([
            fetchVehicleUnavailabilityById(vid),
            fetchVehicleBookings(vid),
          ]);
          if (mounted) {
            setUnavailability(u || []);
            setBookings(b || []);
          }
        }
      } catch (e) {
        setError("Failed to load vehicle data");
      } finally {
        setLocalLoading(false);
      }
    };
    loadByFilter();
    return () => { mounted = false; };
  }, [vehicleFilter]);

  useEffect(() => {
    let cancelled = false;
    const loadModal = async () => {
      if (sidebarOpen && selectedReferenceNumber && !ModalComponent) {
        const mod = await import(
          "../../request_management/component/request_details_view/ModalView.jsx"
        );
        if (!cancelled) setModalComponent(() => mod.default);
      }
    };
    loadModal();
    return () => { cancelled = true; };
  }, [sidebarOpen, selectedReferenceNumber, ModalComponent]);

  const events = useMemo(() => {
    const getVehicleId = (item) => item.vehicle_id || item.vehicle?.id || item.resource_id;
    const getVehicleName = (vid) => {
      const v = vehicles.find((x) => String(x.vehicle_id || x.id) === String(vid));
      return v?.name || v?.reference_number || `Vehicle ${vid}`;
    };
    const shouldInclude = (item) => {
      if (vehicleFilter === "all") return true;
      return String(getVehicleId(item)) === String(vehicleFilter);
    };

    const bookingEvents = (bookings || [])
      .filter(shouldInclude)
      .map((b) => {
        const vid = getVehicleId(b);
        const start = b.start_date || b.booking_date || b.start;
        const end = b.end_date || b.end;
        return {
          title: `${getVehicleName(vid)} - ${b.event_title || b.title || "Booked"}`,
          start,
          end: end || undefined,
          allDay: !start?.includes("T"),
          backgroundColor: "#FFA500",
          borderColor: "#FFA500",
          textColor: "#ffffff",
          extendedProps: { ...b, kind: "booking" },
        };
      });

    const unavailEvents = (unavailability || [])
      .filter(shouldInclude)
      .map((u) => {
        const vid = getVehicleId(u);
        return {
          title: `${getVehicleName(vid)} - ${u.reason || "Unavailable"}`,
          start: u.start_date || u.start,
          end: u.end_date || u.end,
          allDay: true,
          backgroundColor: "#FF0000",
          borderColor: "#FF0000",
          textColor: "#ffffff",
          extendedProps: { ...u, kind: "unavailable" },
        };
      });

    return [...bookingEvents, ...unavailEvents];
  }, [bookings, unavailability, vehicles, vehicleFilter]);

  return (
    <div className="w-full p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4 min-h-screen flex flex-col" role="region" aria-label="Vehicle Calendar" aria-live="polite">
      <Card className="shadow-none">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <Header title="Vehicle Calendar" description="Consolidated view of vehicle availability." />
        </CardHeader>
        <CardBody className="px-2 py-2 flex-1 flex flex-col">
          {localLoading || loading ? (
            <Typography className="text-sm text-gray-500">Loading…</Typography>
          ) : error ? (
            <Typography className="text-sm text-red-500">{error}</Typography>
          ) : (
            <div className="w-full flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-3 text-xs items-center">
                  {/* Color scheme: booked = orange (#FFA500), unavailable = red (#FF0000) */}
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-white border border-gray-200"></div><span className="text-gray-600">Available</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-100 border-2 border-orange-400"></div><span className="text-gray-600">Booked/Pending</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border-2 border-red-400"></div><span className="text-gray-600">Unavailable</span></div>
                </div>
                <div className="flex gap-2 items-center justify-end mb-5">
                  <select aria-label="Vehicle" data-testid="vehicle-select" className="px-3 py-2 text-sm bg-white border rounded-md" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                    <option value="all">All vehicles</option>
                    {vehicles.map((v) => (
                      <option key={v.vehicle_id || v.id} value={v.vehicle_id || v.id}>{v.name || v.reference_number || `Vehicle ${v.vehicle_id || v.id}`}</option>
                    ))}
                  </select>
                  <select aria-label="Booking Status" data-testid="status-filter" className="px-3 py-2 text-sm bg-white border rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Show all events</option>
                    <option value="booked">Show booked slots only</option>
                    <option value="unavailable">Show unavailable slots only</option>
                  </select>
                </div>
              </div>
              <div className="h-full">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
                  events={events.filter((e) => {
                    if (statusFilter === "all") return true;
                    if (statusFilter === "booked") return e.extendedProps?.kind === "booking";
                    if (statusFilter === "unavailable") return e.extendedProps?.kind === "unavailable";
                    return true;
                  })}
                  eventContent={(arg) => {
                    const { title, extendedProps } = arg.event;
                    if (extendedProps?.kind === "booking") {
                      return (
                        <Chip
                          data-kind="booking"
                          data-color="orange"
                          value={title}
                          color="orange"
                          className="!text-white text-wrap whitespace-normal text-xs h-fit font-medium px-2 py-1 cursor-pointer !border-none"
                          style={{ backgroundColor: "#FFA500" }}
                          aria-label={`Booking: ${title}`}
                        />
                      );
                    }
                    return (
                      <div
                        data-kind="unavailable"
                        className="text-xs font-medium px-2 py-1 rounded-md"
                        style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
                        aria-label={`UNAVAILABLE: ${title.toUpperCase()}`}
                      >
                        {title.toUpperCase()}
                      </div>
                    );
                  }}
                  height="auto"
                  handleWindowResize={true}
                  expandRows={true}
                  eventClick={(info) => {
                    setSelectedEvent(info.event);
                    const ref = info.event.extendedProps?.vehicle_request_id;
                    if (ref) setSelectedReferenceNumber(ref);
                    else setSelectedReferenceNumber(null);
                    setSidebarOpen(true);
                  }}
                  windowResize={() => calendarRef.current?.getApi().updateSize()}
                  views={{ dayGridMonth: { contentHeight: "auto" } }}
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
          aria-modal="true"
          role="dialog"
          aria-label="Event details"
        >
          {selectedEvent?.extendedProps?.kind === "unavailable" ? (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <UnavailabilityModal
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                eventProps={selectedEvent?.extendedProps}
              />
            </div>
          ) : selectedReferenceNumber ? (
            <div
              className="bg-white dark:bg-gray-900 w-full h-full lg:max-w-[80vw] lg:max-h-[90vh] overflow-y-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {ModalComponent ? (
                <ModalComponent
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  referenceNumber={selectedReferenceNumber}
                  asModal={true}
                />
              ) : (
                <div className="p-4">Loading…</div>
              )}
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CompactEventDetails
                onClose={() => setSidebarOpen(false)}
                title={selectedEvent ? selectedEvent.title : ""}
                status={selectedEvent?.extendedProps?.status || selectedEvent?.extendedProps?.reason || ""}
                kind={selectedEvent?.extendedProps?.kind}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UnavailabilityModal = ({ open, onClose, eventProps }) => {
  const reason = eventProps?.reason || "Unavailable";
  const start = eventProps?.start || eventProps?.start_date || eventProps?.start_time;
  const end = eventProps?.end || eventProps?.end_date || eventProps?.end_time;
  const notes = eventProps?.description || eventProps?.notes || "";
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-xl p-5" aria-label="Unavailability details">
          <div className="flex justify-between items-center mb-3">
            <Typography className="text-base font-semibold">Vehicle Unavailability</Typography>
            <button className="text-sm px-2 py-1" onClick={onClose} aria-label="Close">Close</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">{reason}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">Duration:</span> {start ? formatDateTime(start) : ""} {end ? `– ${formatDateTime(end)}` : ""}
            </div>
            {notes && (
              <div className="text-sm">
                <span className="font-semibold">Notes:</span> {notes}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

UnavailabilityModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  eventProps: PropTypes.object,
};

UnavailabilityModal.defaultProps = {
  open: false,
  onClose: () => {},
  eventProps: {},
};

const CompactEventDetails = ({ onClose, title, status, kind }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-xl p-5" aria-label="Event details panel">
      <div className="flex justify-between items-center mb-3">
        <Typography className="text-base font-semibold">Event Details</Typography>
        <button className="text-sm px-2 py-1" onClick={onClose} aria-label="Close">Close</button>
      </div>
      <div className="space-y-2 text-sm">
        <div><span className="font-semibold">Type:</span> {kind}</div>
        <div><span className="font-semibold">Title:</span> {title}</div>
        <div><span className="font-semibold">Status:</span> {status}</div>
      </div>
    </motion.div>
  );
};

CompactEventDetails.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
  status: PropTypes.string,
  kind: PropTypes.string,
};

CompactEventDetails.defaultProps = {
  onClose: () => {},
  title: "",
  status: "",
  kind: "",
};

export default VehicleCalendar;
