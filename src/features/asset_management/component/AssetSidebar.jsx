import { UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import AssetContext from "../context/AssetContext";
import { AuthContext } from "../../authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import { formatDate } from "../../../utils/dateFormatter";

const AssetSidebar = ({ open, onClose, referenceNumber, assets, fetchAssets, deleteAsset }) => {
  const [isOpen, setIsOpen] = useState(open);
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [asset, setAsset] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [editingField, setEditingField] = useState(null);

  const assetFieldConfig = [
    { key: "reference_number", label: "Reference Number", type: "text", readOnly: true },
    { key: "name", label: "Asset Name", type: "text" },
    { key: "asset_type", label: "Asset Type", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "location", label: "Location", type: "text" },
    { key: "capacity", label: "Capacity", type: "number" },
    { key: "manufacturer", label: "Manufacturer", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "serial_number", label: "Serial Number", type: "text" },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "purchase_cost", label: "Purchase Cost", type: "number" },
    { key: "status", label: "Status", type: "text" },
    { key: "last_maintenance", label: "Last Maintenance", type: "date" },
    { key: "warranty_expiry", label: "Warranty Expiry", type: "date" },
    { key: "type_specific_1", label: "Type Specific 1", type: "text" },
    { key: "type_specific_2", label: "Type Specific 2", type: "text" },
    { key: "type_specific_3", label: "Type Specific 3", type: "text" },
    { key: "createdAt", label: "Created At", type: "date", readOnly: true },
    { key: "updatedAt", label: "Updated At", type: "date", readOnly: true },
  ];

  useEffect(() => {
    if (isOpen && referenceNumber) {
      const foundAsset = assets.find((asset) => asset.reference_number === referenceNumber);
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
    // if (!asset || !editedFields[field]) return;
    try {
      await axios.put(
        `/assets/${asset.reference_number}`,
        {
          ...asset,
          [field]: editedFields[field],
          requester: user.reference_number,
        },
        { withCredentials: true }
      );
      fetchAssets();
      // ToastNotification.success("Success", `${field} updated successfully.`);
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

  const handleDelete = async () => {
    try {
      await axios.delete(`/assets/${asset.reference_number}`, { withCredentials: true });
      fetchAssets();

      ToastNotification.success("Success", "Asset deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      ToastNotification.error("Error", `Failed to delete asset.`);
    } finally {
      handleClose();
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleSave(field);
    if (e.key === "Escape") setEditingField(null);
  };

  const renderFieldValue = (field, value) => {
    if (field.type === "date" && value) return formatDate(value);
    if (!value && !field.readOnly) return <span className="text-gray-500">Click to edit</span>;
    return value || "N/A";
  };

  return (
    <>
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      ></div>

      {/* Sidebar Container */}
      <div
        onClick={handleSidebarClick}
        className={`fixed top-0 right-0 z-50 w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {asset ? (
          <div className="flex flex-col overflow-y-auto h-full">
            {/* Asset Name (Editable) */}
            <h2 className="text-xl font-bold mb-4">
              {editingField === "name" ? (
                <input
                  type="text"
                  className="border w-full border-gray-300 rounded-md p-2 text-xl font-bold" // Keep font size and weight
                  value={editedFields.name ?? asset.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleSave("name")}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                  autoFocus
                />
              ) : (
                <p onClick={() => setEditingField("name")} className="cursor-pointer">
                  {asset.name || "Click to edit"}
                </p>
              )}
            </h2>


            {/* Asset Details */}
            <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
              {assetFieldConfig.map((field) => {
                if (field.key === "name") return null;
                const value = asset[field.key];

                return (
                  <div key={field.key} className="mb-3 flex justify-between items-center">
                    <p className="text-sm font-semibold capitalize">{field.label}</p>

                    {field.readOnly ? (
                      <p className="text-sm w-[60%] truncate">{renderFieldValue(field, value)}</p>
                    ) : editingField === field.key ? (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        className="text-sm p-2 border border-gray-300 rounded-md w-[60%]"
                        value={editedFields[field.key] ?? value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
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
              <Button color="red" onClick={() => deleteAsset(asset.reference_number)} className="w-full min-h-[40px] max-w-[160px] mt-3">Delete Asset</Button>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">No asset found.</div>
        )}


      </div>
    </>
  );
};

export default AssetSidebar;
