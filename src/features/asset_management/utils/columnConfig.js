import { Typography, Chip } from "@material-tailwind/react";
// import StatusModal from "../components/StatusModal";

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

const normalText = "text-center font-semibold rounded-full flex items-center justify-center";

export const getColumnConfig = ({ setIsSidebarOpen, setSelectedAsset }) => [
  {
    key: "asset_id",
    label: "ID",
    header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
    render: (row) => (
      <div className="flex justify-center">
        <Chip size="sm" variant="ghost" color="red" className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5" value={row.asset_id} />
      </div>
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
    header: <Typography variant="small" color="blue-gray" className={normalText}>Name</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.name}</Typography>,
  },
  {
    key: "asset_type",
    label: "Asset Type",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Asset Type</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.asset_type}</Typography>,
  },
  {
    key: "location",
    label: "Location",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Location</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.location}</Typography>,
  },
  {
    key: "capacity",
    label: "Capacity",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Capacity</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.capacity}</Typography>,
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Manufacturer</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.manufacturer}</Typography>,
  },
  {
    key: "model",
    label: "Model",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Model</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.model}</Typography>,
  },
  {
    key: "serial_number",
    label: "Serial Number",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Serial Number</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.serial_number}</Typography>,
  },
  {
    key: "purchase_date",
    label: "Purchase Date",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Purchase Date</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.purchase_date)}</Typography>,
  },
  {
    key: "purchase_cost",
    label: "Purchase Cost",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Purchase Cost</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>₱ {row.purchase_cost}</Typography>,
  },
  {
    key: "status",
    label: "Status",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
    // render: (row) => <StatusModal input={row.status} referenceNumber={row.reference_number} requestType={requestType} />,
  },
  {
    key: "last_maintenance",
    label: "Last Maintenance",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Last Maintenance</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.last_maintenance)}</Typography>,
  },
  {
    key: "warranty_expiry",
    label: "Warranty Expiry",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Warranty Expiry</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.warranty_expiry)}</Typography>,
  },
  {
    key: "type_specific_1",
    label: "Type Specific 1",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Type Specific 1</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.type_specific_1}</Typography>,
  },
  {
    key: "type_specific_2",
    label: "Type Specific 2",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Type Specific 2</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.type_specific_2}</Typography>,
  },
  {
    key: "type_specific_3",
    label: "Type Specific 3",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Type Specific 3</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.type_specific_3}</Typography>,
  },
  {
    key: "created_at",
    label: "Created At",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Created At</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.created_at)}</Typography>,
  },
  {
    key: "updated_at",
    label: "Updated At",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Updated At</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.updated_at)}</Typography>,
  },
];


