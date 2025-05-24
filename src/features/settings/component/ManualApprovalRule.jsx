import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  MenuItem,
  Typography,
} from "@material-tailwind/react";
import { Menu, MenuHandler, MenuList } from "@material-tailwind/react";
import { FunnelSimple, Plus, UserCircle } from "@phosphor-icons/react";
import { Chip } from "@material-tailwind/react";
import { useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { UserContext } from "../../../context/UserContext";
import PositionSelect from "../../../utils/select/positionSelect";
import DepartmentSelect from "../../../utils/select/departmentSelect";

const ManualApprovalRule = () => {
  const {
    manualApprovalRules,
    fetchManualApprovalRules,
    createManualApprovalRule,
    updateManualApprovalRule,
    deleteManualApprovalRule,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    reference_number: "",
    name: "",
    position: "",
    department: "",
    email: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manualApprovalRuleToDelete, setManualApprovalRuleToDelete] =
    useState(null);

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

  useEffect(() => {
    fetchManualApprovalRules();
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

  const handleAddManualApprovalRule = () => {
    setEditIndex("new");
    setEditValues({
      reference_number: "",
      name: "",
      position: "",
      department: "",
      email: "",
    });
    setAddingNew(true);
  };

  const handleEditManualApprovalRule = (manualApprovalRule) => {
    setEditIndex(manualApprovalRule.id);
    setEditValues({ ...manualApprovalRule });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateManualApprovalRule = async (id) => {
    if (addingNew) {
      await createManualApprovalRule(editValues);
    } else {
      await updateManualApprovalRule(id, editValues);
    }

    resetEditState();
    fetchManualApprovalRules();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({
      reference_number: "",
      name: "",
      position: "",
      department: "",
      email: "",
    });
    setAddingNew(false);
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const openDeleteDialog = (id) => {
    setManualApprovalRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApprovalRule = async () => {
    if (manualApprovalRuleToDelete !== null) {
      await deleteManualApprovalRule(manualApprovalRuleToDelete);
      fetchManualApprovalRules();
    }
    setDeleteDialogOpen(false);
    setManualApprovalRuleToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setManualApprovalRuleToDelete(null);
  };

  const renderRow = (manualApprovalRule, index) => {
    const isEditing = editIndex === manualApprovalRule.id;

    return (
      <tr
        key={manualApprovalRule.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === manualApprovalRule.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(manualApprovalRule.id)}
      >
        <td className="py-3 px-4">
          <Chip
            value={index + 1}
            color="blue"
            className="flex items-center py-2 justify-center text-white w-fit rounded-full"
          />
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <input
              type="text"
              name="reference_number"
              value={editValues.reference_number}
              onChange={handleChange}
              className="w-fit px-2 py-1 rounded-md border"
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {manualApprovalRule.reference_number}
            </span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editValues.name}
              onChange={handleChange}
              className="w-fit px-2 py-1 rounded-md border"
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {manualApprovalRule.name}
            </span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <DepartmentSelect
              value={editValues.department}
              onChange={handleChange}
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {manualApprovalRule.department}
            </span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <PositionSelect
              value={editValues.position}
              onChange={handleChange}
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {manualApprovalRule.position}
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
            />
          ) : (
            <span className="w-fit whitespace-nowrap">
              {manualApprovalRule.email}
            </span>
          )}
        </td>
      </tr>
    );
  };

  const UserPicker = ({ onSelect }) => {
    const { approvers } = useContext(SettingsContext);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = approvers.filter((user) =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    return (
      <Menu placement="bottom-start" dismiss={{ itemPress: false }}>
        <MenuHandler>
          <Button variant="outlined" size="sm" className="w-fit text-left py-2">
            Select Approver
          </Button>
        </MenuHandler>
        <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px] p-2">
          <input
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm"
            placeholder="Search approver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <MenuItem
                key={user.reference_number}
                onClick={() => onSelect(user)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <UserCircle size={20} /> {user.name}
                </span>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No matching approvers</MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  };

  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const { departments, fetchDepartments } = useContext(SettingsContext);
  const { positions, fetchPositions } = useContext(SettingsContext);

  const filteredManualApprovalRule = manualApprovalRules.filter(
    (a) =>
      (!department || a.department === department) &&
      (!position || a.position === position)
  );

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const handleFilterChange = (key, value) => {
    // const updatedFilters = { ...filters, [key]: value };

    if (key === "department") setDepartment(value);
    if (key === "position") setPosition(value);
  };

  const handleReset = () => {
    setDepartment("");
    setPosition("");
  };

  const isValidApprovalRule = () => {
    const { reference_number, name, email, position, department } = editValues;
    return (
      reference_number.trim() !== "" &&
      name.trim() !== "" &&
      email.trim() !== "" &&
      position.trim() !== "" &&
      department.trim() !== ""
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
              Manual Approval Rule
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage manual approval rule.
            </Typography>
          </div>

          <div className="flex gap-2">
            {/* Position Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={position || "Filter Position"}
                  variant={position ? "filled" : "ghost"}
                  color={position ? "blue" : "gray"}
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
                  onClick={() => handleFilterChange("position", "")}
                  variant={position === "" ? "filled" : "ghost"}
                  color="blue"
                  className="cursor-pointer  w-fit"
                />
                {positions.map((p) => (
                  <Chip
                    key={p.id}
                    value={p.position}
                    onClick={() => handleFilterChange("position", p.position)}
                    variant={position === p.id ? "filled" : "ghost"}
                    color={position === p.id ? "blue" : "gray"}
                    className="cursor-pointer  w-fit"
                  />
                ))}
              </MenuList>
            </Menu>

            {/* Department Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={department || "Filter Department"}
                  variant={department ? "filled" : "ghost"}
                  color={department ? "blue" : "gray"}
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
                  onClick={() => handleFilterChange("department", "")}
                  variant={department === "" ? "filled" : "ghost"}
                  color="blue"
                  className="cursor-pointer  w-fit"
                />
                {departments.map((d) => (
                  <Chip
                    key={d.id}
                    value={d.name}
                    onClick={() => handleFilterChange("department", d.name)}
                    variant={department === d.name ? "filled" : "ghost"}
                    color={department === d.name ? "blue" : "gray"}
                    className="cursor-pointer  w-fit"
                  />
                ))}
              </MenuList>
            </Menu>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Reference Number</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Department</th>
                  <th className="py-3 px-4 border-b">Position</th>
                  <th className="py-3 px-4 border-b">Email</th>
                </tr>
              </thead>
              <tbody>
                {manualApprovalRules.length > 0 &&
                  filteredManualApprovalRule.map((manualApprovalRule, idx) =>
                    renderRow(manualApprovalRule, idx)
                  )}
                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">
                      {manualApprovalRules.length + 1}
                    </td>
                    {["reference_number", "name", "department", "position"].map(
                      (field) => (
                        <td key={field} className="py-3 px-4">
                          {field === "position" ? (
                            <PositionSelect
                              value={editValues.position}
                              onChange={handleChange}
                            />
                          ) : field === "department" ? (
                            <DepartmentSelect
                              value={editValues.department}
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
                      )
                    )}
                    <td className="py-3 px-4">
                      <input
                        type="email"
                        name="email"
                        value={editValues.email}
                        onChange={handleChange}
                        className="w-fit px-2 py-1 rounded-md border"
                        disabled
                      />
                    </td>
                  </tr>
                )}

                {manualApprovalRules.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-400">
                      No approval rule found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="blue"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
                onClick={handleAddManualApprovalRule}
                disabled={editIndex !== null}
              >
                <Plus size={16} /> Add Approval Rule
              </Button>

              {(editIndex === "new" || editIndex !== null) && (
                <UserPicker
                  onSelect={(user) =>
                    setEditValues({
                      reference_number: user.reference_number,
                      name: user.name,
                      email: user.email,
                      position: user.position,
                      department: user.department,
                    })
                  }
                />
              )}
            </div>

            <div className="flex gap-2">
              {editIndex === "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdateManualApprovalRule(null)}
                    className="py-2 px-4"
                    disabled={
                      editValues.position === "" || editValues.department === ""
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
                    onClick={() =>
                      handleUpdateManualApprovalRule(selectedRowId)
                    }
                    className="py-2 px-4"
                    disabled={
                      editValues.position === "" || editValues.department === ""
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
                      const selected = manualApprovalRules.find(
                        (p) => p.id === selectedRowId
                      );
                      handleEditManualApprovalRule(selected);
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
          Are you sure you want to delete this approver? This action cannot be
          undone.
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="red"
            onClick={confirmDeleteApprovalRule}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default ManualApprovalRule;
