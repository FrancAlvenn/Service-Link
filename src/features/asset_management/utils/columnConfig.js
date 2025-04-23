import { Typography, Chip } from "@material-tailwind/react";
// import StatusModal from "../components/StatusModal";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

const normalText =
  "text-center font-semibold rounded-full flex items-center justify-center";

export const getColumnConfig = ({ setIsSidebarOpen, setSelectedAsset }) => [
  {
    key: "asset_id",
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
          color="red"
          className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5"
          value={row.asset_id}
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
        className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline font-semibold"
        onClick={() => {
          setIsSidebarOpen(true);
          setSelectedAsset(row.reference_number);
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
    key: "asset_type",
    label: "Asset Type",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Asset Type
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.asset_type}
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
        {row.location}
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
    // render: (row) => <StatusModal input={row.status} referenceNumber={row.reference_number} requestType={requestType} />,
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
  {
    key: "created_at",
    label: "Created At",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Created At
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.created_at)}
      </Typography>
    ),
  },
  {
    key: "updated_at",
    label: "Updated At",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Updated At
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.updated_at)}
      </Typography>
    ),
  },
];
