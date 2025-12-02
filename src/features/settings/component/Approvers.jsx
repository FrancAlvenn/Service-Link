import { useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "../context/SettingsContext";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { FunnelSimple, Plus, UserCircle, ArrowClockwise } from "@phosphor-icons/react";
import { UserContext } from "../../../context/UserContext";
import DepartmentSelect from "../../../utils/select/departmentSelect";
import PositionSelect from "../../../utils/select/positionSelect";
import UserPicker from "../../../components/user_picker/UserPicker";
import { JobRequestsContext } from "../../request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../../request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../request_management/context/VenueRequestsContext";

const Approvers = () => {
  const {
    approvers,
    fetchApprovers,
    createApprover,
    updateApprover,
    deleteApprover,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    reference_number: "",
    name: "",
    position_id: "",
    department_id: "",
    email: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approverToDelete, setApproverToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [userSelectError, setUserSelectError] = useState("");

  const [selectedRowId, setSelectedRowId] = useState(null);

  // const { allUserInfo } = useContext(UserContext);

  // const {jobRequests, fetchJobRequests} = useContext(JobRequestsContext);

  // const {purchasingRequests, fetchPurchasingRequests} = useContext(PurchasingRequestsContext);

  // const {vehicleRequests, fetchVehicleRequests} = useContext(VehicleRequestsContext);

  // const {venueRequests, fetchVenueRequests} = useContext(VenueRequestsContext);

  // const allRequests = [
  //   ...Object.values(jobRequests),
  //   ...Object.values(purchasingRequests),
  //   ...Object.values(vehicleRequests),
  //   ...Object.values(venueRequests),
  // ];

  const tableRef = useRef(null);

  useEffect(() => {
    fetchApprovers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedRowId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddApprover = () => {
    setEditIndex("new");
    setEditValues({
      reference_number: "",
      name: "",
      position_id: "",
      department_id: "",
      email: "",
    });
    setAddingNew(true);
  };

  const handleEditApprover = (approver) => {
    setEditIndex(approver.id);
    setEditValues({ ...approver });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateApprover = async (id) => {
    if (addingNew) {
      await createApprover(editValues);
    } else {
      await updateApprover(id, editValues);
    }

    resetEditState();
    fetchApprovers();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({
      reference_number: "",
      name: "",
      position_id: "",
      department_id: "",
      email: "",
    });
    setAddingNew(false);
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const openDeleteDialog = (id) => {
    setApproverToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApprover = async () => {
    if (approverToDelete !== null) {
      setDeleting(true);
      await deleteApprover(approverToDelete);
      setDeleting(false);
      fetchApprovers();
    }
    setDeleteDialogOpen(false);
    setApproverToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setApproverToDelete(null);
  };

  const renderRow = (approver, index) => {
    const isEditing = editIndex === approver.id;

    return (
      <tr
        key={approver.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === approver.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(approver.id)}
      >
        <td className="py-3 px-4">
          <Chip
            value={index + 1}
            color="blue"
            className="flex items-center py-2 justify-center text-white w-fit rounded-full"
          />
        </td>

        {/* Ref Number */}
        <td className="py-3 px-4">
          {isEditing ? (
            <input
              type="text"
              name="reference_number"
              value={editValues.reference_number}
              onChange={handleChange}
              className="w-fit px-2 py-1 rounded-md border"
              disabled
            />
          ) : (
            <Chip
              variant="outlined"
              value={approver.reference_number}
              color="blue"
              className="flex items-center py-2 justify-center text-blue-500 w-fit rounded-full"
            />
          )}
        </td>

        {/* Name */}
        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editValues.name}
              onChange={handleChange}
              className="w-fit px-2 py-1 rounded-md border"
              disabled
            />
          ) : (
            <span className="w-fit whitespace-nowrap">{approver.name}</span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <PositionSelect
              value={editValues.position_id}
              onChange={handleChange}
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {approver.position.position}
            </span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <DepartmentSelect
              value={editValues.department_id}
              onChange={handleChange}
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {approver.department?.name || ""}
            </span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <input
              type="text"
              name="email"
              value={editValues.email}
              onChange={handleChange}
              className="w-fit px-2 py-1 rounded-md border"
              disabled
            />
          ) : (
            <span className="w-fit whitespace-nowrap">{approver.email}</span>
          )}
        </td>
      </tr>
    );
  };

  const [department_id, setDepartment_id] = useState("");
  const [position_id, setPosition_id] = useState("");

  const { departments, fetchDepartments } = useContext(SettingsContext);
  const { positions, fetchPositions } = useContext(SettingsContext);
  const { approvalRulesByDepartment, approvalRulesByDesignation, approvalRulesByRequestType } = useContext(SettingsContext);

  const filteredApprovers = approvers.filter(
    (a) =>
      (!department_id || a.department_id === department_id) &&
      (!position_id || a.position_id === position_id)
  );

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const handleFilterChange = (key, value) => {
    // const updatedFilters = { ...filters, [key]: value };

    if (key === "department_id") setDepartment_id(value);
    if (key === "position_id") setPosition_id(value);
  };

  const handleReset = () => {
    setDepartment_id("");
    setPosition_id("");
  };

  const isValidApprover = () => {
    const { reference_number, name, email, position_id, department_id } =
      editValues;
    return (
      reference_number!== "" &&
      name !== "" &&
      email !== "" &&
      position_id !== "" &&
      department_id !== ""
    );
  };

  return (
    <>
      <Card className="shadow-none">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none flex justify-between items-center flex-wrap gap-2"
        >
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Approvers Directory
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage approval personnel.
            </Typography>
          </div>

          <div className="flex gap-2">
            {/* Position Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={
                    positions.find((p) => p.id === position_id)?.position ||
                    "Filter Position"
                  }
                  variant={position_id ? "filled" : "ghost"}
                  color={position_id ? "blue" : "gray"}
                  className="cursor-pointer w-fit"
                  icon={<FunnelSimple size={16} />}
                />
              </MenuHandler>
              <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto gap-2 flex flex-col">
                <Typography variant="small" className="mb-2 font-semibold">
                  Position
                </Typography>
                <Chip
                  value="All"
                  onClick={() => handleFilterChange("position_id", "")}
                  variant={position_id === "" ? "filled" : "ghost"}
                  color="blue"
                  className="cursor-pointer  w-fit"
                />
                {positions.map((p) => (
                  <Chip
                    key={p.id}
                    value={p.position}
                    onClick={() => handleFilterChange("position_id", p.id)}
                    variant={position_id === p.id ? "filled" : "ghost"}
                    color={position_id === p.id ? "blue" : "gray"}
                    className="cursor-pointer  w-fit"
                  />
                ))}
              </MenuList>
            </Menu>

            {/* Department Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={
                    departments.find((d) => d.id === department_id)?.name ||
                    "Filter Department"
                  }
                  variant={department_id ? "filled" : "ghost"}
                  color={department_id ? "blue" : "gray"}
                  className="cursor-pointer w-fit"
                  icon={<FunnelSimple size={16} />}
                />
              </MenuHandler>
              <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto gap-2 flex flex-col">
                <Typography variant="small" className="mb-2 font-semibold">
                  Department
                </Typography>
                <Chip
                  value="All"
                  onClick={() => handleFilterChange("department_id", "")}
                  variant={department_id === "" ? "filled" : "ghost"}
                  color="blue"
                  className="cursor-pointer  w-fit"
                />
                {departments.map((d) => (
                  <Chip
                    key={d.id}
                    value={d.name}
                    onClick={() => handleFilterChange("department_id", d.id)}
                    variant={department_id === d.id ? "filled" : "ghost"}
                    color={department_id === d.id ? "blue" : "gray"}
                    className="cursor-pointer  w-fit"
                  />
                ))}
              </MenuList>
            </Menu>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Approver</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">User</span>
                <select disabled className="px-3 py-2 text-sm bg-white border rounded-md cursor-not-allowed" aria-label="Equals operator">
                  <option>equals</option>
                </select>
                <UserPicker
                  onSelect={(user) => {
                    if (!user || !user.reference_number || !user.first_name || !user.last_name || !user.email) {
                      setUserSelectError("Approver data unavailable.");
                      return;
                    }
                    setUserSelectError("");
                    setEditValues({
                      reference_number: user.reference_number,
                      name: `${user.first_name} ${user.last_name}`,
                      email: user.email,
                      position_id: editValues.position_id,
                      department_id: editValues.department_id,
                    });
                  }}
                />
                <Chip
                  value={editValues.name || "No user selected"}
                  variant={editValues.name ? "filled" : "ghost"}
                  color={editValues.name ? "blue" : "gray"}
                  className="w-fit"
                  aria-label="Selected approver"
                />
                {userSelectError && (
                  <Typography className="text-sm text-red-600" role="alert">{userSelectError}</Typography>
                )}
              </div>
            </div>

            <div>
              <Typography className="text-sm font-semibold text-gray-700">Assignment</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Position</span>
                <PositionSelect value={editValues.position_id} onChange={handleChange} />
                <span className="text-sm text-gray-700">Department</span>
                <DepartmentSelect value={editValues.department_id} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancelEdit} aria-label="Reset assignment">Reset</Button>
              <Button
                color="green"
                onClick={async () => {
                  if (!isValidApprover()) return;
                  setSavingCreate(true);
                  setCreateError("");
                  try {
                    await createApprover(editValues);
                  } catch (e) {
                    setCreateError("Failed to save approver. Please try again.");
                  }
                  setSavingCreate(false);
                  resetEditState();
                  fetchApprovers();
                }}
                disabled={!isValidApprover()}
              >
                {savingCreate ? "Saving..." : "Save Approver"}
              </Button>
            </div>
            {createError && (
              <Typography className="text-sm text-red-600 mt-1" role="alert">{createError}</Typography>
            )}
          </div>

          <div className="flex flex-col gap-3" role="list" aria-label="Existing approvers">
            {filteredApprovers.length === 0 ? (
              <Typography className="text-sm text-gray-500">No approvers match the filter.</Typography>
            ) : (
              filteredApprovers.map((approver) => (
                <div
                  key={approver.id}
                  role="listitem"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">Approver: <span className="font-semibold">{approver.name}</span> ({approver.reference_number})</span>
                    <span className="text-sm text-gray-700">Assignment: Position <span className="font-semibold">{approver.position?.position || approver.position_id}</span>, Department <span className="font-semibold">{approver.department?.name || approver.department_id}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      color="blue"
                      aria-label="Edit approver assignment"
                      className="flex items-center gap-1 hover:bg-blue-50"
                      onClick={() => {
                        setEditValues({
                          reference_number: approver.reference_number,
                          name: approver.name,
                          email: approver.email,
                          position_id: approver.position_id,
                          department_id: approver.department_id,
                        });
                        setEditIndex(approver.id);
                        setEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="red"
                      aria-label="Delete approver"
                      className="flex items-center gap-1 hover:bg-red-50"
                      onClick={() => openDeleteDialog(approver.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-y-auto max-h-[300px] hidden">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Ref. Number</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Position</th>
                  <th className="py-3 px-4 border-b">Department</th>
                  <th className="py-3 px-4 border-b">Email</th>
                </tr>
              </thead>
              <tbody>
                {approvers.length > 0 &&
                  filteredApprovers.map((approver, idx) =>
                    renderRow(approver, idx)
                  )}
                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{approvers.length + 1}</td>
                    {[
                      "reference_number",
                      "name",
                      "position_id",
                      "department_id",
                      "email",
                    ].map((field) => (
                      <td key={field} className="py-3 px-4">
                        {field === "position_id" ? (
                          <PositionSelect
                            value={editValues[field]}
                            onChange={handleChange}
                          />
                        ) : field === "department_id" ? (
                          <DepartmentSelect
                            value={editValues[field]}
                            onChange={handleChange}
                          />
                        ) : (
                          <input
                            type="text"
                            name={field}
                            value={editValues[field]}
                            onChange={handleChange}
                            className="w-fit px-2 py-1 rounded-md border"
                            disabled
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {filteredApprovers.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-400">
                      No approvers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 hidden">
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="blue"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
                onClick={handleAddApprover}
                disabled={editIndex !== null}
              >
                <Plus size={16} /> Add Approver
              </Button>

              {/* <Button
                variant="outlined"
                color="blue"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
                onClick={}
                disabled={editIndex !== null}
              >
                <ArrowClockwise size={16} /> Sync Approvers
              </Button> */}

              {(editIndex === "new" || editIndex !== null) && null}
            </div>

            <div className="flex gap-2">
              {editIndex === "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdateApprover(null)}
                    className="py-2 px-4"
                    disabled={
                      editValues.name === "" ||
                      editValues.position_id === "" ||
                      editValues.department_id === "" ||
                      editValues.email === ""
                    }
                  >
                    Save
                  </Button>
                  <Button
                    color="red"
                    onClick={handleCancelEdit}
                    className="py-2 px-4"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {selectedRowId && editIndex !== null && editIndex !== "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdateApprover(selectedRowId)}
                    className="py-2 px-4"
                    disabled={
                      editValues.name === "" ||
                      editValues.position_id === "" ||
                      editValues.department_id === "" ||
                      editValues.email === ""
                    }
                  >
                    Update
                  </Button>
                  <Button
                    color="red"
                    onClick={handleCancelEdit}
                    className="py-2 px-4"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {selectedRowId && editIndex === null && (
                <>
                  <Button
                    color="blue"
                    onClick={() => {
                      const selected = approvers.find(
                        (p) => p.id === selectedRowId
                      );
                      handleEditApprover(selected);
                    }}
                    className="py-2 px-4"
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    onClick={() => openDeleteDialog(selectedRowId)}
                    className="py-2 px-4"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this approver? This action cannot be undone.
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="filled" color="red" onClick={confirmDeleteApprover}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Approver</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Approver</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">User</span>
                <select disabled className="px-3 py-2 text-sm bg-white border rounded-md cursor-not-allowed" aria-label="Equals operator">
                  <option>equals</option>
                </select>
                <UserPicker
                  onSelect={(user) => {
                    if (!user || !user.reference_number || !user.first_name || !user.last_name || !user.email) {
                      setUserSelectError("Approver data unavailable.");
                      return;
                    }
                    setUserSelectError("");
                    setEditValues({
                      reference_number: user.reference_number,
                      name: `${user.first_name} ${user.last_name}`,
                      email: user.email,
                      position_id: editValues.position_id,
                      department_id: editValues.department_id,
                    });
                  }}
                />
                <Chip
                  value={editValues.name || "No user selected"}
                  variant={editValues.name ? "filled" : "ghost"}
                  color={editValues.name ? "blue" : "gray"}
                  className="w-fit"
                  aria-label="Selected approver"
                />
                {userSelectError && (
                  <Typography className="text-sm text-red-600" role="alert">{userSelectError}</Typography>
                )}
              </div>
            </div>

            <div>
              <Typography className="text-sm font-semibold text-gray-700">Assignment</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Position</span>
                <PositionSelect value={editValues.position_id} onChange={handleChange} />
                <span className="text-sm text-gray-700">Department</span>
                <DepartmentSelect value={editValues.department_id} onChange={handleChange} />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            color="green"
            aria-label="Save edits"
            onClick={async () => {
              if (!isValidApprover()) return;
              setSavingUpdate(true);
              setUpdateError("");
              try {
                await updateApprover(editIndex, editValues);
              } catch (e) {
                setUpdateError("Failed to save changes. Please try again.");
              }
              setSavingUpdate(false);
              setEditDialogOpen(false);
              setEditIndex(null);
              fetchApprovers();
            }}
            disabled={!isValidApprover() || savingUpdate}
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
          {updateError && (
            <Typography className="text-sm text-red-600" role="alert">{updateError}</Typography>
          )}
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Approvers;
