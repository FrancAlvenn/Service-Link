import React, { useContext, useEffect, useState } from "react";
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
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";

const PurchasingRequestForm = ({ setSelectedRequest }) => {
  const { user } = useContext(AuthContext);
  const { allUserInfo, getUserByReferenceNumber, fetchUsers } =
    useContext(UserContext);
  const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
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

  const [errorMessage, setErrorMessage] = useState("");
  const [request, setRequest] = useState({
    requester: user.reference_number,
    title: "",
    date_required: "",
    supply_category: "",
    purpose: "",
    remarks: "",
    details: [],
    approvers: [],
  });
  const [showParticularForm, setShowParticularForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [particularForm, setParticularForm] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [supplyCategories, setSupplyCategories] = useState([
    { id: 1, name: "Office Supplies" },
    { id: 2, name: "Computer Parts / Peripherals" },
    { id: 3, name: "Electrical Supplies" },
    { id: 4, name: "Office Equipment" },
    { id: 5, name: "Tools / Equipment" },
    { id: 6, name: "Other Consumables" },
    { id: 7, name: "Machineries / Parts" },
    { id: 8, name: "Publications" },
    { id: 9, name: "Others" },
  ]);
  const requestType = "Purchasing Request";

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchApprovers();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchUsers();
  }, []);

  // Fetch department options from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentResponse = await axios.get(`${process.env.REACT_APP_API_URL}/settings/department`, {
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

  const handleChange = (e) => {
    if (e.target.name === "date_required") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(e.target.value);
      if (selectedDate < today) {
        setErrorMessage("Invalid Date. Date cannot be in the past.");
        return;
      }
      if (user.access_level === "user") {
        const oneWeekFromToday = new Date(today);
        oneWeekFromToday.setDate(today.getDate() + 7);
        if (selectedDate < oneWeekFromToday) {
          setErrorMessage(
            "Requests should be at least one week prior. For urgent requests, please contact the GSO."
          );
          setRequest({ ...request, [e.target.name]: "" });
          return;
        }
      }
    }
    setErrorMessage("");
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleParticularFormChange = (e) => {
    setParticularForm({ ...particularForm, [e.target.name]: e.target.value });
  };

  const handleAddParticular = () => {
    setShowParticularForm(true);
    setEditingIndex(null);
    setParticularForm({ particulars: "", quantity: "", description: "" });
  };

  const handleSaveParticular = () => {
    const { particulars, quantity, description } = particularForm;
    if (!particulars || !quantity || parseInt(quantity) < 1) {
      ToastNotification.error("Error", "Particulars and a valid quantity are required.");
      return;
    }

    const newDetail = {
      particulars,
      quantity: parseInt(quantity),
      description,
    };

    setRequest((prev) => {
      if (editingIndex !== null) {
        const updatedDetails = [...prev.details];
        updatedDetails[editingIndex] = newDetail;
        return { ...prev, details: updatedDetails };
      }
      return { ...prev, details: [...prev.details, newDetail] };
    });

    setShowParticularForm(false);
    setParticularForm({ particulars: "", quantity: "", description: "" });
    setEditingIndex(null);
  };

  const handleEditClick = (index) => {
    setShowParticularForm(true);
    setEditingIndex(index);
    setParticularForm({ ...request.details[index] });
  };

  const handleDetailRemove = (index) => {
    setRequest((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const handleCancelParticular = () => {
    setShowParticularForm(false);
    setParticularForm({ particulars: "", quantity: "", description: "" });
    setEditingIndex(null);
  };

  const submitPurchasingRequest = async () => {
    try {
      const formattedDate = request.date_required
        ? new Date(request.date_required).toISOString().split("T")[0]
        : null;
      let requestData = {
        ...request,
        date_required: formattedDate,
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
        url: `${process.env.REACT_APP_API_URL}/purchasing_request`,
        data: requestData,
        withCredentials: true,
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchPurchasingRequests();
        setSelectedRequest("");
        setRequest({
          requester: user.reference_number,
          title: "",
          date_required: "",
          supply_category: "",
          purpose: "",
          remarks: "",
          details: [],
          approvers: [],
        });
      }
    } catch (error) {
      console.error("Error submitting purchasing request:", error);
    }
  };

  return (
    <div className="py-2 text-sm space-y-4 overflow-y-auto">
      {/* Requester & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
        {errorMessage && (
          <p className="text-red-500 font-semibold text-xs pt-1">
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
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
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
      </div>

      {/* Particulars Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Particulars
          </Typography>
          <Button
            color="green"
            variant="ghost"
            onClick={handleAddParticular}
            className="flex text-xs items-center gap-1 px-3 py-2 border rounded-md hover:bg-green-600 dark:border-gray-600 normal-case"
          >
            <Plus size={15} />
            <Typography className="text-xs font-semibold">Add Particular</Typography>
          </Button>
        </div>

        {/* Particular Input Form */}
        {showParticularForm && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Particulars / Items Description / Specifications
              </label>
              <input
                type="text"
                name="particulars"
                value={particularForm.particulars}
                onChange={handleParticularFormChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={particularForm.quantity}
                onChange={handleParticularFormChange}
                min="1"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={particularForm.description}
                onChange={handleParticularFormChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div className="flex gap-3 col-span-full ml-auto">
              <Button
                color="green"
                onClick={handleSaveParticular}
                className="flex items-center gap-1 px-2 py-1 normal-case"
              >
                <FloppyDisk size={18} />
                <Typography className="text-xs font-semibold">Save</Typography>
              </Button>
              <Button
                color="red"
                variant="outlined"
                onClick={handleCancelParticular}
                className="flex items-center gap-1 px-2 py-1 border rounded-md hover:text-red-500 dark:border-gray-600 normal-case"
              >
                <Prohibit size={18} />
                <Typography className="text-xs font-semibold">Cancel</Typography>
              </Button>
            </div>
          </div>
        )}

        {/* Particulars Table */}
        <div className="overflow-x-auto pt-3">
          <table className="min-w-full text-left text-sm border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-600">Item</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-600">Quantity</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-600">Description</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {request.details.map((detail, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-300 dark:border-gray-600"
                >
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
      </div>

      <Button
        color="blue"
        onClick={submitPurchasingRequest}
        disabled={
          !request.title ||
          !request.date_required ||
          !request.supply_category ||
          !request.purpose ||
          errorMessage
        }
        className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
      >
        Submit Request
      </Button>
    </div>
  );
};

export default PurchasingRequestForm;