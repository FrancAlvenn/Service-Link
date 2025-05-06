import { CaretRight, X } from "@phosphor-icons/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import AssetContext from "../context/AssetContext";
import { AuthContext } from "../../authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import { formatDate } from "../../../utils/dateFormatter";

const AssetSidebar = ({
  open,
  onClose,
  referenceNumber,
  assets,
  fetchAssets,
  deleteAsset,
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [asset, setAsset] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [newAdditionalDetail, setNewAdditionalDetail] = useState({
    key: "",
    value: "",
  });

  const assetFieldConfig = [
    {
      key: "reference_number",
      label: "Reference Number",
      type: "text",
      readOnly: true,
    },
    { key: "name", label: "Asset Name", type: "text" },
    { key: "asset_type", label: "Asset Type", type: "select" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "location", label: "Location", type: "text" },
    { key: "status", label: "Status", type: "select" },
    { key: "last_maintenance", label: "Last Maintenance", type: "date" },
    { key: "createdAt", label: "Created At", type: "date", readOnly: true },
    { key: "updatedAt", label: "Updated At", type: "date", readOnly: true },
  ];

  const assetTypeOptions = [
    { value: "", label: "Select Asset Type" },
    { value: "Venue", label: "Venue" },
    { value: "Vehicle", label: "Vehicle" },
    { value: "Office Supplies", label: "Office Supplies" },
    { value: "Device", label: "Device" },
    { value: "Others", label: "Others" },
  ];

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "In Use", label: "In Use" },
    { value: "Under Maintenance", label: "Under Maintenance" },
    { value: "Disposed", label: "Disposed" },
    { value: "Lost", label: "Lost" },
  ];

  useEffect(() => {
    if (isOpen && referenceNumber) {
      const foundAsset = assets.find(
        (a) => a.reference_number === referenceNumber
      );
      setAsset(foundAsset);
    }
  }, [assets, referenceNumber, isOpen]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setAsset(null);
    setEditedFields({});
    setEditingField(null);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSidebarClick = (e) => e.stopPropagation();

  const handleFieldChange = (field, value) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    try {
      const isAdditional =
        asset.additional_details &&
        asset.additional_details.find((detail) => detail.key === field);

      const originalValue = isAdditional
        ? asset.additional_details.find((detail) => detail.key === field)
            ?.value || ""
        : asset[field] || "";

      const editedValue = editedFields[field];

      // If value hasn't changed, do nothing
      if (originalValue === editedValue || editedValue === undefined) {
        setEditingField(null);
        setEditedFields((prev) => {
          const newFields = { ...prev };
          delete newFields[field];
          return newFields;
        });
        return;
      }

      const updatedAsset = {
        ...asset,
        requester: user.reference_number,
        additional_details: isAdditional
          ? asset.additional_details.map((detail) =>
              detail.key === field ? { ...detail, value: editedValue } : detail
            )
          : asset.additional_details,
        ...(isAdditional ? {} : { [field]: editedValue }),
      };

      await axios.put(`/assets/${asset.reference_number}`, updatedAsset, {
        withCredentials: true,
      });

      fetchAssets();
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", `Failed to update ${field}.`);
    } finally {
      setEditingField(null);
      setEditedFields((prev) => {
        const newFields = { ...prev };
        delete newFields[field];
        return newFields;
      });
    }
  };

  const handleAddAdditionalDetail = async () => {
    const { key, value } = newAdditionalDetail;

    if (!key || !value) {
      ToastNotification.error("Error", "Please fill in both key and value.");
      return;
    }

    const keyExists = asset.additional_details.some(
      (detail) => detail.key.trim().toLowerCase() === key.trim().toLowerCase()
    );

    if (keyExists) {
      ToastNotification.error(
        "Error",
        "Key already exists. Please use a unique key name."
      );
      return;
    }

    try {
      const updatedAsset = {
        ...asset,
        requester: user.reference_number,
        additional_details: [
          ...asset.additional_details,
          { key: key.trim(), value: value.trim() },
        ],
      };

      await axios.put(`/assets/${asset.reference_number}`, updatedAsset, {
        withCredentials: true,
      });

      setNewAdditionalDetail({ key: "", value: "" });
      fetchAssets();
    } catch (error) {
      console.error("Failed to add additional detail:", error);
      ToastNotification.error("Error", "Failed to add additional detail.");
    }
  };

  const handleRemoveAdditionalDetail = async (keyToRemove) => {
    try {
      const updatedDetails = asset.additional_details.filter(
        (detail) => detail.key !== keyToRemove
      );

      const updatedAsset = {
        ...asset,
        requester: user.reference_number,
        additional_details: updatedDetails,
      };

      await axios.put(`/assets/${asset.reference_number}`, updatedAsset, {
        withCredentials: true,
      });

      fetchAssets();
    } catch (error) {
      console.error("Failed to remove additional detail:", error);
      ToastNotification.error("Error", "Failed to remove detail.");
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleSave(field);
    if (e.key === "Escape") setEditingField(null);
  };

  const renderFieldValue = (field, value) => {
    if (field.type === "date" && value) return formatDate(value);
    if (typeof value === "object" && value !== null) {
      return value.value || JSON.stringify(value);
    }
    return value || "Click to edit";
  };

  const renderEditableField = (field, value) => {
    const currentValue = editedFields[field.key] ?? value;

    if (field.type === "select") {
      const options = field.key === "status" ? statusOptions : assetTypeOptions;
      return (
        <select
          className="text-sm p-2 border border-gray-300 rounded-md w-[60%]"
          value={currentValue}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          onBlur={() => handleSave(field.key)}
          autoFocus
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type === "date" ? "date" : field.type}
        className="text-sm p-2 border border-gray-300 rounded-md w-[60%]"
        value={currentValue}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        onBlur={() => handleSave(field.key)}
        onKeyDown={(e) => handleKeyDown(e, field.key)}
        autoFocus
      />
    );
  };

  return (
    <>
      <div
        className={`bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      ></div>

      <div
        onClick={handleSidebarClick}
        className={`z-50 shadow-lg w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "hidden"
        }`}
      >
        {asset ? (
          <div className="flex flex-col overflow-y-auto h-full">
            <div className="p-1 rounded-md bg-white">
              <CaretRight
                color="black"
                size={20}
                onClick={handleClose}
                className="cursor-pointer"
              />
            </div>

            <h2 className="text-xl font-bold mb-4">
              {editingField === "name" ? (
                <input
                  type="text"
                  className="border w-full border-gray-300 rounded-md p-2 text-xl font-bold"
                  value={editedFields.name ?? asset.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleSave("name")}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setEditingField("name")}
                  className="cursor-pointer"
                >
                  {asset.name || "Click to edit"}
                </p>
              )}
            </h2>

            <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
              {assetFieldConfig.map((field) => {
                if (field.key === "name") return null;
                const value = asset[field.key];

                return (
                  <div
                    key={field.key}
                    className="mb-3 flex justify-between items-center"
                  >
                    <p className="text-sm font-semibold capitalize">
                      {field.label}
                    </p>
                    {field.readOnly ? (
                      <p className="text-sm w-[60%] truncate">
                        {renderFieldValue(field, value)}
                      </p>
                    ) : editingField === field.key ? (
                      renderEditableField(field, value)
                    ) : (
                      <p
                        onClick={() => setEditingField(field.key)}
                        className="text-sm cursor-pointer w-[60%] truncate"
                      >
                        {renderFieldValue(field, value)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {asset.additional_details && (
              <div className="mt-4 flex flex-col p-3 gap-2 border border-blue-gray-200 rounded-md">
                <p className="font-semibold text-base">
                  Additional Information
                </p>
                {asset.additional_details.map((detail) => {
                  const { key, value } = detail;
                  return (
                    <div
                      key={key}
                      className="mb-3 flex flex-col sm:flex-row sm:items-center sm:gap-4"
                    >
                      {/* Key label */}
                      <p className="text-sm font-semibold capitalize mb-1 sm:mb-0 sm:w-1/3">
                        {key.replace(/_/g, " ")}
                      </p>

                      {/* Value display or input */}
                      <div className="flex items-center sm:w-2/3">
                        {editingField === key ? (
                          <input
                            type="text"
                            className="text-sm p-2 border border-gray-300 rounded-md w-full"
                            value={editedFields[key] ?? value}
                            onChange={(e) =>
                              handleFieldChange(key, e.target.value)
                            }
                            onBlur={() => handleSave(key)}
                            onKeyDown={(e) => handleKeyDown(e, key)}
                            autoFocus
                          />
                        ) : (
                          <p
                            onClick={() => setEditingField(key)}
                            className="text-sm cursor-pointer w-full truncate"
                          >
                            {value || "Click to edit"}
                          </p>
                        )}

                        {/* Remove Icon */}
                        <X
                          onClick={() => handleRemoveAdditionalDetail(key)}
                          className="ml-2 text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                          title="Remove"
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="w-full max-w-[1/3]">
                  <p className="font-semibold text-base">Add new detail</p>
                </div>
                <div className="flex gap-2 mt-2 w-full">
                  <input
                    type="text"
                    placeholder="Key"
                    className="border p-2 rounded-md text-sm w-full"
                    value={newAdditionalDetail.key}
                    onChange={(e) =>
                      setNewAdditionalDetail((prev) => ({
                        ...prev,
                        key: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="border p-2 rounded-md text-sm w-full"
                    value={newAdditionalDetail.value}
                    onChange={(e) =>
                      setNewAdditionalDetail((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                  />
                  <Button
                    color="blue"
                    size="sm"
                    onClick={handleAddAdditionalDetail}
                    className="w-full"
                    disabled={
                      !newAdditionalDetail.key ||
                      !newAdditionalDetail.value ||
                      asset.additional_details.some(
                        (detail) =>
                          detail.key.trim().toLowerCase() ===
                          newAdditionalDetail.key.trim().toLowerCase()
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Loading asset details...</p>
        )}
      </div>
    </>
  );
};

export default AssetSidebar;
