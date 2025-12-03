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
} from "@material-tailwind/react";
import { Plus } from "@phosphor-icons/react";

const Organization = () => {
  const {
    organizations,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    organization: "",
    description: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleListKeyDown = (e) => {
    const container = listRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll('[role="listitem"]'));
    const currentIndex = items.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[Math.min(currentIndex + 1, items.length - 1)] || items[0];
      next && next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[Math.max(currentIndex - 1, 0)] || items[items.length - 1];
      prev && prev.focus();
    }
  };

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

  const handleAddOrganization = () => {
    setEditIndex("new");
    setEditValues({ organization: "", description: "" });
    setAddingNew(true);
  };

  const handleEditOrganization = (org) => {
    setEditIndex(org.id);
    setEditValues({
      organization: org.organization,
      description: org.description,
    });
    setEditDialogOpen(true);
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateOrganization = async (id) => {
    if (id === null || addingNew) {
      setSavingCreate(true);
      setCreateError("");
      try {
        await createOrganization(editValues);
      } catch (e) {
        setCreateError("Failed to save organization. Please try again.");
      }
      setSavingCreate(false);
    } else {
      setSavingUpdate(true);
      setUpdateError("");
      try {
        await updateOrganization(id, editValues);
      } catch (e) {
        setUpdateError("Failed to update organization. Please try again.");
      }
      setSavingUpdate(false);
      setEditDialogOpen(false);
    }
    resetEditState();
    fetchOrganizations();
  };

  const handleCancelEdit = () => {
    resetEditState();
    setEditDialogOpen(false);
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ organization: "", description: "" });
    setAddingNew(false);
  };

  const openDeleteDialog = (id) => {
    setOrgToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrganization = async () => {
    if (orgToDelete !== null) {
      await deleteOrganization(orgToDelete);
      fetchOrganizations();
    }
    setDeleteDialogOpen(false);
    setOrgToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setOrgToDelete(null);
  };

  const renderRow = (org, index) => {
    const isEditing = editIndex === org.id;

    return (
      <tr
        key={org.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === org.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(org.id)}
      >
        <td className="py-3 px-4">
          <Chip
            value={index + 1}
            color="blue"
            className="flex items-center py-2 justify-center text-white w-fit rounded-full"
          />
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <input
              type="text"
              name="organization"
              value={editValues.organization}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={org.organization}
              color="cyan"
              className="text-white w-fit"
            />
          )}
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <input
              type="text"
              name="description"
              value={editValues.description}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            org.description
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4 h-full">
      <Card className="shadow-none">
        <CardHeader floated={false} shadow={false} className="rounded-none ">
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Organizations
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the organizations in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Organization</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  type="text"
                  name="organization"
                  value={editValues.organization}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Organization"
                />
                <span className="text-sm text-gray-700">Description</span>
                <input
                  type="text"
                  name="description"
                  value={editValues.description}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancelEdit}>Reset</Button>
              <Button
                color="green"
                onClick={() => {
                  handleUpdateOrganization(null);
                }}
                disabled={editValues.organization.trim() === "" || editValues.description.trim() === ""}
              >
                {savingCreate ? "Saving..." : "Save Organization"}
              </Button>
            </div>
            {createError && (
              <Typography className="text-sm text-red-600" role="alert">{createError}</Typography>
            )}
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-4 pointer-events-none bg-gradient-to-b from-white to-transparent" />
            <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none bg-gradient-to-t from-white to-transparent" />
            <div
              className="flex flex-col gap-3 overflow-y-auto max-h-[40vh] scrollbar-thin scrollbar-thumb-gray-300 focus:outline-none"
              role="list"
              aria-label="Existing organizations"
              tabIndex={0}
              onKeyDown={handleListKeyDown}
              ref={listRef}
            >
              {organizations.length === 0 ? (
                <Typography className="text-sm text-gray-500">No organizations found.</Typography>
              ) : (
                organizations.map((org) => (
                  <div
                    key={org.id}
                    role="listitem"
                    tabIndex={-1}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">Organization: <span className="font-semibold">{org.organization}</span></span>
                      <span className="text-sm text-gray-700">Description: <span className="font-semibold">{org.description}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-1 hover:bg-blue-50"
                        onClick={() => handleEditOrganization(org)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="red"
                        className="flex items-center gap-1 hover:bg-red-50"
                        onClick={() => openDeleteDialog(org.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[350px] hidden">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Organization</th>
                  <th className="py-3 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {organizations.length > 0 &&
                  organizations.map((org, idx) => renderRow(org, idx))}

                {organizations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            {/* <Button
              variant="outlined"
              color="blue"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
              onClick={handleAddOrganization}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Organization
            </Button> */}
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this organization? This action cannot
          be undone.
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="red"
            onClick={confirmDeleteOrganization}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Organization</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-700">Organization</label>
            <input
              type="text"
              name="organization"
              value={editValues.organization}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Organization"
            />
            <label className="text-sm text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={editValues.description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Description"
            />
            {updateError && (
              <Typography className="text-sm text-red-600" role="alert">{updateError}</Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            color="green"
            onClick={() => handleUpdateOrganization(editIndex)}
            disabled={editValues.organization.trim() === "" || editValues.description.trim() === ""}
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Organization;
