import { Typography, Chip } from "@material-tailwind/react";

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

const normalText = "text-center font-semibold rounded-full flex items-center justify-center";

export const getTicketColumnConfig = ({ setIsSidebarOpen, setSelectedTicket }) => [
  {
    key: "id",
    label: "ID",
    header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
    render: (row) => (
      <div className="flex justify-center">
        <Chip
          size="sm"
          variant="ghost"
          color="red"
          className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5"
          value={row.id}
        />
      </div>
    ),
  },
  {
    key: "ticket_id",
    label: "Ticket ID",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Ticket ID</Typography>,
    render: (row) => (
      <Typography
        variant="small"
        color="blue-gray"
        className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
        onClick={() => {
          setIsSidebarOpen(true);
          setSelectedTicket(row.ticket_id);
        }}
      >
        {row.ticket_id}
      </Typography>
    ),
  },
  {
    key: "reference_number",
    label: "Reference Number",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Reference Number</Typography>,
    render: (row) => (
      <Typography
        variant="small"
        color="blue-gray"
        className="flex items-center gap-2 cursor-pointer hover:underline font-semibold"
      >
        {row.reference_number}
      </Typography>
    ),
  },
  {
    key: "title",
    label: "Title",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Title</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.title}</Typography>,
  },
  {
    key: "category",
    label: "Category",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Category</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.category}</Typography>,
  },
  {
    key: "priority",
    label: "Priority",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Priority</Typography>,
    render: (row) => (
      <Chip
        size="sm"
        color={
          row.priority === "High"
            ? "red"
            : row.priority === "Medium"
            ? "yellow"
            : "green"
        }
        value={row.priority}
        className={normalText}
      />
    ),
  },
  {
    key: "status",
    label: "Status",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
    render: (row) => (
      <Chip
        size="sm"
        color={
          row.status === "Open"
            ? "blue"
            : row.status === "In Progress"
            ? "yellow"
            : "green"
        }
        value={row.status}
        className={normalText}
      />
    ),
  },
  {
    key: "assigned_to",
    label: "Assigned To",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Assigned To</Typography>,
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.assigned_to || "Unassigned"}
      </Typography>
    ),
  },
  {
    key: "resolution_deadline",
    label: "Deadline",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Deadline</Typography>,
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.resolution_deadline)}
      </Typography>
    ),
  },
  {
    key: "created_at",
    label: "Created At",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Created At</Typography>,
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.created_at)}
      </Typography>
    ),
  },
  {
    key: "updated_at",
    label: "Updated At",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Updated At</Typography>,
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.updated_at)}
      </Typography>
    ),
  },
];

export default getTicketColumnConfig;
