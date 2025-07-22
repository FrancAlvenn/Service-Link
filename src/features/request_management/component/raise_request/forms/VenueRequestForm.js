// ... [imports remain unchanged]
import { AuthContext } from "../../../../authentication";
import { UserContext } from "../../../../../context/UserContext";
import { VenueRequestsContext } from "../../../context/VenueRequestsContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Button, Typography } from "@material-tailwind/react";
import {
  FloppyDisk,
  Info,
  PencilSimpleLine,
  Plus,
  Prohibit,
  X,
} from "@phosphor-icons/react";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";

const VenueRequestForm = ({ setSelectedRequest }) => {
  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers } =
    useContext(UserContext);
  const { venueRequests, fetchVenueRequests } =
    useContext(VenueRequestsContext);

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

  // New: Individual error states
  const [formErrors, setFormErrors] = useState({});
  const [formWarnings, setFormWarnings] = useState({});

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
    axios.get("/assets/", { withCredentials: true }).then((response) => {
      const venues =
        response.data === null || response.data.length === 0
          ? []
          : response.data.filter((a) => a.asset_type === "Venue");
      setVenueOptions(venues);
    });
  }, []);

  let conflicts = [];

  const checkBookingConflicts = () => {
    if (
      !request.venue_id ||
      !request.event_dates ||
      !request.event_start_time ||
      !request.event_end_time
    )
      return;

    // If venueRequests is undefined or empty, skip the check
    if (!Array.isArray(venueRequests) || venueRequests.length === 0) {
      // Clear any previous messages
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

      // Skip if not same venue or date
      if (existingVenueId !== targetVenueId || existingDate !== targetDate) {
        return false;
      }

      // Parse times
      const newStart = new Date(`1970-01-01T${request.event_start_time}`);
      const newEnd = new Date(`1970-01-01T${request.event_end_time}`);
      const existStart = new Date(`1970-01-01T${existing.event_start_time}`);
      const existEnd = new Date(`1970-01-01T${existing.event_end_time}`);

      // Check time overlap
      const hasOverlap = newStart < existEnd && newEnd > existStart;

      // Check 30-minute grace period before/after
      const gracePeriodViolation =
        (newStart >= existStart &&
          newStart < new Date(existEnd.getTime() + 30 * 60000)) ||
        (existStart >= newStart &&
          existStart < new Date(newEnd.getTime() + 30 * 60000));

      return hasOverlap || gracePeriodViolation;
    });

    // Clear previous messages
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

  // Check for conflicts whenever relevant fields change
  useEffect(() => {
    // if (!venueRequests || !request) return;
    // // Inside the conflict useEffect, add:
    // console.log("Checking conflicts...", {
    //   venueId: { value: request.venue_id, type: typeof request.venue_id },
    //   date: { value: request.event_dates, type: typeof request.event_dates },
    //   venueRequests: venueRequests.map((vr) => ({
    //     venue: { value: vr.venue_id, type: typeof vr.venue_id },
    //     date: { value: vr.event_dates, type: typeof vr.event_dates },
    //   })),
    // });
    // console.log(conflicts);
    checkBookingConflicts();
  }, [request, venueRequests]);

  useEffect(() => {
    axios.get("/settings/department", { withCredentials: true }).then((res) => {
      if (Array.isArray(res.data.departments)) {
        setDepartmentOptions(res.data.departments);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedRequest = { ...request, [name]: value };

    // Time and date validation
    if (name === "event_dates") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const oneWeekFromNow = new Date();
      oneWeekFromNow.setHours(0, 0, 0, 0);
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setFormErrors((prev) => ({
          ...prev,
          date: "Event date cannot be in the past.",
        }));
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
          setFormErrors((prev) => ({
            ...prev,
            time: "End time must be later than start time.",
          }));
        } else if ((end - start) / (1000 * 60) < 60) {
          setFormErrors((prev) => ({
            ...prev,
            time: "Event duration must be at least 1 hour.",
          }));
        } else {
          setFormErrors((prev) => ({ ...prev, time: "" }));
        }
      }
    }

    setRequest(updatedRequest);
  };

  const handleAddParticular = (e) => {
    e.preventDefault();
    const newParticular = { particulars: "", quantity: 0, description: "" };
    const updatedDetails = [...request.details, newParticular];

    setRequest({
      ...request,
      details: updatedDetails,
    });

    // Set the new index to edit mode
    setEditingIndex(updatedDetails.length - 1);
    setEditedParticular(newParticular);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedParticular({ ...request.details[index] });
  };

  const handleSaveEdit = (index) => {
    const updatedDetails = [...request.details];
    updatedDetails[index] = editedParticular;
    setRequest({ ...request, details: updatedDetails });
    setEditingIndex(null);
  };

  const handleDetailRemove = (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest({ ...request, details: updatedDetails });
  };

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

      const requesterId = allUserInfo.find(
        (user) => user.reference_number === request.requester
      );

      if (
        request.event_nature === "others" &&
        !request.event_nature_other.trim()
      ) {
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

      let response = await axios.post(`${process.env.REACT_APP_API_URL}/venue_request`, requestData, {
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
    }
  };

  return (
    <div className="py-2 text-sm space-y-4 overflow-y-auto">
      {/* Requester, Department, Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requester */}
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
              {allUserInfo.map((user) => (
                <option
                  key={user.reference_number}
                  value={user.reference_number}
                >
                  {user.first_name} {user.last_name}
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
              <input
                type="hidden"
                name="requester"
                value={user.reference_number}
              />
            </>
          )}
        </div>

        {/* Venue */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Venue
          </label>
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
          Organization
        </label>
        <input
          type="text"
          name="organization"
          value={request.organization}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
          Event Title
        </label>
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
          Event Nature
        </label>
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Please Specify
            </label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Participants
          </label>
          <input
            type="text"
            name="participants"
            value={request.participants}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Pax Estimation
          </label>
          <input
            type="number"
            name="pax_estimation"
            value={request.pax_estimation}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
      </div>
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Event Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Event Date
          </label>
          <input
            type="date"
            name="event_dates"
            value={request.event_dates}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
          />
          {formErrors.date && (
            <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Start Time
          </label>
          <input
            type="time"
            name="event_start_time"
            value={request.event_start_time}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            End Time
          </label>
          <input
            type="time"
            name="event_end_time"
            value={request.event_end_time}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
          />
          {formErrors.time && (
            <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>
          )}
        </div>
      </div>
      {/* Booking conflict messages */}
      <div className="space-y-2">
        {formErrors.booking && (
          <p className="text-red-500 text-xs mt-2 flex items-start gap-1">
            {formErrors.booking}
            <span className="relative flex group">
              <Info
                size={14}
                className="text-red-500 cursor-pointer mt-0.5 transition-colors hover:text-red-700"
                weight="duotone"
              />
              {/* Tooltip: top-right aligned */}
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white text-gray-700 text-xs border border-red-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-50 pointer-events-none">
                {/* Arrow (bottom-right corner) */}
                <div className="absolute -bottom-1.5 right-2 w-3 h-3 bg-white border-b border-r border-red-200 rotate-45"></div>
                This means the venue has already been booked for this date and
                time. Try selecting a different time slot or another date.
              </div>
            </span>
          </p>
        )}

        {formWarnings.booking && (
          <p className="text-amber-500 text-xs mt-2 flex items-start gap-1">
            {formWarnings.booking}
            <span className="relative flex group">
              <Info
                size={14}
                className="text-amber-500 cursor-pointer mt-0.5 transition-colors hover:text-amber-600"
                weight="duotone"
              />
              {/* Tooltip: top-right aligned */}
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white text-gray-700 text-xs border border-amber-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-50 pointer-events-none">
                {/* Arrow (bottom-right corner) */}
                <div className="absolute -bottom-1.5 right-2 w-3 h-3 bg-white border-b border-r border-amber-200 rotate-45"></div>
                A pending request might conflict with your selected schedule.
                Approval is not guaranteed until conflicts are resolved.
              </div>
            </span>
          </p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose
        </label>
        <textarea
          name="purpose"
          value={request.purpose}
          onChange={(e) => handleChange(e)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
          required
        />
      </div>

      {/* Particulars Section */}
      <div className="space-y-2">
        <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          Particulars
        </Typography>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 dark:border-gray-600">Item</th>
                <th className="px-4 py-2 dark:border-gray-600">Quantity</th>
                <th className="px-4 py-2  dark:border-gray-600">Description</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {request.details.map((detail, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-300 dark:border-gray-600"
                >
                  {editingIndex === index ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editedParticular.particulars}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              particulars: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-400 rounded-md dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editedParticular.quantity}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              quantity: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-400 rounded-md dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <textarea
                          value={editedParticular.description}
                          rows={1}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-400 rounded-md dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="text-green-500"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <FloppyDisk size={18} />
                        </button>
                        <button
                          className="text-red-500"
                          onClick={() => setEditingIndex(null)}
                        >
                          <Prohibit size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{detail.particulars}</td>
                      <td className="px-4 py-2">x{detail.quantity}</td>
                      <td className="px-4 py-2">{detail.description}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="text-blue-500"
                          onClick={() => handleEditClick(index)}
                        >
                          <PencilSimpleLine size={18} />
                        </button>
                        <button
                          className="text-red-500"
                          onClick={() => handleDetailRemove(index)}
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Particular Button */}
        <Button
          color="green"
          variant="outlined"
          onClick={handleAddParticular}
          className="flex items-center gap-1 px-3 py-2 border rounded-md hover:text-green-500 dark:border-gray-600"
        >
          <Plus size={18} />
          <Typography className="text-xs">Add Particular</Typography>
        </Button>
      </div>

      {/* The rest of the form (participants, purpose, details, submit) remains unchanged... */}
      {/* You can copy your previous implementation here as it does not affect the new logic */}

      {/* Submit Button */}
      <Button
        color="blue"
        type="submit"
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
          formErrors.time
        }
        className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
      >
        Submit Request
      </Button>
    </div>
  );
};

export default VenueRequestForm;
