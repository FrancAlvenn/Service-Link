import React, { useContext, useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { VehicleRequestsContext } from "../../../context/VehicleRequestsContext";

const VehicleRequestForm = ({ setSelectedRequest }) => {
  const { user } = useContext(AuthContext);

  const { allUserInfo, getUserByReferenceNumber } = useContext(UserContext);

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
    department: user.department || "",
    designation: user.designation || "",
    purpose: "",
    remarks: "",
    approvers: [],
  });

  const requestType = "Vehicle Request";

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [vehicleOptions, setVehicleOptions] = useState([]);

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

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    // Validate Date: Ensure date_required is not in the past
    if (e.target.name === "date_of_trip") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day for accuracy
      const selectedDate = new Date(e.target.value);

      if (selectedDate < today) {
        setErrorMessage("Invalid Date");
        // ToastNotification.error("Invalid Date", "Date cannot be in the past.");
        return; // Exit without updating state
      }
    }

    // Validate Time: Ensure event_start_time is not later than event_end_time
    if (
      e.target.name === "time_of_departure" ||
      e.target.name === "time_of_arrival"
    ) {
      const { time_of_departure, time_of_arrival } = {
        ...request,
        [e.target.name]: e.target.value,
      };

      if (
        time_of_departure &&
        time_of_arrival &&
        time_of_departure >= time_of_arrival
      ) {
        setErrorMessage(
          "Invalid Time. Departure time must be earlier than arrival time."
        );
        // ToastNotification.error("Invalid Time", "Departure time must be earlier than arrival time.");
        return; // Exit without updating state
      }
    }

    setErrorMessage("");
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentResponse = await axios.get("/settings/department", {
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
      const requestData = {
        ...request,
        authorized_access: [
          ...(request.authorized_access || []),
          user.reference_number,
        ],
      };

      const response = await axios({
        method: "POST",
        url: "/vehicle_request",
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
          department: "",
          designation: "",
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
      {/* Requester & Department */}
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

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <select
            name="department"
            value={request.department || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Select Department</option>
            {departmentOptions?.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
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

        <div>
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
          {errorMessage === "Invalid Date" && (
            <p className="text-xs text-red-500">{errorMessage}</p>
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
          {errorMessage ===
            "Invalid Time. Departure time must be earlier than arrival time." && (
            <p className="text-xs text-red-500">{errorMessage}</p>
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
          !request.department ||
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
