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
    { key: "Purchase Cost", value: "" },
    { key: "Purchase Date", value: "" },
    { key: "Warranty Expiry", value: "" },
  ],
  Device: [
    { key: "Model", value: "" },
    { key: "Manufacturer", value: "" },
    { key: "Processor", value: "" },
    { key: "RAM", value: "" },
    { key: "Storage", value: "" },
    { key: "Purchase Cost", value: "" },
    { key: "Purchase Date", value: "" },
    { key: "Warranty Expiry", value: "" },
  ],
  "Office Supplies": [
    { key: "Brand", value: "" },
    { key: "Unit Count", value: "" },
    { key: "Purchase Cost", value: "" },
    { key: "Purchase Date", value: "" },
  ],
};

const AssetForm = () => {
  const { user } = useContext(AuthContext);
  const { fetchAssets } = useContext(AssetContext);

  const [errorMessage, setErrorMessage] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState([]);
  const [newDetail, setNewDetail] = useState({ key: "", value: "" });

  const [asset, setAsset] = useState({
    reference_number: user?.reference_number || "",
    name: "",
    asset_type: "",
    description: "",
    location: "",
    purchase_date: "",
    purchase_cost: "",
    status: "Available",
    last_maintenance: new Date().toISOString().split("T")[0],
    warranty_expiry: null,
  });

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
      name: "",
      asset_type: "",
      description: "",
      location: "",
      purchase_date: "",
      purchase_cost: "",
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
      const response = await axios.post(
        "/assets",
        { ...asset, additional_details: additionalDetails },
        { withCredentials: true }
      );

      if (response.status === 201) {
        ToastNotification.success("Success!", "Asset added successfully.");
        fetchAssets();
        resetForm();
      }

      if (response.status === 401) {
        setErrorMessage("Serial Number already exists. Please try again.");
        resetForm();
        return;
      }

      setErrorMessage("");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Serial Number already exists. Please try again.");
      }
    }
  };

  return (
    <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-between">
      <div className="py-4 px-5 mb-5 shadow-sm">
        <Typography color="black" className="text-lg font-bold">
          Asset Information
        </Typography>
        <Typography color="black" className="mt-1 font-normal text-sm">
          Enter details about the asset below.
        </Typography>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto">
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

        {/* Asset Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Asset Type
          </label>
          <select
            name="asset_type"
            value={asset.asset_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          >
            <option value="">Select Asset Type</option>
            <option value="Venue">Venue</option>
            <option value="Vehicle">Vehicle</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Device">Device</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Asset Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Asset Status
          </label>
          <select
            name="status"
            value={asset.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          >
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Disposed">Disposed</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Location, Description, Cost */}
        {[
          { name: "location", label: "Location" },
          { name: "description", label: "Description", type: "textarea" },
        ].map(({ name, label, type = "text" }) => (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {label}
            </label>
            {type === "textarea" ? (
              <textarea
                name={name}
                value={asset[name] || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            ) : (
              <input
                type={type}
                name={name}
                value={asset[name] || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            )}
          </div>
        ))}

        {/* Additional Details Section */}
        <div>
          <label className="block text-xs font-medium text-gray-700 my-1">
            Additional Details
          </label>
        </div>

        {additionalDetails.length > 0 && (
          <div className="mt-2 space-y-6">
            {additionalDetails.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 ">
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
              onChange={(e) =>
                setNewDetail({ ...newDetail, key: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Field Value"
              value={newDetail.value}
              onChange={(e) =>
                setNewDetail({ ...newDetail, value: e.target.value })
              }
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
            Save
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
