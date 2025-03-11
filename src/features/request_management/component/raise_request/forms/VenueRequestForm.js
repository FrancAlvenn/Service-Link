import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Typography } from "@material-tailwind/react";
import { Plus, FloppyDisk, PencilSimpleLine, Prohibit, X } from "@phosphor-icons/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { VenueRequestsContext } from "../../../context/VenueRequestsContext";

const VenueRequestForm = () => {
    const { user } = useContext(AuthContext);

    const { getUserByReferenceNumber } = useContext(UserContext);

    const { fetchVenueRequests } = useContext(VenueRequestsContext)

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
    const [editedParticular, setEditedParticular] = useState({
        particulars: "",
        quantity: "",
        description: "",
    });

    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [venueOptions, setVenueOptions] = useState(
        [
           { venue_id: 1, name: "Elida Complex"},
           { venue_id: 2, name: "Audio Visual Room"},
           { venue_id: 3, name: "Conference Room"},
           { venue_id: 4, name: "Meeting Room"},
           { venue_id: 5, name: "Inspire Lab"},
        ]
    );

    const handleChange = (e) => {
        setRequest({ ...request, [e.target.name]: e.target.value });
    };

    const handleQuillChange = (name, value) => {
        setRequest({ ...request, [name]: value });
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

    const handleAddParticular = () => {
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

                //Add here the fetch for Venue Later
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

            if (response.status === 201) {
                ToastNotification.success("Success!", response.data.message);
                fetchVenueRequests();
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
        <div className="py-2 text-sm space-y-4 overflow-y-auto">
            {/* Requester & Department */}
            <div className="grid grid-cols-3 gap-4">
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

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Venue</label>
                    <select
                        name="venue_id"
                        value={request.venue_id || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                    >
                        <option value="">Select Venue</option>
                        {venueOptions?.map((option) => (
                            <option key={option.venue_id} value={option.venue_id}>
                                {option.name}
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Event Date</label>
                    <input
                        type="date"
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

            {/* Participants & Venue */}
            <div className="grid grid-cols-2 gap-4">
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

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pax Estimation</label>
                    <input
                        type="number"
                        name="pax_estimation"
                        value={request.pax_estimation || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Purpose */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                <textarea
                    name="purpose"
                    value={request.purpose}
                    onChange={(e) => handleQuillChange("purpose", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                    required
                />
            </div>

            {/* Particulars Section */}
            <div className="flex flex-col gap-3">
                <Typography className="text-xs font-semibold text-gray-600">Particulars</Typography>
                {request.details.map((detail, index) => (
                    <div key={index} className="flex flex-col gap-1 p-3 border rounded-md">
                        <div className="flex items-center gap-4">
                            {editingIndex === index ? (
                                <>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        value={editedParticular.particulars}
                                        onChange={(e) => setEditedParticular({ ...editedParticular, particulars: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        value={editedParticular.quantity}
                                        onChange={(e) => setEditedParticular({ ...editedParticular, quantity: e.target.value })}
                                    />
                                </>
                            ) : (
                                <>
                                    <Typography className="font-semibold">{detail.particulars}</Typography>
                                    <Typography className="font-semibold">x{detail.quantity}</Typography>
                                </>
                            )}

                            <span className="flex gap-3 ml-auto">
                                {editingIndex === index ? (
                                    <>
                                        <button className="hover:text-green-500" onClick={() => handleSaveEdit(index)}>
                                            <FloppyDisk size={18} />
                                        </button>
                                        <button className="hover:text-red-500" onClick={() => setEditingIndex(null)}>
                                            <Prohibit size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <button className="hover:text-blue-500" onClick={() => handleEditClick(index)}>
                                        <PencilSimpleLine size={18} />
                                    </button>
                                )}
                                <X className="cursor-pointer hover:text-red-500" onClick={() => handleDetailRemove(index)} />
                            </span>
                        </div>

                        {editingIndex === index ? (
                            <ReactQuill
                                theme="snow"
                                value={editedParticular.description}
                                onChange={(value) => setEditedParticular({ ...editedParticular, description: value })}
                                className="mt-1 bg-white"
                            />
                        ) : (
                            <Typography className="text-xs">{detail.description}</Typography>
                        )}
                    </div>
                ))}

                {/* Add Particular Button */}
                <button className="flex items-center gap-1 p-3 border rounded-md hover:text-green-500" onClick={handleAddParticular}>
                    <Plus size={18} />
                    <Typography className="text-xs">Add Particular</Typography>
                </button>
            </div>

            {/* Submit Button */}
            <Button color="blue" type="submit" onClick={submitVenueRequest}>Submit Request</Button>
        </div>
    );
};

export default VenueRequestForm;
