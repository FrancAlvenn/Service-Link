import React, { useContext, useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import ReactQuill from "react-quill";

const VehicleRequestForm = () => {
    const { user } = useContext(AuthContext);
    const { getUserByReferenceNumber } = useContext(UserContext);

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
        department: "",
        designation: "",
        purpose: "",
        remarks: "",
        vehicle_id: "",
    });

    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [vehicleOptions, setVehicleOptions] = useState([]);

    const handleChange = (e) => {
        setRequest({ ...request, [e.target.name]: e.target.value });
    };

    const handleQuillChange = (value) => {
        setRequest({ ...request, purpose: value });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const departmentResponse = await axios.get("/settings/department", { withCredentials: true });
                if (Array.isArray(departmentResponse.data.departments)) {
                    setDepartmentOptions(departmentResponse.data.departments);
                }

                const vehicleResponse = await axios.get("/settings/vehicles", { withCredentials: true });
                if (Array.isArray(vehicleResponse.data.vehicles)) {
                    setVehicleOptions(vehicleResponse.data.vehicles);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const submitVehicleRequest = async () => {
        try {
            const requestData = { ...request };

            const response = await axios.post("/vehicle_request", requestData, { withCredentials: true });

            if (response.status === 200) {
                ToastNotification.success("Success!", response.data.message);
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
                    vehicle_id: "",
                });
            }
        } catch (error) {
            console.error("Error submitting vehicle request:", error);
        }
    };

    return (
        <form className="py-2 text-sm space-y-4">
            {/* Requester & Department */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Requester</label>
                    <input
                        type="text"
                        name="requester"
                        value={getUserByReferenceNumber(user.reference_number)}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <select
                        name="department"
                        value={request.department || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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

            {/* Title & Designation */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={request.title || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                    <input
                        type="text"
                        name="designation"
                        value={request.designation || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Vehicle Requested & Destination */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Requested</label>
                    <select
                        name="vehicle_id"
                        value={request.vehicle_id || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="">Select Vehicle</option>
                        {vehicleOptions?.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                    <input
                        type="text"
                        name="destination"
                        value={request.destination || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Date of Trip, Departure & Arrival Times */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date of Trip</label>
                    <input
                        type="date"
                        name="date_of_trip"
                        value={request.date_of_trip || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time of Departure</label>
                    <input
                        type="time"
                        name="time_of_departure"
                        value={request.time_of_departure || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time of Arrival</label>
                    <input
                        type="time"
                        name="time_of_arrival"
                        value={request.time_of_arrival || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Number of Passengers */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Number of Passengers</label>
                <input
                    type="number"
                    name="number_of_passengers"
                    value={request.number_of_passengers || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
            </div>

            {/* Purpose */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                <ReactQuill
                    theme="snow"
                    value={request.purpose}
                    onChange={handleQuillChange}
                    className="bg-white rounded-md"
                />
            </div>

            {/* Submit Button */}
            <Button color="blue" type="submit" onClick={submitVehicleRequest}>Submit Request</Button>
        </form>
    );
};

export default VehicleRequestForm;
