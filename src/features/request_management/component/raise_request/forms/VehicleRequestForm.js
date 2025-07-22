import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@material-tailwind/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { VehicleRequestsContext } from "../../../context/VehicleRequestsContext";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import MapboxAddressPicker from "../../../../../components/map_address_picker/MapboxAddressPicker";

const VehicleRequestForm = ({ setSelectedRequest }) => {
  const mapboxAddressPickerRef = useRef();

  const [selectedLocation, setSelectedLocation] = useState(null);

  const { user } = useContext(AuthContext);

  const { allUserInfo, getUserByReferenceNumber, fetchUsers } =
    useContext(UserContext);

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
      url: "/assets/",
      withCredentials: true,
    })
      .then((response) => {
        const vehicleAssets = [];
        response.data.forEach((asset) => {
          if (asset.asset_type === "Vehicle") {
            vehicleAssets.push(asset);
          }
        });
        setVehicleOptions(vehicleAssets);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...formErrors };

    // Date validation
    if (name === "date_of_trip") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);

      if (selectedDate < today) {
        newErrors.date_of_trip = "Date cannot be in the past.";
      } else if (user.access_level === "user") {
        const oneWeekFromToday = new Date(today);
        oneWeekFromToday.setDate(today.getDate() + 7);

        if (selectedDate < oneWeekFromToday) {
          newErrors.date_of_trip =
            "Requests should be at least one week prior. For urgent requests, contact GSO.";
        } else {
          delete newErrors.date_of_trip;
        }
      } else {
        delete newErrors.date_of_trip;
      }
    }

    // Time validation
    if (name === "time_of_departure" || name === "time_of_arrival") {
      const tempRequest = { ...request, [name]: value };
      const { time_of_departure, time_of_arrival } = tempRequest;

      if (
        time_of_departure &&
        time_of_arrival &&
        time_of_departure >= time_of_arrival
      ) {
        newErrors.time = "Departure time must be earlier than arrival time.";
      } else {
        delete newErrors.time;
      }
    }

    setFormErrors(newErrors);
    setRequest((prev) => ({ ...prev, [name]: value }));
  };

  // Handle destination selection
  const handleDestinationSelect = (place) => {
    setRequest((prev) => ({
      ...prev,
      destination: place.place_name,
      destination_coordinates: place.coordinates,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentResponse = await axios.get(`${process.env.REACT_APP_API_URL}/settings/department`, {
          withCredentials: true,
        });

        if (Array.isArray(departmentResponse.data.departments)) {
          setDepartmentOptions(departmentResponse.data.departments);
        }

        // Add here the fetch for Vehicles
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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

      const requesterId = allUserInfo.find(
        (user) => user.reference_number === request.requester
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
      }
    } catch (error) {
      console.error("Error submitting vehicle request:", error);
    }
  };

  return (
    <div className="py-2 text-sm space-y-4">
      {/* Requester */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Vehicle Requested & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {/* <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vehicle Requested
          </label>
          <select
            name="vehicle_requested"
            value={request.vehicle_requested || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Vehicle</option>
            {vehicleOptions?.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.name}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </div> */}

        {/* <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Destination
          </label>
          <input
            type="text"
            name="destination"
            value={request.destination || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
          />
        </div> */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Destination
          </label>
          <MapboxAddressPicker
            ref={mapboxAddressPickerRef}
            onSelect={handleDestinationSelect}
            token={
              "pk.eyJ1IjoiZnJsYXZlbiIsImEiOiJjbWJvaDBmdWoxbmp2Mm1xd3ljbHRiZjNjIn0.fehjAYZ5XQ-62DcWUq-hjQ"
            }
          />

          {/* Add hidden field for coordinates if needed */}
          <input
            type="hidden"
            name="destination_coordinates"
            value={
              request.destination_coordinates
                ? JSON.stringify(request.destination_coordinates)
                : ""
            }
          />

          {!request.destination && formErrors.destination && (
            <p className="text-xs text-red-500 mt-1">
              {formErrors.destination}
            </p>
          )}
        </div>
      </div>

      {/* Date of Trip, Departure & Arrival Times */}
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
            required
          />
          {formErrors.time && (
            <p className="text-xs text-red-500 col-span-3">{formErrors.time}</p>
          )}
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Number of Passengers */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Number of Passengers
        </label>
        <input
          type="number"
          name="number_of_passengers"
          value={request.number_of_passengers || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose
        </label>
        <textarea
          name="purpose"
          value={request.purpose}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
          required
        />
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      {/* Submit Button */}
      <Button
        color="blue"
        type="submit"
        onClick={submitVehicleRequest}
        disabled={
          !request.title ||
          !request.destination ||
          !request.date_of_trip ||
          !request.time_of_departure ||
          !request.time_of_arrival ||
          !request.number_of_passengers ||
          !request.purpose
        }
        className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
      >
        Submit Request
      </Button>
    </div>
  );
};

export default VehicleRequestForm;
