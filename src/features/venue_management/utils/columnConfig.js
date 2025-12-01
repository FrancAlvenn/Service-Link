import { Typography, Chip } from "@material-tailwind/react";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

const normalText =
  "text-center font-semibold rounded-full flex items-center justify-center";

export const getColumnConfig = ({ setVenueModalOpen, setSelectedVenue }) => [
  {
    key: "venue_id",
    label: "ID",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        ID
      </Typography>
    ),
    render: (row) => (
      <div className="flex justify-center">
        <Chip
          size="sm"
          variant="ghost"
          color="blue"
          className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5"
          value={row.venue_id}
        />
      </div>
    ),
  },
  {
    key: "reference_number",
    label: "Reference Number",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Reference Number
      </Typography>
    ),
    render: (row) => (
      <Typography
        variant="small"
        color="blue-gray"
        className="flex items-center justify-center text-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
        onClick={() => {
          setSelectedVenue({
            ...row,
            last_maintenance: row.last_maintenance?.split("T")[0] || "",
            next_maintenance: row.next_maintenance?.split("T")[0] || "",
          });
          setVenueModalOpen(true);
        }}
      >
        {row.reference_number}
      </Typography>
    ),
  },
  {
    key: "name",
    label: "Name",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Name
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.name}
      </Typography>
    ),
  },
  {
    key: "location",
    label: "Location",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Location
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.location || "N/A"}
      </Typography>
    ),
  },
  {
    key: "capacity",
    label: "Capacity",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Capacity
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.capacity ? `${row.capacity} people` : "N/A"}
      </Typography>
    ),
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
      const statusColors = {
        Available: "green",
        Unavailable: "red",
        "Under Maintenance": "orange",
        Archived: "gray",
      };
      return (
        <Chip
          size="sm"
          variant="ghost"
          color={statusColors[row.status] || "gray"}
          value={row.status || "N/A"}
          className="text-center font-semibold"
        />
      );
    },
  },
  {
    key: "assigned_department",
    label: "Assigned Department",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Department
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.assigned_department || "N/A"}
      </Typography>
    ),
  },
  {
    key: "last_maintenance",
    label: "Last Maintenance",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Last Maintenance
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.last_maintenance)}
      </Typography>
    ),
  },
];

