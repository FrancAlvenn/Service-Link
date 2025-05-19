import { useContext, useEffect, useState } from "react";
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
import EmployeeContext from "../../features/employee_management/context/EmployeeContext";
import ToastNotification from "../../utils/ToastNotification";
import { UserCircle, MagnifyingGlass, HardDrive } from "@phosphor-icons/react";
import { AuthContext } from "../../features/authentication";
import AssetContext from "../../features/asset_management/context/AssetContext";
import AssetAssignmentLogContext from "../../features/asset_management/context/AssetAssignmentLogContext";

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

  const {
    assetAssignmentLogs,
    fetchAssetAssignmentLogs,
    createAssetAssignment,
    updateAssetAssignmentLog,
  } = useContext(AssetAssignmentLogContext);

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
    await axios.get(`/request_activity/${selectedRequest.reference_number}`, {
      withCredentials: true,
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchAssets();
    fetchAssetAssignmentLogs();
  }, []);

  useEffect(() => {
    if (Array.isArray(selectedRequest.assigned_to)) {
      const selected = employees.filter((emp) =>
        selectedRequest.assigned_to.includes(emp.reference_number)
      );
      setSelectedEmployees(selected);
    }

    if (Array.isArray(selectedRequest.assigned_assets)) {
      const selected = assets.filter((asset) =>
        selectedRequest.assigned_assets?.some(
          (a) => a.reference_number === asset.reference_number
        )
      );
      setSelectedAssets(selected);
    }
  }, [
    selectedRequest?.assigned_to,
    selectedRequest?.assigned_assets,
    employees,
    assets,
  ]);

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
      await axios.post("/request_activity", newActivity, {
        withCredentials: true,
      });
      getRequestActivity();
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const setRequestStatusToInProgress = async () => {
    if (selectedRequest.status === "In Progress") return;
    try {
      await axios.patch(
        `/${requestType}/${selectedRequest.reference_number}/status`,
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
        "/request_activity",
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
    const current = selectedRequest.assigned_to || [];
    const updated = current.includes(referenceNumber)
      ? current.filter((ref) => ref !== referenceNumber)
      : [...current, referenceNumber];

    try {
      await axios.put(`/${requestType}/${selectedRequest.reference_number}`, {
        ...selectedRequest,
        assigned_to: updated,
      });

      setSelectedRequest((prev) => ({
        ...prev,
        assigned_to: updated,
      }));
      fetchRequests();
      ToastNotification.success("Success", "Assigned employees updated.");

      if (!current.includes(referenceNumber)) {
        handleSaveActivity("An employee has been assigned.");
        await setRequestStatusToInProgress();
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
      await axios.put(`/${requestType}/${selectedRequest.reference_number}`, {
        ...selectedRequest,
        assigned_assets: updatedAssets,
      });

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

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name}`
      .toLowerCase()
      .includes(employeeSearchQuery.toLowerCase())
  );

  const filteredAssets = assets.filter((asset) =>
    `${asset.name} ${asset.tag_number}`
      .toLowerCase()
      .includes(assetSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 h-[55vh] overflow-y-auto">
      {/* --- EMPLOYEE SECTION --- */}
      <div className="flex flex-col gap-2 p-3 mb-3 border-gray-400 border rounded-md h-1/2 overflow-y-auto">
        <p className="text-sm font-semibold text-gray-600">Assignee</p>
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
          <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 mb-3 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2"
              placeholder="Search employee..."
              value={employeeSearchQuery}
              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
            />
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const isSelected = selectedRequest?.assigned_to?.includes(
                  emp.reference_number
                );
                return (
                  <MenuItem
                    key={emp.reference_number}
                    onClick={() => toggleEmployee(emp.reference_number)}
                    className={`flex justify-between items-center mb-2 ${
                      isSelected ? "bg-blue-100" : ""
                    }`}
                  >
                    <span className="flex items-center w-full">
                      <UserCircle size={20} className="mr-2" />
                      {emp.first_name} {emp.last_name}
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
              {selectedEmployees.map((emp) => (
                <Chip
                  key={emp.reference_number}
                  value={`${emp.first_name} ${emp.last_name}`}
                  onClose={() => toggleEmployee(emp.reference_number)}
                  color="blue"
                />
              ))}
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
          <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 mb-3 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2"
              placeholder="Search assets..."
              value={assetSearchQuery}
              onChange={(e) => setAssetSearchQuery(e.target.value)}
            />
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
            variant="blue"
            onClick={confirmAssetAssignment}
            disabled={quantityInput < 1}
            className="bg-blue-500 cursor-pointer"
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Assignment;
