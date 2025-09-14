import {
  CardHeader,
  Typography,
  Button,
  CardBody,
  Menu,
  MenuHandler,
  MenuList,
  Input,
} from "@material-tailwind/react";
import { ArrowClockwise, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import emailjs from "@emailjs/browser";

// import {UserSidebar} from "./UserSidebar.jsx";
import Header from "../../../layouts/header";
import { UserContext } from "../../../context/UserContext.js";
import { getUserColumnConfig } from "../utils/columnConfig.js";
import { VenueRequestsContext } from "../../request_management/context/VenueRequestsContext.js";
import { VehicleRequestsContext } from "../../request_management/context/VehicleRequestsContext.js";
import { JobRequestsContext } from "../../request_management/context/JobRequestsContext.js";
import { PurchasingRequestsContext } from "../../request_management/context/PurchasingRequestsContext.js";
import { useDebounce } from "../../../utils/useDebounce.js";
import ToastNotification from "../../../utils/ToastNotification.js";

const UserManagement = () => {
  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests } = useContext(
    PurchasingRequestsContext
  );
  const { vehicleRequests, fetchVehicleRequests } = useContext(
    VehicleRequestsContext
  );
  const { venueRequests, fetchVenueRequests } =
    useContext(VenueRequestsContext);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { allUserInfo, fetchUsers, deleteUser, updateUser } =
    useContext(UserContext);

  const allRequests = [
    ...Object.values(jobRequests),
    ...Object.values(purchasingRequests),
    ...Object.values(vehicleRequests),
    ...Object.values(venueRequests),
  ];

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingField, setEditingField] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = (Array.isArray(allUserInfo) ? allUserInfo : []).filter(
    (user) => {
      const rowString = Object.entries(user)
        .map(([_, value]) => value)
        .join(" ")
        .toLowerCase();
      return rowString.includes(searchQuery.toLowerCase());
    }
  );

  // useEffect(()=>{
  //   console.log(filteredUsers)
  // },[ ])

  useEffect(() => {
    fetchUsers();
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  }, []);

  const handleUpdateDepartment = async (userId, newDeptId) => {
    try {
      await updateUser(userId, { department_id: newDeptId }); // you should have this from context or services
      fetchUsers(); // re-fetch updated list
      setEditingUserId(null);
      setEditingField(null);
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const columns = getUserColumnConfig({
    setIsSidebarOpen,
    setSelectedUser,
    allRequests,
    editingUserId,
    editingField,
    setEditingUserId,
    setEditingField,
    handleUpdateDepartment,
  });

  // Add User
  const [emailToAdd, setEmailToAdd] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const debouncedEmail = useDebounce(emailToAdd, 1000);

  const handleAddUser = async () => {
    if (!debouncedEmail.includes("@")) {
      setErrorMessage("Should be an email address.");
      return;
    }

    const isDyciEmail = debouncedEmail.endsWith("@dyci.edu.ph");
    if (!isDyciEmail) {
      setErrorMessage("Only @dyci.edu.ph email addresses are allowed.");
      return;
    }

    const isEmailExisting = allUserInfo.some(
      (user) => user.email === debouncedEmail
    );
    if (isEmailExisting) {
      setErrorMessage("Email already exists.");
      return;
    }

    ToastNotification.info(
      "Invitation sent!",
      "An invitation email has been sent."
    );

    await emailjs.send(
      "service_0ade2nt",
      "template_5h3xl4w",
      {
        email: debouncedEmail,
      },
      "AqvGApoJck9-0A7Qi"
    );
    setEmailToAdd("");
    setMenuOpen(false);
    setErrorMessage("");
  };

  useEffect(() => {
    if (!debouncedEmail) {
      setErrorMessage("");
      return;
    }

    if (!debouncedEmail.includes("@")) {
      setErrorMessage("Should be an email address.");
    } else if (!debouncedEmail.endsWith("@dyci.edu.ph")) {
      setErrorMessage("Only @dyci.edu.ph email addresses are allowed.");
    } else {
      setErrorMessage(""); // valid email
    }
  }, [debouncedEmail]);

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-1"
      >
        <Header
          title={"Directory"}
          description={"Manage user records, roles, and access"}
        />
        <div className="flex items-center justify-between px-3 gap-4 mt-4">
          <div className="flex items-center justify-end px-3 gap-4">
            <div className="relative w-full max-w-sm min-w-[200px]">
              <input
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Search users"
                value={searchQuery}
                onChange={handleSearch}
              />
              <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
                <MagnifyingGlass size={16} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end px-3 gap-4">
            <Menu dismiss={{ itemPress: false }} placement="bottom-end">
              <MenuHandler>
                <Button
                  className="flex items-center gap-2 bg-blue-500"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <Plus strokeWidth={2} className="h-4 w-4" />
                  Invite User
                </Button>
              </MenuHandler>
              <MenuList className="p-4 w-80">
                <Typography variant="h6" className="mb-1 text-black">
                  Invite User
                </Typography>
                <Typography variant="small" color="gray" className="mb-3">
                  User will receive an invitation email if they haven’t already
                  been added to Service Link.
                </Typography>
                <input
                  type="email"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  className="w-full mb-2 border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Email Address (@dyci.edu.ph)"
                />
                {errorMessage && (
                  <Typography
                    color="red"
                    className="px-2 text-xs font-semibold mb-2"
                  >
                    {errorMessage}
                  </Typography>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    color="blue"
                    size="sm"
                    onClick={handleAddUser}
                    disabled={!emailToAdd.trim()}
                    style={{ border: "none" }}
                  >
                    Confirm
                  </Button>
                </div>
              </MenuList>
            </Menu>
          </div>
        </div>
      </CardHeader>

      <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex justify-between">
        <div
          className={`h-full bg-white w-full mt-0 px-3 flex justify-between transition-[max-width] duration-300 ${
            isSidebarOpen ? "max-w-[55%]" : "w-full"
          }`}
        >
          <div
            className={`flex flex-col gap-4 h-full ${
              isSidebarOpen ? "max-w-[100%]" : "w-full"
            }`}
          >
            <CardBody className="custom-scrollbar h-full pt-0">
              <table className="w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 z-10 border-b border-blue-gray-100">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className="cursor-pointer bg-white p-4 transition-colors hover:bg-blue-gray-50"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-5 w-fit font-normal"
                          >
                            {col.render
                              ? col.render(
                                  row,
                                  setIsSidebarOpen,
                                  setSelectedUser
                                )
                              : row[col.key] || "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-4">
                        <Typography variant="small" color="gray">
                          No users found.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </div>
        </div>

        {/* <UserSidebar
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          userId={selectedUser}
          users={users}
          fetchUsers={fetchUsers}
          deleteUser={deleteUser}
        /> */}
      </div>
    </div>
  );
};

export default UserManagement;
