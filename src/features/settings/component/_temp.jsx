import { useContext, useEffect, useState } from "react";
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
import { FunnelSimple, Plus, UserCircle } from "@phosphor-icons/react";
import { UserContext } from "../../../context/UserContext";

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
    position: "",
    department: "",
    email: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approverToDelete, setApproverToDelete] = useState(null);

  useEffect(() => {
    fetchApprovers();
  }, []);

  const handleAddApprover = () => {
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
    setApproverToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApprover = async () => {
    if (approverToDelete !== null) {
      await deleteApprover(approverToDelete);
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
        className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300"
      >
        <td className="py-3 px-4">
          <Chip
            value={index + 1}
            color="blue"
            className="flex items-center py-2 justify-center text-white w-fit rounded-full"
          />
        </td>

        {/* Ref Number */}
        <td className="py-3 px-4">{approver.reference_number}</td>

        {/* Name */}
        <td className="py-3 px-4">
          {isEditing ? (
            <UserPicker
              onSelect={(user) =>
                setEditValues({
                  reference_number: user.reference_number,
                  name: `${user.first_name} ${user.last_name}`,
                  position: user.position,
                  department: user.department,
                  email: user.email,
                })
              }
            />
          ) : (
            approver.name
          )}
        </td>

        {/* Position */}
        <td className="py-3 px-4">{approver.position}</td>

        {/* Department */}
        <td className="py-3 px-4">{approver.department}</td>

        {/* Email */}
        <td className="py-3 px-4">{approver.email}</td>

        {/* Actions */}
        <td className="py-3 px-4">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <button
                className="text-green-600 hover:underline font-semibold"
                onClick={() => handleUpdateApprover(approver.id)}
              >
                Update
              </button>
              <button
                className="text-gray-500 hover:underline font-semibold"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <button
                className="text-blue-500 hover:underline font-semibold"
                onClick={() => handleEditApprover(approver)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:underline font-semibold"
                onClick={() => openDeleteDialog(approver.id)}
              >
                Delete
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  const UserPicker = ({ onSelect }) => {
    const { allUserInfo } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = allUserInfo.filter((user) =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    return (
      <Menu placement="bottom-start" dismiss={{ itemPress: true }}>
        <MenuHandler>
          <Button variant="outlined" size="sm" className="w-fit text-left py-2">
            Select Approver
          </Button>
        </MenuHandler>
        <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px] p-2">
          <input
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm"
            placeholder="Search employee..."
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
                  <UserCircle size={20} /> {user.first_name} {user.last_name}
                </span>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No matching users</MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  };

  const [department, setDepartment] = useState("");

  const { departments, fetchDepartments } = useContext(SettingsContext);

  const filteredApprovers = department
    ? approvers.filter((a) => a.department === department)
    : approvers;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleFilterChange = (key, value) => {
    // const updatedFilters = { ...filters, [key]: value };

    if (key === "department") setDepartment(value);
  };

  const handleReset = () => {
    setDepartment("");
  };

  return (
    <>
      <Card className="shadow-none">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none pb-2 border-b flex justify-between items-center flex-wrap gap-2"
        >
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Approvers
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage approval personnel.
            </Typography>
          </div>

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
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2">
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Ref. Number</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Position</th>
                  <th className="py-3 px-4 border-b">Department</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Actions</th>
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
                      "position",
                      "department",
                      "email",
                    ].map((field) => (
                      <td key={field} className="py-3 px-4">
                        <input
                          type="text"
                          name={field}
                          value={editValues[field]}
                          onChange={handleChange}
                          className="w-full px-2 py-1 rounded-md border"
                        />
                      </td>
                    ))}
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => handleUpdateApprover(null)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-500 hover:underline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </td>
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

          <div className="flex gap-2 items-center mt-4">
            <Button
              variant="outlined"
              color="blue"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
              onClick={handleAddApprover}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Approver
            </Button>

            {(editIndex === "new" || editIndex === "edit") && (
              <UserPicker
                onSelect={(user) =>
                  setEditValues({
                    reference_number: user.reference_number,
                    name: `${user.first_name} ${user.last_name}`,
                    position: user.position,
                    department: user.department,
                    email: user.email,
                  })
                }
              />
            )}
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
          <Button variant="filled" color="red" onClick={confirmDeleteApprover}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Approvers;
