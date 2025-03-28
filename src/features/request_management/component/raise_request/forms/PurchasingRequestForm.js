import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Typography } from "@material-tailwind/react";
import { Plus, FloppyDisk, PencilSimpleLine, Prohibit, X } from "@phosphor-icons/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { PurchasingRequestsContext } from "../../../context/PurchasingRequestsContext";

const PurchasingRequestForm = ({setSelectedRequest}) => {
    const { user } = useContext(AuthContext);

    const { getUserByReferenceNumber } = useContext(UserContext);

    const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);

    const [errorMessage, setErrorMessage] = useState("");

    const [request, setRequest] = useState({
        requester: user.reference_number,
        department: "",
        title: "",
        date_required: "",
        supply_category: "",
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
    const [supplyCategories, setSupplyCategories] = useState(
        [
            {id: 1, name: "Office Supplies"},
            {id: 2, name: "Cleaning Supplies"},
            {id: 3, name: "Classroom Supplies"},
            {id: 4, name: "Furniture and Fixtures"},
            {id: 5, name: "IT and Computer Supplies"},
            {id: 6, name: "Electrical and Maintenance Supply"},
            {id: 7, name: "Miscellaneous"}
        ]
    );

    const handleChange = (e) => {

        // Validate Date: Ensure date_required is not in the past
        if (e.target.name === "date_required") {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day for accuracy
            const selectedDate = new Date(e.target.value);

            if (selectedDate < today) {
                setErrorMessage("Invalid Date");
                // ToastNotification.error("Invalid Date", "Date cannot be in the past.");
                return; // Exit without updating state
            }
        }

        setErrorMessage("");
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

    // Fetch department and supply categories from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const departmentResponse = await axios.get("/settings/department", { withCredentials: true });
                if (Array.isArray(departmentResponse.data.departments)) {
                    setDepartmentOptions(departmentResponse.data.departments);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const submitPurchasingRequest = async () => {
        try {
            const formattedDate = request.date_required ? new Date(request.date_required).toISOString().split("T")[0] : null;
            const requestData = { ...request, date_required: formattedDate };

            const response = await axios.post("/purchasing_request", requestData, { withCredentials: true });

            if (response.status === 201) {
                ToastNotification.success("Success!", response.data.message);
                fetchPurchasingRequests();
                setSelectedRequest("")
                setRequest({
                    requester: user.reference_number,
                    department: "",
                    title: "",
                    date_required: "",
                    supply_category: "",
                    purpose: "",
                    remarks: "",
                    details: [],
                });
            }
        } catch (error) {
            console.error("Error submitting purchasing request:", error);
        }
    };

    return (
        <div className="py-2 text-sm space-y-4 overflow-y-auto">
            {/* Requester & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Requester</label>
                    <input
                        type="text"
                        name="requester"
                        value={getUserByReferenceNumber(user.reference_number)}
                        readOnly
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                    />
                </div>
    
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <select
                        name="department"
                        value={request.department || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
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
    
            {/* Title & Date Required */}
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                    type="text"
                    name="title"
                    value={request.title || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                    required
                />
            </div>
    
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Required</label>
                <input
                    type="date"
                    name="date_required"
                    value={request.date_required || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                    required
                />
                {errorMessage && <p className="text-red-500 font-semibold text-xs pl-2 pt-1">{errorMessage}</p>}
            </div>
    
            {/* Supply Category */}
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Supply Category</label>
                <select
                    name="supply_category"
                    value={request.supply_category || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                    required
                >
                    <option value="">Select Category</option>
                    {supplyCategories?.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
    
            {/* Purpose */}
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
                <textarea
                    name="purpose"
                    value={request.purpose}
                    onChange={(e) => handleQuillChange("purpose", e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                    required
                />
            </div>
    
            {/* Particulars Section */}
            <div className="flex flex-col gap-3">
                <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">Particulars</Typography>
                {request.details.map((detail, index) => (
                    <div key={index} className="flex flex-col gap-1 p-3 border rounded-md dark:border-gray-600">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {editingIndex === index ? (
                                <>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                                        value={editedParticular.particulars}
                                        onChange={(e) => setEditedParticular({ ...editedParticular, particulars: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        className="w-20 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
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
                        </div>
    
                        {editingIndex === index ? (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={editedParticular.description}
                                    onChange={(e) => setEditedParticular({ ...editedParticular, description: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 mt-1"
                                    required
                                />
                            </div>
                        ) : (
                            <Typography className="text-xs">{detail.description}</Typography>
                        )}
                    </div>
                ))}
    
                {/* Add Particular Button */}
                <button className="flex items-center gap-1 p-3 border rounded-md hover:text-green-500 dark:border-gray-600 dark:hover:text-green-400" onClick={handleAddParticular}>
                    <Plus size={18} />
                    <Typography className="text-xs">Add Particular</Typography>
                </button>
            </div>
    
            {/* Remarks */}
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 pt-1">Remarks</label>
                <textarea
                    name="remarks"
                    value={request.remarks}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                    required
                />
            </div>
    
            <Button 
                color="blue"
                onClick={submitPurchasingRequest}
                disabled={
                    !request.department ||
                    !request.title ||
                    !request.date_required ||
                    !request.supply_category ||
                    !request.purpose
                }
                className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
            >
                Submit Request
            </Button>
        </div>
    );
};

export default PurchasingRequestForm;
