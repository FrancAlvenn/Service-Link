import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Typography } from "@material-tailwind/react";
import {
  Plus,
  FloppyDisk,
  PencilSimpleLine,
  Prohibit,
  X,
} from "@phosphor-icons/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { PurchasingRequestsContext } from "../../../context/PurchasingRequestsContext";

const PurchasingRequestForm = ({ setSelectedRequest }) => {
  const { user } = useContext(AuthContext);

  const { allUserInfo, getUserByReferenceNumber } = useContext(UserContext);

  const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);

  const [errorMessage, setErrorMessage] = useState("");

  const [request, setRequest] = useState({
    requester: user.reference_number,
    department: user.department || "",
    title: "",
    date_required: "",
    supply_category: "",
    purpose: "",
    remarks: "",
    details: [],
    designation: user.designation || "",
    approvers: [],
  });

  const requestType = "Purchasing Request";

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [supplyCategories, setSupplyCategories] = useState([
    { id: 1, name: "Office Supplies" },
    { id: 2, name: "Cleaning Supplies" },
    { id: 3, name: "Classroom Supplies" },
    { id: 4, name: "Furniture and Fixtures" },
    { id: 5, name: "IT and Computer Supplies" },
    { id: 6, name: "Electrical and Maintenance Supply" },
    { id: 7, name: "Miscellaneous" },
  ]);

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
      details: [
        ...request.details,
        { particulars: "", quantity: 0, description: "" },
      ],
    });
  };

  // Fetch department and supply categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentResponse = await axios.get("/settings/department", {
          withCredentials: true,
        });
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
      const formattedDate = request.date_required
        ? new Date(request.date_required).toISOString().split("T")[0]
        : null;
      const requestData = {
        ...request,
        date_required: formattedDate,
        authorized_access: [
          ...(request.authorized_access || []),
          user.reference_number,
        ],
      };

      const response = await axios({
        method: "POST",
        url: "/purchasing_request",
        data: requestData,
        withCredentials: true,
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchPurchasingRequests();
        setSelectedRequest("");
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date Required
        </label>
        <input
          type="date"
          name="date_required"
          value={request.date_required || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
          required
        />
        {errorMessage && (
          <p className="text-red-500 font-semibold text-xs pl-2 pt-1">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Supply Category */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Supply Category
        </label>
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose
        </label>
        <textarea
          name="purpose"
          value={request.purpose}
          onChange={(e) => handleQuillChange("purpose", e.target.value)}
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

      {/* Remarks */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 pt-1">
          Remarks
        </label>
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
