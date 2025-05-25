import { Typography, Chip, Button } from "@material-tailwind/react";
import { UserCircle } from "@phosphor-icons/react";
import UserDepartmentModal from "./UserDepartmentModal";
import UserDesignationModal from "./UserDesignationModal";

const normalText =
  "text-center font-semibold rounded-full flex items-center justify-center";

export const getUserColumnConfig = ({
  setIsSidebarOpen,
  setSelectedUser,
  allRequests,
  editingUserId,
  editingField,
  setEditingUserId,
  setEditingField,
  handleUpdateDepartment,
}) => [
  {
    key: "name_email",
    label: "User",
    header: (
      <Typography
        variant="small"
        color="blue-gray"
        className="text-left font-semibold"
      >
        Name
      </Typography>
    ),
    render: (row) => (
      <div className="flex items-center gap-3">
        <UserCircle size={28} />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">
            {row.first_name} {row.last_name}
          </span>
          <span className="text-xs text-gray-600">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: "department",
    label: "Department",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Department
      </Typography>
    ),
    render: (row) => (
      <UserDepartmentModal
        currentDepartmentId={row.department_id}
        userId={row.reference_number}
      />
    ),
  },
  {
    key: "designation",
    label: "Designation",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Designation
      </Typography>
    ),
    render: (row) => (
      <UserDesignationModal
        currentDesignationId={row.designation_id}
        userId={row.reference_number}
      />
    ),
  },
  {
    key: "open_requests",
    label: "Open Requests",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Open Requests
      </Typography>
    ),
    render: (row) => {
      const openCount = allRequests.filter(
        (req) =>
          req.requester === row.reference_number &&
          req.status !== "Rejected" &&
          req.status !== "Closed"
      ).length;

      return (
        <Typography variant="small" color="blue-gray" className={normalText}>
          {openCount}
        </Typography>
      );
    },
  },
  {
    key: "closed_requests",
    label: "Closed Requests",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Closed Requests
      </Typography>
    ),
    render: (row) => {
      const closedCount = allRequests.filter(
        (req) =>
          req.requester === row.reference_number &&
          (req.status === "Rejected" || req.status === "Closed")
      ).length;

      return (
        <Typography variant="small" color="blue-gray" className={normalText}>
          {closedCount}
        </Typography>
      );
    },
  },
  {
    key: "status",
    label: "Status",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Status
      </Typography>
    ),
    render: (row) => {
      const statusColor =
        row.status === "active"
          ? "green"
          : row.status === "invited"
          ? "blue"
          : "gray";

      return (
        <Chip
          size="sm"
          variant="ghost"
          color={statusColor}
          value={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          className="mx-auto text-center"
        />
      );
    },
  },
  // {
  //   key: "action",
  //   label: "Action",
  //   header: (
  //     <Typography variant="small" color="blue-gray" className={normalText}>
  //       Action
  //     </Typography>
  //   ),
  //   render: (row) =>
  //     row.status === "invited" ? (
  //       <Button size="sm" color="blue" variant="outlined">
  //         Resend Invite
  //       </Button>
  //     ) : (
  //       <Typography variant="small" color="blue-gray" className="text-center">
  //         None
  //       </Typography>
  //     ),
  // },
];
