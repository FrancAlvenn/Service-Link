import { Typography, Chip } from "@material-tailwind/react";
// import StatusModal from "../components/StatusModal";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

const normalText =
  "text-center font-semibold rounded-full flex items-center justify-center";

export const getColumnConfig = ({ setAssetModalOpen, setSelectedAsset }) => [
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
          color="blue"
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
          setSelectedAsset({
            ...row,
            purchase_date: row.purchase_date?.split("T")[0] || "",
            last_maintenance: row.last_maintenance?.split("T")[0] || "",
            warranty_expiry: row.warranty_expiry?.split("T")[0] || "",
          });
          setAssetModalOpen(true);
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
    render: (row) => (
      <Chip
        size="sm"
        variant="ghost"
        color="blue"
        className="text-center font-bold flex items-center justify-center rounded-full"
        value={row.status}
      />
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
    key: "createdAt",
    label: "Created At",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Created At
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.createdAt)}
      </Typography>
    ),
  },
  {
    key: "updatedAt",
    label: "Updated At",
    header: (
      <Typography variant="small" color="blue-gray" className={normalText}>
        Updated At
      </Typography>
    ),
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.updatedAt)}
      </Typography>
    ),
  },
];

export const getAssignmentLogColumns = (
  getUserByReferenceNumber,
  setSidebarOpen,
  setSelectedReferenceNumber
) => [
  {
    key: "log_id",
    label: "Log ID",
    render: (row) => (
      <div className="flex justify-center">
        <Chip
          size="sm"
          variant="ghost"
          color="blue"
          className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5"
          value={row.log_id}
        />
      </div>
    ),
  },
  {
    key: "asset_id",
    label: "Asset ID",
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.asset_id}
      </Typography>
    ),
  },
  {
    key: "asset_name",
    label: "Asset Name",
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {row.asset_name}
      </Typography>
    ),
  },
  {
    key: "assigned_to",
    label: "Assigned To",
    render: (row) => (
      <Typography
        variant="small"
        color="blue-gray"
        className="flex items-center justify-center gap-2 text-blue-500 cursor-pointer font-semibold"
        onClick={() => {
          setSidebarOpen(true);
          setSelectedReferenceNumber(row.assigned_to);
        }}
      >
        {row.assigned_to}
      </Typography>
    ),
  },
  {
    key: "assigned_by",
    label: "Assigned By",
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {getUserByReferenceNumber(row.assigned_by)}
      </Typography>
    ),
  },
  {
    key: "assignment_date",
    label: "Assignment Date",
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.assignment_date)}
      </Typography>
    ),
  },
  {
    key: "return_date",
    label: "Return Date",
    render: (row) => (
      <Typography variant="small" color="blue-gray" className={normalText}>
        {formatDate(row.return_date)}
      </Typography>
    ),
  },
];
