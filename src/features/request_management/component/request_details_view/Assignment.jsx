import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Button,
  Input,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import EmployeeContext from "../../../employee_management/context/EmployeeContext";
import AssetContext from "../../../asset_management/context/AssetContext";
import { AuthContext } from "../../../authentication";
import AssetAssignmentLogContext from "../../../asset_management/context/AssetAssignmentLogContext";
import ToastNotification from "../../../../utils/ToastNotification";
import { UserCircle, CheckCircle } from "@phosphor-icons/react";
import { HardDrive } from "react-feather";
import { useRequestActivity } from "../../../../context/RequestActivityContext";

/*
  Dual-assignment support:
  - Auto-assignment is created during request creation (JobRequestForm) using matching logic
  - Manual assignment is performed here by users
  - This component distinguishes both types for UI and validations
*/

const Assignment = ({
  selectedRequest,
  setSelectedRequest,
  requestType,
  fetchRequests,
}) => {
  const { employees, fetchEmployees } = useContext(EmployeeContext);
  const { assets, fetchAssets } = useContext(AssetContext);
  const { user } = useContext(AuthContext);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [openQuantityModal, setOpenQuantityModal] = useState(false);
  const [assetToAssign, setAssetToAssign] = useState(null);
  const [quantityInput, setQuantityInput] = useState(1);
  const [assignmentTypes, setAssignmentTypes] = useState({}); // { ref: 'auto'|'manual' }
  const [autoActivityLogged, setAutoActivityLogged] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);

  const {
    assetAssignmentLogs,
    fetchAssetAssignmentLogs,
    createAssetAssignment,
    updateAssetAssignmentLog,
  } = useContext(AssetAssignmentLogContext);

  const { addActivity } = useRequestActivity();
  const isAdmin = user?.access_level === "admin";

  const createAssetLog = async () => {
    const existingLog = assetAssignmentLogs.find(
      (log) =>
        log.asset_id === assetToAssign.reference_number &&
        log.assigned_to === selectedRequest.reference_number &&
        !log.return_date
    );

    const logData = {
      asset_id: assetToAssign.reference_number,
      asset_name: assetToAssign.name,
      assigned_to: selectedRequest.reference_number,
      assigned_by: user.reference_number,
      assignment_date: new Date(),
    };

    if (existingLog) {
      // Update assignment date (optional)
      await updateAssetAssignmentLog(existingLog.log_id, logData);
    } else {
      await createAssetAssignment(logData);
    }
  };

  const updateAssetLog = async () => {
    const assetRef = selectedRequest.assigned_assets[0]?.reference_number;
    const log = assetAssignmentLogs.find(
      (log) =>
        log.asset_id === assetRef &&
        log.assigned_to === selectedRequest.reference_number &&
        !log.return_date
    );

    if (!log) return console.warn("No active log found to update.");

    await updateAssetAssignmentLog(log.log_id, {
      return_date: new Date(),
    });
  };

  const getRequestActivity = async () => {
    await axios.get(`${process.env.REACT_APP_API_URL}/request_activity/${selectedRequest.reference_number}`, {
      withCredentials: true,
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchAssets();
    fetchAssetAssignmentLogs();
  }, []);

  useEffect(() => {
    const assignedEntries = Array.isArray(selectedRequest.assigned_to)
      ? selectedRequest.assigned_to
      : [];
    const assignedRefs = assignedEntries
      .map((e) => (typeof e === "string" ? e : e?.reference_number))
      .filter(Boolean);

    if (assignedRefs.length > 0) {
      const selected = employees.filter((emp) => assignedRefs.includes(emp.reference_number));
      setSelectedEmployees(selected);
    } else {
      setSelectedEmployees([]);
    }

    const types = {};
    assignedEntries.forEach((e) => {
      if (typeof e === "string") {
        types[e] = "manual";
      } else if (e && e.reference_number) {
        const t = e.type_of_assignment === "auto" ? "auto" : e.type_of_assignment === "manual" ? "manual" : "manual";
        types[e.reference_number] = t;
      }
    });
    setAssignmentTypes(types);

    if (Array.isArray(selectedRequest.assigned_assets)) {
      const selected = assets.filter((asset) =>
        selectedRequest.assigned_assets?.some((a) => a.reference_number === asset.reference_number)
      );
      setSelectedAssets(selected);
    } else {
      setSelectedAssets([]);
    }
  }, [selectedRequest?.assigned_to, selectedRequest?.assigned_assets, employees, assets]);

  // Track first-time auto-assignment detection to prevent re-triggering the activity log
  const initialAutoAssignment = useRef(false);

  useEffect(() => {
    // Execute only once when "auto" appears in assignmentTypes and activity hasn't been logged
    const hasAuto = Object.values(assignmentTypes).includes("auto");
    if (hasAuto && !initialAutoAssignment.current && !autoActivityLogged) {
      handleSaveActivity("Auto-assigned employee detected from request creation.");
      setAutoActivityLogged(true);
      initialAutoAssignment.current = true;
    }
    // No cleanup required: ref guards prevent re-triggering within component lifecycle
  }, [assignmentTypes, autoActivityLogged]);

  const handleSaveActivity = async (message) => {
    const newActivity = {
      reference_number: selectedRequest.reference_number,
      type: "comment",
      visibility: "external",
      action: "Update Assignment",
      details: message,
      performed_by: user.reference_number,
    };

    try {
      await addActivity(newActivity);
      getRequestActivity();
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleOverrideActivity = async ({ removed, added }) => {
    const details = `Override assignment: removed = ${removed || ""}`;
    const entry = {
      reference_number: selectedRequest.reference_number,
      type: "assignment_override",
      visibility: "internal",
      action: "Override Assignment",
      details,
      performed_by: user.reference_number,
    };
    try {
      await addActivity(entry);
      getRequestActivity();
    } catch (error) {
      console.error("Error saving override activity:", error);
    }
  };

  const setRequestStatusToInProgress = async () => {
    if (selectedRequest.status === "In Progress") return;
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/${requestType}/${selectedRequest.reference_number}/status`,
        {
          requester: user.reference_number,
          status: "In Progress",
          action: "Auto-updated on assignment",
        },
        { withCredentials: true }
      );

      setSelectedRequest((prev) => ({
        ...prev,
        status: "In Progress",
      }));

      await axios.post(
        `${process.env.REACT_APP_API_URL}/request_activity`,
        {
          reference_number: selectedRequest.reference_number,
          visibility: "external",
          type: "status_change",
          action: `Status updated to <i>In Progress</i>`,
          details: "Auto-updated on assignment",
          performed_by: user.reference_number,
        },
        { withCredentials: true }
      );

      getRequestActivity();
      fetchRequests();
    } catch (error) {
      console.error("Failed to auto-update status:", error);
    }
  };

  const toggleEmployee = async (referenceNumber) => {
    const currentEntries = Array.isArray(selectedRequest.assigned_to) ? selectedRequest.assigned_to : [];
    const currentRefs = currentEntries.map((e) => (typeof e === "string" ? e : e?.reference_number)).filter(Boolean);
    const isSelected = currentRefs.includes(referenceNumber);

    if (isSelected && assignmentTypes[referenceNumber] === "auto") {
      if (!(overrideMode && isAdmin)) {
        ToastNotification.error("Validation", "Auto-assigned employee cannot be removed here.");
        return;
      }
    }

    const updatedEntries = isSelected
      ? currentEntries.filter((e) => (typeof e === "string" ? e !== referenceNumber : e?.reference_number !== referenceNumber))
      : [...currentEntries, { reference_number: referenceNumber, type_of_assignment: "manual" }];

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/${requestType}/${selectedRequest.reference_number}`,
        { ...selectedRequest, assigned_to: updatedEntries },
        { withCredentials: true }
      );

      setSelectedRequest((prev) => ({ ...prev, assigned_to: updatedEntries }));
      if (!isSelected) {
        setAssignmentTypes((prev) => ({ ...prev, [referenceNumber]: "manual" }));
      } else {
        setAssignmentTypes((prev) => {
          const { [referenceNumber]: _, ...rest } = prev;
          return rest;
        });
      }

      fetchRequests();
      ToastNotification.success("Success", "Assigned employees updated.");

      if (!isSelected) {
        handleSaveActivity("An employee has been assigned (manual).");
        await setRequestStatusToInProgress();
      } else if (overrideMode && isAdmin && assignmentTypes[referenceNumber] === "auto") {
        await handleOverrideActivity({ removed: referenceNumber, added: "" });
      }
    } catch (error) {
      console.error("Error updating assigned employees:", error);
      ToastNotification.error("Error", "Failed to update assigned employees.");
    }
  };

  const toggleAsset = (asset) => {
    const alreadyAssigned = selectedRequest.assigned_assets?.some(
      (a) => a.reference_number === asset.reference_number
    );

    if (alreadyAssigned) {
      const updated = selectedRequest.assigned_assets.filter(
        (a) => a.reference_number !== asset.reference_number
      );

      updateAssetAssignment(updated);
      ToastNotification.success("Success", "Asset unassigned.");
      updateAssetLog();
    } else {
      setAssetToAssign(asset);
      setQuantityInput(1);
      setOpenQuantityModal(true);
    }
  };

  const confirmAssetAssignment = async () => {
    const updated = [
      ...(selectedRequest.assigned_assets || []),
      {
        reference_number: assetToAssign.reference_number,
        quantity: quantityInput,
      },
    ];
    await updateAssetAssignment(updated);
    setOpenQuantityModal(false);
    ToastNotification.success("Success", "Asset assigned with quantity.");
    handleSaveActivity(
      `Assigned ${quantityInput} ${assetToAssign.name}(s) to this request.`
    );
    createAssetLog();
    await setRequestStatusToInProgress();
  };

  const updateAssetAssignment = async (updatedAssets) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/${requestType}/${selectedRequest.reference_number}`, {
        ...selectedRequest,
        assigned_assets: updatedAssets,
      }, { withCredentials: true });

      setSelectedRequest((prev) => ({
        ...prev,
        assigned_assets: updatedAssets,
      }));
      fetchRequests();
    } catch (error) {
      console.error("Error updating assigned assets:", error);
      ToastNotification.error("Error", "Failed to update assigned assets.");
    }
  };

  const getQuantityForAsset = (ref) => {
    const entry = selectedRequest.assigned_assets?.find(
      (a) => a.reference_number === ref
    );
    return entry?.quantity || 1;
  };

  const filteredEmployees =
    employees.length > 0
      ? employees.filter((emp) =>
          `${emp.first_name} ${emp.last_name}`
            .toLowerCase()
            .includes(employeeSearchQuery.toLowerCase())
        )
      : [];

  const ASSET_CATEGORY_BY_REQUEST_TYPE = {
    Vehicle: ["Vehicle"],
    Venue: ["Venue"],
    Job: ["Furniture", "Computer", "Equipment", "Machinery", "Appliance", "Tools", "Software", "Others"],
    Purchasing: ["Furniture", "Computer", "Equipment", "Machinery", "Appliance", "Tools", "Software", "Others"],
  };

  // Default fallback: allow everything except Vehicle/Venue unless explicitly allowed
  const getAllowedCategories = (type) => {
    return ASSET_CATEGORY_BY_REQUEST_TYPE[type] || 
          ["Furniture", "Computer", "Equipment", "Machinery", "Appliance", "Tools", "Software", "Others"];
  };

  const allowedCategories = getAllowedCategories(requestType);

  const filteredAssets = assets.length > 0
    ? assets.filter((asset) => {
        const matchesSearch = `${asset.name} ${asset.tag_number || ""}`
          .toLowerCase()
          .includes(assetSearchQuery.toLowerCase());

        const matchesCategory = requestType === "vehicle_request"
          ? asset.category === "Vehicle"
          : requestType === "venue_request"
          ? asset.category === "Venue"
          : allowedCategories.includes(asset.category);

        return matchesSearch && matchesCategory;
      })
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* --- EMPLOYEE SECTION --- */}
      <div className="flex flex-col gap-2 p-3 mb-3 border-gray-400 border rounded-md h-1/2 overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">Assignee</p>
          {Object.values(assignmentTypes).includes("auto") && isAdmin && (
            <Button
              variant={overrideMode ? "filled" : "outlined"}
              size="sm"
              color={overrideMode ? "red" : "gray"}
              onClick={() => setOverrideMode((v) => !v)}
              className="ml-auto"
            >
              {overrideMode ? "Exit Override" : "Override Assignment"}
            </Button>
          )}
        </div>
        <Menu placement="bottom-start" dismiss={{ itemPress: false }}>
          <MenuHandler>
            <Button
              variant="outlined"
              size="sm"
              className="flex items-center w-full py-3 text-left"
            >
              {selectedEmployees.length > 0
                ? `Assigned (${selectedEmployees.length})`
                : "Assign Employee"}
            </Button>
          </MenuHandler>
          <MenuList className="max-h-64 overflow-y-auto w-full max-w-[280px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 mb-3 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2"
              placeholder="Search employee..."
              value={employeeSearchQuery}
              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
            />
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const currentRefs = (Array.isArray(selectedRequest.assigned_to)
                  ? selectedRequest.assigned_to
                  : []).map((e) => (typeof e === "string" ? e : e?.reference_number)).filter(Boolean);
                const isSelected = currentRefs.includes(emp.reference_number);
                const type = assignmentTypes[emp.reference_number];
                const selectedStyle = isSelected
                  ? type === "auto"
                    ? { backgroundColor: "#E8F5E9", border: "1px solid #4CAF50" }
                    : { backgroundColor: "#F5F5F5", border: "1px solid #BDBDBD" }
                  : {};
                return (
                  <MenuItem
                    key={emp.reference_number}
                    onClick={() => toggleEmployee(emp.reference_number)}
                    className={`flex justify-between items-center mb-2`}
                    style={selectedStyle}
                  >
                    <span className="flex items-center w-full">
                      {type === "auto" ? (
                        <CheckCircle size={18} color="#4CAF50" className="mr-2" />
                      ) : (
                        <UserCircle size={20} className="mr-2" />
                      )}
                      {emp.first_name} {emp.last_name}
                    </span>
                    {isSelected && (
                      <Chip
                        size="sm"
                        value={type === "auto" ? "✓ Auto" : "Manual"}
                        className="ml-2 text-white"
                        style={{
                          backgroundColor: type === "auto" ? "#4CAF50" : "#9E9E9E",
                          border: type === "auto" ? "1px solid #4CAF50" : "1px solid #9E9E9E",
                        }}
                      />
                    )}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem disabled>No employees found</MenuItem>
            )}
          </MenuList>
        </Menu>

        {selectedEmployees.length > 0 ? (
          <div className="mt-2 h-[100px] overflow-y-auto">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Currently Assigned
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((emp) => {
                const type = assignmentTypes[emp.reference_number];
                const label = `${emp.first_name} ${emp.last_name} ${type === "auto" ? "(Auto)" : "(Manual)"}`;
                return (
                  <Chip
                    key={emp.reference_number}
                    value={label}
                    onClose={() => toggleEmployee(emp.reference_number)}
                    className="text-white"
                    style={{
                      backgroundColor: type === "auto" ? "#4CAF50" : "#9E9E9E",
                      border: type === "auto" ? "1px solid #4CAF50" : "1px solid #9E9E9E",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <p className="flex justify-center items-center w-full h-full text-sm font-light text-gray-500">
            No employees assigned
          </p>
        )}
      </div>

      {/* --- ASSET SECTION --- */}
      <div className="flex flex-col gap-2 p-3 border-gray-400 border rounded-md h-1/2 overflow-y-auto">
        <p className="text-sm font-semibold text-gray-600">Assets</p>
        <Menu placement="top-start" dismiss={{ itemPress: false }}>
          <MenuHandler>
            <Button
              variant="outlined"
              size="sm"
              className="flex items-center w-full py-3 text-left"
            >
              {selectedAssets.length > 0
                ? `Assigned (${selectedAssets.length})`
                : "Assign Assets"}
            </Button>
          </MenuHandler>
          <MenuList className="max-h-64 overflow-y-auto w-full max-w-[280px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 mb-3 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2"
              placeholder="Search assets..."
              value={assetSearchQuery}
              onChange={(e) => setAssetSearchQuery(e.target.value)}
            />

            {requestType === "vehicle_request" && (
              <div className="px-3 py-1 text-xs text-gray-500 italic">
                Only Vehicle assets are available for Vehicle requests
              </div>
            )}
            {requestType === "venue_request" && (
              <div className="px-3 py-1 text-xs text-gray-500 italic">
                Only Venue assets are available for Venue requests
              </div>
            )}

            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const isSelected = selectedRequest?.assigned_assets?.some(
                  (a) => a.reference_number === asset.reference_number
                );

                return (
                  <MenuItem
                    key={asset.reference_number}
                    onClick={() => toggleAsset(asset)}
                    className={`flex justify-between items-center mb-2 ${
                      isSelected ? "bg-blue-100" : ""
                    }`}
                  >
                    <span className="flex items-center w-full py-2">
                      <HardDrive size={20} className="mr-2" />
                      {asset.name}
                    </span>
                    {isSelected && (
                      <Chip
                        size="sm"
                        color="blue"
                        value="Assigned"
                        className="ml-2"
                      />
                    )}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem disabled>No assets found</MenuItem>
            )}
          </MenuList>
        </Menu>

        {selectedAssets.length > 0 ? (
          <div className="mt-2 h-[100px] overflow-y-auto">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Currently Assigned
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedAssets.map((asset) => (
                <Chip
                  key={asset.reference_number}
                  value={`${asset.name}`}
                  onClose={() => toggleAsset(asset)}
                  color="blue"
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="flex justify-center items-center w-full h-full text-sm font-light text-gray-500">
            No assets assigned
          </p>
        )}
      </div>

      {/* MODAL: Quantity input */}
      <Dialog
        open={openQuantityModal}
        handler={() => setOpenQuantityModal(false)}
      >
        <DialogHeader>Assign Asset Quantity</DialogHeader>
        <DialogBody>
          <Typography>
            Enter quantity for <strong>{assetToAssign?.name}</strong>
          </Typography>
          <input
            type="number"
            className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={quantityInput}
            onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
            min={1}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            onClick={() => setOpenQuantityModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="blue"
            onClick={confirmAssetAssignment}
            disabled={quantityInput < 1}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Assignment;
