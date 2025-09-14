import React, { useContext, useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { AuthContext } from "../../authentication";
import AssetContext from "../context/AssetContext";
import ToastNotification from "../../../utils/ToastNotification";

const defaultDetailsByType = {
  Venue: [{ key: "Capacity", value: "" }],
  Vehicle: [
    { key: "Plate Number", value: "" },
    { key: "Acquisition Value", value: "" },
    { key: "Date of Issuance", value: "" },
    { key: "Warranty Expiry", value: "" },
  ],
  Device: [
    { key: "Model", value: "" },
    { key: "Manufacturer", value: "" },
    { key: "Processor", value: "" },
    { key: "RAM", value: "" },
    { key: "Storage", value: "" },
    { key: "Acquisition Value", value: "" },
    { key: "Date of Issuance", value: "" },
    { key: "Warranty Expiry", value: "" },
  ],
  "Office Supplies": [
    { key: "Brand", value: "" },
    { key: "Unit Count", value: "" },
    { key: "Acquisition Value", value: "" },
    { key: "Date of Issuance", value: "" },
  ],
};


const AssetForm = ({ mode = "add", initialValues, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const { fetchAssets } = useContext(AssetContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [asset, setAsset] = useState(() => ({
    reference_number: user?.reference_number || "",
    item_code: "",
    name: "",
    category: "",
    description: "",
    location: "",
    acquisition_value: "",
    depreciation_period: "",
    assigned_department: "",
    assigned_personnel: "",
    date_of_issuance: "",
    status: "Available",
    last_maintenance: new Date().toISOString().split("T")[0], 
    warranty_expiry: null,
    ...(initialValues || {}),
  }));


  // Also initialize `additionalDetails` from initialValues if present
  const [additionalDetails, setAdditionalDetails] = useState(
    initialValues?.additional_details || []
  );

  const [newDetail, setNewDetail] = useState({ key: "", value: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAsset({ ...asset, [name]: value });

    if (name === "asset_type") {
      const defaults = defaultDetailsByType[value] || [];
      setAdditionalDetails(defaults);
    }
  };

  const resetForm = () => {
    setAsset({
      reference_number: user?.reference_number || "",
    item_code: "",
    name: "",
    category: "",
    description: "",
    location: "",
    acquisition_value: "",
    depreciation_period: "",
    assigned_department: "",
    assigned_personnel: "",
    date_of_issuance: "",
    status: "Available",
      last_maintenance: new Date().toISOString().split("T")[0],
      warranty_expiry: null,
    });
    setAdditionalDetails([]);
    setNewDetail({ key: "", value: "" });
  };

  const handleAddDetail = () => {
    if (!newDetail.key.trim()) return;
    setAdditionalDetails((prevDetails) => [...prevDetails, { ...newDetail }]);
    setNewDetail({ key: "", value: "" });
  };

  const submitAsset = async () => {
    try {
      const endpoint =
        mode === "edit"
          ? `${process.env.REACT_APP_API_URL}/assets/${asset.reference_number}` // Use reference_number as your unique key
          : `${process.env.REACT_APP_API_URL}/assets`;

      const method = mode === "edit" ? "put" : "post";

      const response = await axios[method](
        endpoint,
        { ...asset, additional_details: additionalDetails },
        { withCredentials: true }
      );

      if ([200, 201].includes(response.status)) {
        ToastNotification.success(
          "Success!",
          `Asset ${mode === "edit" ? "updated" : "added"} successfully.`
        );
        fetchAssets();
        resetForm();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }

      setErrorMessage("");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Serial Number already exists. Please try again.");
      } else {
        setErrorMessage("An error occurred while saving the asset.");
      }
    }
  };

  return (
    <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-between">
      <div className="py-4 px-5 mb-5 shadow-sm">
        {/* <Header
          title={"Asset Information"}
          description={"Enter details about the asset below."}
        /> */}
        <Typography variant="h5" className="mb-2">
          Asset Information
        </Typography>
        <Typography variant="small" className="mb-2">
          Enter details about the asset below.
        </Typography>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto">
        {/* Asset Information Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 my-2">
            Asset Information
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Item Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Item Code
              </label>
              <input
                type="text"
                name="item_code"
                value={asset.item_code || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            {/* Asset Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Asset Name
              </label>
              <input
                type="text"
                name="name"
                value={asset.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={asset.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select Category</option>
              <option value="Venue">Venue</option>
              <option value="Furniture">Furniture</option>
              <option value="Computer">Computer</option>
              <option value="Equipment">Equipment</option>
              <option value="Machinery">Machinery</option>
              <option value="Appliance">Appliance</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Tools">Tools</option>
              <option value="Software">Software</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Assignment & Value Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 my-2">
            Assignment & Value
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Acquisition Value
              </label>
              <input
                type="number"
                name="acquisition_value"
                value={asset.acquisition_value || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Depreciation Period (Years)
              </label>
              <input
                type="number"
                name="depreciation_period"
                value={asset.depreciation_period || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assigned Department
              </label>
              <input
                type="text"
                name="assigned_department"
                value={asset.assigned_department || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assigned Personnel
              </label>
              <input
                type="text"
                name="assigned_personnel"
                value={asset.assigned_personnel || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Location & Date Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 my-2">
            Location & Dates
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={asset.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date of Issuance
              </label>
              <input
                type="date"
                name="date_of_issuance"
                value={asset.date_of_issuance || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={asset.description || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Additional Details Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 my-2">
            Additional Details
          </label>
        </div>

        {additionalDetails.length > 0 && (
          <div className="mt-2 space-y-6">
            {additionalDetails.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => {
                    const newDetails = [...additionalDetails];
                    newDetails[index].key = e.target.value;
                    setAdditionalDetails(newDetails);
                  }}
                  placeholder="Field Name"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => {
                    const newDetails = [...additionalDetails];
                    newDetails[index].value = e.target.value;
                    setAdditionalDetails(newDetails);
                  }}
                  placeholder="Field Value"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 my-1">
            Add Custom Field
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Field Name"
              value={newDetail.key}
              onChange={(e) => setNewDetail({ ...newDetail, key: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Field Value"
              value={newDetail.value}
              onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <Button
            onClick={handleAddDetail}
            color="blue"
            fullWidth
            className="mt-2 w-auto"
          >
            Add Detail
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 w-full justify-between mt-4">
          <Button
            onClick={submitAsset}
            color="blue"
            className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full"
          >
            {mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 mt-2 text-sm">{errorMessage}</div>
        )}
      </div>

    </div>
  );
};

export default AssetForm;
