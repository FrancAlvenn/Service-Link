import React, { useContext, useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { AuthContext } from "../../authentication";
import AssetContext from "../context/AssetContext";
import ToastNotification from "../../../utils/ToastNotification";

const AssetForm = () => {
  const { user } = useContext(AuthContext);
  const { fetchAssets } = useContext(AssetContext);

  const [errorMessage, setErrorMessage] = useState("");

  const initialAssetState = {
    reference_number: user?.reference_number || "",
    name: "",
    asset_type: "",
    description: "",
    location: "",
    capacity: "0",
    manufacturer: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    purchase_cost: "",
    status: "Available",
    last_maintenance: new Date().toISOString().split("T")[0],
    warranty_expiry: null,
    type_specific_1: "",
    type_specific_2: "",
    type_specific_3: "",
  };

  const [asset, setAsset] = useState(initialAssetState);

  // Handle input changes
  const handleChange = (e) => {
    setAsset({ ...asset, [e.target.name]: e.target.value });
  };

  // Reset the form
  const resetForm = () => {
    setAsset(initialAssetState);
  };

  const submitAsset = async () => {
    try {
      // Ensure purchase_date is null if empty
      const assetData = {
        ...asset,
        purchase_date: asset.purchase_date || null,
      };

      const response = await axios.post("/assets", assetData, { withCredentials: true });

      // Success case (201: Created)
      if (response.status === 201) {
        resetForm();
        ToastNotification.success("Success!", "Asset added successfully.");
        fetchAssets();
      }

      // Check for duplicate serial number (400: Bad Request)
      if (response.status === 401) {
        setErrorMessage("Serial Number already exists. Please try again.");
        resetForm();
        return; // Stop further execution
      }


      setErrorMessage("");

    } catch (error) {
      // Handle server errors
      if (error.response && error.response.status === 401) {
        setErrorMessage("Serial Number already exists. Please try again.");
      }
    }
  };


  return (
    <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-between">
      {/* Header */}
      <div className="py-4 px-5 mb-5 shadow-sm">
        <Typography color="black" className="text-lg font-bold">
          Asset Information
        </Typography>
        <Typography color="black" className="mt-1 font-normal text-sm">
          Enter details about the asset below.
        </Typography>
      </div>

      {/* Form Body */}
      <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto">
        {/* Asset Name & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={asset.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <input
              type="text"
              name="asset_type"
              value={asset.asset_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={asset.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={asset.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Manufacturer & Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              name="manufacturer"
              value={asset.manufacturer}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={asset.model}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Capacity
          </label>
          <input
            type="number"
            name="capacity"
            value={asset.capacity}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="0"
          />
        </div>

        {/* Serial Number */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Serial Number
          </label>
          <input
            type="text"
            name="serial_number"
            value={asset.serial_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Purchase Date & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={asset.purchase_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Purchase Cost
            </label>
            <input
              type="number"
              name="purchase_cost"
              value={asset.purchase_cost}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={asset.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {["Available"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type Specific 1
          </label>
          <input
            type="text"
            name="type_specific_1"
            value={asset.type_specific_1}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type Specific 2
          </label>
          <input
            type="text"
            name="type_specific_2"
            value={asset.type_specific_2}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type Specific 3
          </label>
          <input
            type="text"
            name="type_specific_3"
            value={asset.type_specific_3}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Warranty Expiration
          </label>
          <input
            type="date"
            name="warranty_expiry"
            value={asset.warranty_expiry}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>



        {/* Error Message */}
        {errorMessage  && <p className="text-red-500 text-xs">{errorMessage}</p>}

        {/* Submit Button */}
        <Button
          color="blue"
          className="w-full min-h-[40px] max-w-[160px] mt-3"
          onClick={()=>submitAsset()}
          disabled={!asset.name || !asset.asset_type}
        >
          Submit Asset
        </Button>
      </div>
    </div>
  );
};

export default AssetForm;
