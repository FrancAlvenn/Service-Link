import { CaretRight } from "@phosphor-icons/react";
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
    { key: "asset_type", label: "Asset Type", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "location", label: "Location", type: "text" },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "purchase_cost", label: "Purchase Cost", type: "number" },
    { key: "status", label: "Status", type: "text" },
    { key: "last_maintenance", label: "Last Maintenance", type: "date" },
    { key: "warranty_expiry", label: "Warranty Expiry", type: "date" },
    { key: "createdAt", label: "Created At", type: "date", readOnly: true },
    { key: "updatedAt", label: "Updated At", type: "date", readOnly: true },
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

      //If no changes are made to the value
      if (!editedFields[field]) return;

      // Check if the value has changed before updating
      const originalValue = isAdditional
        ? asset.additional_details.find((detail) => detail.key === field)?.value
        : asset[field];

      const editedValue = editedFields[field];

      // Only update if the value has changed
      if (originalValue !== editedValue) {
        const updatedAsset = {
          ...asset,
          requester: user.reference_number,
          additional_details: isAdditional
            ? asset.additional_details.map((detail) =>
                detail.key === field
                  ? { ...detail, value: editedFields[field] }
                  : detail
              )
            : {
                ...asset,
                [field]: editedFields[field],
              },
        };

        // Update the asset with the new details
        await axios.put(`/assets/${asset.reference_number}`, updatedAsset, {
          withCredentials: true,
        });

        // Fetch assets again to reflect the changes
        fetchAssets();
      }
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
    if (!newAdditionalDetail.key || !newAdditionalDetail.value) {
      ToastNotification.error("Error", "Please fill in both key and value.");
      return;
    }

    try {
      const updatedAsset = {
        ...asset,
        requester: user.reference_number,
        additional_details: [
          ...asset.additional_details,
          { key: newAdditionalDetail.key, value: newAdditionalDetail.value },
        ],
      };

      await axios.put(`/assets/${asset.reference_number}`, updatedAsset, {
        withCredentials: true,
      });

      // Clear the input fields
      setNewAdditionalDetail({ key: "", value: "" });

      // Fetch assets again to reflect the changes
      fetchAssets();
    } catch (error) {
      console.error("Failed to add additional detail:", error);
      ToastNotification.error("Error", "Failed to add additional detail.");
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleSave(field);
    if (e.key === "Escape") setEditingField(null);
  };

  const renderFieldValue = (field, value) => {
    if (field.type === "date" && value) return formatDate(value);
    if (!value && !field.readOnly)
      return <span className="text-gray-500">Click to edit</span>;
    if (typeof value === "object" && value !== null) {
      return value.value || JSON.stringify(value);
    }
    return value || "N/A";
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

            {/* Main Fields */}
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
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        className="text-sm p-2 border border-gray-300 rounded-md w-[60%]"
                        value={editedFields[field.key] ?? value}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.value)
                        }
                        onBlur={() => handleSave(field.key)}
                        onKeyDown={(e) => handleKeyDown(e, field.key)}
                        autoFocus
                      />
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

            {/* Additional Info Section */}
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
                      className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                    >
                      <p className="text-sm font-semibold capitalize mb-1 sm:mb-0 sm:w-1/3">
                        {key.replace(/_/g, " ")}
                      </p>

                      {editingField === key ? (
                        <input
                          type="text"
                          className="text-sm p-2 border border-gray-300 rounded-md sm:w-2/3"
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
                          className={`text-sm cursor-pointer sm:w-2/3 ${
                            !value ? "text-gray-500" : ""
                          }`}
                        >
                          {value || "Click to edit"}
                        </p>
                      )}
                    </div>
                  );
                })}
                <div className="mt-2 flex gap-2">
                  <input
                    className="text-sm p-2 border border-gray-300 rounded-md"
                    value={newAdditionalDetail.key}
                    onChange={(e) =>
                      setNewAdditionalDetail({
                        ...newAdditionalDetail,
                        key: e.target.value,
                      })
                    }
                    placeholder="Detail Key"
                  />
                  <input
                    className="text-sm p-2 border border-gray-300 rounded-md"
                    value={newAdditionalDetail.value}
                    onChange={(e) =>
                      setNewAdditionalDetail({
                        ...newAdditionalDetail,
                        value: e.target.value,
                      })
                    }
                    placeholder="Detail Value"
                  />
                  <Button
                    onClick={handleAddAdditionalDetail}
                    size="sm"
                    className="w-1/4"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>Loading asset...</div>
        )}
      </div>
    </>
  );
};

export default AssetSidebar;
