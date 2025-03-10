import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Typography } from "@material-tailwind/react";
import { Plus, FloppyDisk, PencilSimpleLine, Prohibit, X } from "@phosphor-icons/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";

const VenueRequestForm = () => {
    const { user } = useContext(AuthContext);
    const { getUserByReferenceNumber } = useContext(UserContext);

    const [request, setRequest] = useState({
        requester: user.reference_number,
        department: "",
        organization: "",
        event_title: "",
        event_dates: "",
        event_start_time: "",
        event_end_time: "",
        event_nature: "",
        venue_id: "",
        participants: "",
        pax_estimation: "",
        purpose: "",
        remarks: "",
        details: [],
    });

    const [editingIndex, setEditingIndex] = useState(null);
    const [editedDetail, setEditedDetail] = useState({
        particulars: "",
        quantity: "",
        description: "",
    });

    const [venueOptions, setVenueOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    const handleChange = (e) => {
        setRequest({ ...request, [e.target.name]: e.target.value });
    };

    const handleQuillChange = (name, value) => {
        setRequest({ ...request, [name]: value });
    };

    const handleEditClick = (index) => {
        setEditingIndex(index);
        setEditedDetail({ ...request.details[index] });
    };

    const handleSaveEdit = (index) => {
        const updatedDetails = [...request.details];
        updatedDetails[index] = editedDetail;
        setRequest({ ...request, details: updatedDetails });
        setEditingIndex(null);
    };

    const handleDetailRemove = (index) => {
        const updatedDetails = [...request.details];
        updatedDetails.splice(index, 1);
        setRequest({ ...request, details: updatedDetails });
    };

    const handleAddDetail = () => {
        setRequest({
            ...request,
            details: [...request.details, { particulars: "", quantity: 0, description: "" }],
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const departmentResponse = await axios.get("/settings/department", { withCredentials: true });
                if (Array.isArray(departmentResponse.data.departments)) {
                    setDepartmentOptions(departmentResponse.data.departments);
                }

                const venueResponse = await axios.get("/settings/venues", { withCredentials: true });
                if (Array.isArray(venueResponse.data.venues)) {
                    setVenueOptions(venueResponse.data.venues);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const submitVenueRequest = async () => {
        try {
            const requestData = { ...request };

            const response = await axios.post("/venue_request", requestData, { withCredentials: true });

            if (response.status === 200) {
                ToastNotification.success("Success!", response.data.message);
                setRequest({
                    requester: user.reference_number,
                    department: "",
                    organization: "",
                    event_title: "",
                    event_dates: "",
                    event_start_time: "",
                    event_end_time: "",
                    event_nature: "",
                    venue_id: "",
                    participants: "",
                    pax_estimation: "",
                    purpose: "",
                    remarks: "",
                    details: [],
                });
            }
        } catch (error) {
            console.error("Error submitting venue request:", error);
        }
    };

    return (
        <form className="py-2 text-sm space-y-4 overflow-y-auto">
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

            {/* Organization & Event Title */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Organization</label>
                <input
                    type="text"
                    name="organization"
                    value={request.organization || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Title</label>
                <input
                    type="text"
                    name="event_title"
                    value={request.event_title || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                />
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Event Date(s)</label>
                    <input
                        type="text"
                        name="event_dates"
                        value={request.event_dates || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                        type="time"
                        name="event_start_time"
                        value={request.event_start_time || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                    <input
                        type="time"
                        name="event_end_time"
                        value={request.event_end_time || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                    />
                </div>
            </div>

            {/* Purpose */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                <ReactQuill
                    theme="snow"
                    value={request.purpose}
                    onChange={(value) => handleQuillChange("purpose", value)}
                    className="bg-white"
                />
            </div>

            {/* Participants & Venue */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Participants</label>
                <input
                    type="text"
                    name="participants"
                    value={request.participants || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
            </div>

            {/* Submit Button */}
            <Button color="blue" type="submit" onClick={submitVenueRequest}>Submit Request</Button>
        </form>
    );
};

export default VenueRequestForm;
