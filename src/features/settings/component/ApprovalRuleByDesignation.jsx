import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
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
import DesignationSelect from "../../../utils/select/designationSelect";

const ApprovalRuleByDesignation = () => {
  const {
    approvalRulesByDesignation,
    fetchApprovalRulesByDesignation,
    createApprovalRuleByDesignation,
    updateApprovalRuleByDesignation,
    deleteApprovalRuleByDesignation,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    designation_id: "",
    position_id: "",
    required: true,
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalRuleToDelete, setApprovalRuleToDelete] = useState(null);

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

  useEffect(() => {
    fetchApprovalRulesByDesignation();
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

  const handleAddApprovalRule = () => {
    setEditIndex("new");
    setEditValues({
      designation_id: "",
      position_id: "",
      required: true,
    });
    setAddingNew(true);
  };

  const handleEditApprovalRule = (approvalRule) => {
    setEditIndex(approvalRule.id);
    setEditValues({ ...approvalRule });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateApprovalRule = async (id) => {
    if (addingNew) {
      await createApprovalRuleByDesignation(editValues);
    } else {
      await updateApprovalRuleByDesignation(id, editValues);
    }

    resetEditState();
    fetchApprovalRulesByDesignation();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({
      designation_id: "",
      position_id: "",
      required: true,
    });
    setAddingNew(false);
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const openDeleteDialog = (id) => {
    setApprovalRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApprovalRule = async () => {
    if (approvalRuleToDelete !== null) {
      await deleteApprovalRuleByDesignation(approvalRuleToDelete);
      fetchApprovalRulesByDesignation();
    }
    setDeleteDialogOpen(false);
    setApprovalRuleToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setApprovalRuleToDelete(null);
  };

  const renderRow = (approvalRule, index) => {
    const isEditing = editIndex === approvalRule.id;

    return (
      <tr
        key={approvalRule.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === approvalRule.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(approvalRule.id)}
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
            <DesignationSelect
              value={editValues.designation_id}
              onChange={handleChange}
            />
          ) : (
            <Chip
              value={approvalRule.designation.designation}
              color="cyan"
              className="mr-2 text-white w-fit"
            />
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
              {approvalRule.position.position}
            </span>
          )}
        </td>

        <td className="py-3 px-4 w-fit">
          {isEditing ? (
            <Checkbox
              color={editValues.required ? "green" : "red"}
              checked={editValues.required}
              onChange={(e) =>
                setEditValues({ ...editValues, required: e.target.checked })
              }
              className="h-6 w-6 rounded-full border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 hover:before:opacity-0"
            />
          ) : (
            <Chip
              value={approvalRule.required ? "Required" : "Not Required"}
              color={approvalRule.required ? "green" : "red"}
              className="mr-2 text-white w-fit"
            />
          )}
        </td>
      </tr>
    );
  };

  // const UserPicker = ({ onSelect }) => {
  //   const { allUserInfo } = useContext(UserContext);
  //   const [searchQuery, setSearchQuery] = useState("");

  //   const filtered = allUserInfo.filter((user) =>
  //     `${user.first_name} ${user.last_name}`
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase())
  //   );

  //   return (
  //     <Menu placement="bottom-start" dismiss={{ itemPress: true }}>
  //       <MenuHandler>
  //         <Button variant="outlined" size="sm" className="w-fit text-left py-2">
  //           Select Approver
  //         </Button>
  //       </MenuHandler>
  //       <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px] p-2">
  //         <input
  //           className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm"
  //           placeholder="Search employee..."
  //           value={searchQuery}
  //           onChange={(e) => setSearchQuery(e.target.value)}
  //         />
  //         {filtered.length > 0 ? (
  //           filtered.map((user) => (
  //             <MenuItem
  //               key={user.reference_number}
  //               onClick={() => onSelect(user)}
  //               className="flex items-center justify-between"
  //             >
  //               <span className="flex items-center gap-2">
  //                 <UserCircle size={20} /> {user.first_name} {user.last_name}
  //               </span>
  //             </MenuItem>
  //           ))
  //         ) : (
  //           <MenuItem disabled>No matching users</MenuItem>
  //         )}
  //       </MenuList>
  //     </Menu>
  //   );
  // };

  const [designation_id, setDesignationId] = useState("");
  const [position_id, setPositionId] = useState("");
  const [required, setRequired] = useState(null);

  const requiredOptions = [
    { id: 1, name: "Required", value: true },
    { id: 2, name: "Not Required", value: false },
  ];

  const { designations, fetchDesignations } = useContext(SettingsContext);
  const { positions, fetchPositions } = useContext(SettingsContext);

  const filteredApprovalRule = approvalRulesByDesignation.filter(
    (a) =>
      (designation_id === "" || a.designation_id === designation_id) &&
      (position_id === "" || a.position_id === position_id) &&
      (required === null || a.required === required)
  );

  useEffect(() => {
    fetchDesignations();
    fetchPositions();
  }, []);

  const handleFilterChange = (key, value) => {
    // const updatedFilters = { ...filters, [key]: value };

    if (key === "designation") setDesignationId(value);
    if (key === "position") setPositionId(value);
    if (key === "required") setRequired(value);
  };

  const handleReset = () => {
    setDesignationId("");
    setPositionId("");
    setRequired(null);
  };

  const isValidApprovalRule = () => {
    const { designation_id, position_id } = editValues;
    return designation_id.trim() !== "" && position_id.trim() !== "";
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
              Approval Rule by Designation
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage approval rule by designation.
            </Typography>
          </div>

          <div className="flex gap-2">
            {/* Position Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={position_id || "Filter Position"}
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
                  onClick={() => handleFilterChange("position", "")}
                  variant={position_id === "" ? "filled" : "ghost"}
                  color="blue"
                  className="cursor-pointer  w-fit"
                />
                {positions.map((p) => (
                  <Chip
                    key={p.id}
                    value={p.position}
                    onClick={() => handleFilterChange("position", p.position)}
                    variant={position_id === p.id ? "filled" : "ghost"}
                    color={position_id === p.id ? "blue" : "gray"}
                    className="cursor-pointer  w-fit"
                  />
                ))}
              </MenuList>
            </Menu>

            {/* Designation Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={
                    designations.find((d) => d.id === designation_id)
                      ?.designation || "Filter Designation"
                  }
                  variant={designation_id ? "filled" : "ghost"}
                  color={designation_id ? "blue" : "gray"}
                  className="cursor-pointer w-fit"
                  icon={<FunnelSimple size={16} />}
                />
              </MenuHandler>
              <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto gap-2 flex flex-col">
                <Typography variant="small" className="mb-2 font-semibold">
                  Designation
                </Typography>
                <Chip
                  value="All"
                  onClick={() => handleFilterChange("designation", "")}
                  variant={designation_id === "" ? "filled" : "ghost"}
                  color="blue"
                  className="cursor-pointer  w-fit"
                />
                {designations.map((d) => (
                  <Chip
                    key={d.id}
                    value={d.designation}
                    onClick={() => handleFilterChange("designation", d.id)}
                    variant={designation_id === d.id ? "filled" : "ghost"}
                    color={designation_id === d.id ? "blue" : "gray"}
                    className="cursor-pointer  w-fit"
                  />
                ))}
              </MenuList>
            </Menu>

            {/* Required Filter */}
            <Menu placement="bottom-start">
              <MenuHandler>
                <Chip
                  value={
                    required === null
                      ? "Filter Required"
                      : required
                      ? "Required"
                      : "Not Required"
                  }
                  variant={required ? "filled" : "ghost"}
                  color={
                    required === null ? "gray" : required ? "green" : "red"
                  }
                  className="cursor-pointer w-fit"
                  icon={<FunnelSimple size={16} />}
                />
              </MenuHandler>
              <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto gap-2 flex flex-col">
                <Typography variant="small" className="mb-2 font-semibold">
                  Required
                </Typography>
                {requiredOptions.map((r) => (
                  <Chip
                    key={r.id}
                    value={r.name}
                    onClick={() => handleFilterChange("required", r.value)}
                    variant={required === r.value ? "filled" : "ghost"}
                    color={r.value ? "green" : "red"}
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
                  <th className="py-3 px-4 border-b">Designation</th>
                  <th className="py-3 px-4 border-b">Position</th>
                  <th className="py-3 px-4 border-b">Required</th>
                </tr>
              </thead>
              <tbody>
                {approvalRulesByDesignation.length > 0 &&
                  (filteredApprovalRule.length > 0 ? (
                    filteredApprovalRule.map((approvalRule, idx) =>
                      renderRow(approvalRule, idx)
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-3">
                        No approval rules match the filter.
                      </td>
                    </tr>
                  ))}
                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">
                      {approvalRulesByDesignation.length + 1}
                    </td>
                    {["designation", "position"].map((field) => (
                      <td key={field} className="py-3 px-4">
                        {field === "position" ? (
                          <PositionSelect
                            value={editValues.position_id}
                            onChange={handleChange}
                          />
                        ) : field === "designation" ? (
                          <DesignationSelect
                            value={editValues.designation_id}
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
                    <td className="py-3 px-4">
                      <Checkbox
                        color={editValues.required ? "green" : "red"}
                        checked={editValues.required}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            required: e.target.checked,
                          })
                        }
                        className="h-6 w-6 rounded-full border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 hover:before:opacity-0"
                      />
                    </td>
                  </tr>
                )}

                {approvalRulesByDesignation.length === 0 &&
                  editIndex !== "new" && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-4 text-center text-gray-400"
                      >
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
                onClick={handleAddApprovalRule}
                disabled={editIndex !== null}
              >
                <Plus size={16} /> Add Approval Rule
              </Button>

              {/* {(editIndex === "new" || editIndex !== null) && (
                <UserPicker
                  onSelect={(user) =>
                    setEditValues({
                      position: "",
                      designation: "",
                    })
                  }
                />
              )} */}
            </div>

            <div className="flex gap-2">
              {editIndex === "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdateApprovalRule(null)}
                    className="py-2 px-4"
                    disabled={
                      editValues.position_id === "" ||
                      editValues.designation_id === ""
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
                    onClick={() => handleUpdateApprovalRule(selectedRowId)}
                    className="py-2 px-4"
                    disabled={
                      editValues.position_id === "" ||
                      editValues.designation_id === ""
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
                      const selected = approvalRulesByDesignation.find(
                        (p) => p.id === selectedRowId
                      );
                      handleEditApprovalRule(selected);
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

export default ApprovalRuleByDesignation;
