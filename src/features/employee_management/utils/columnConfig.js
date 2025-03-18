import { Typography, Chip } from "@material-tailwind/react";

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

const normalText = "text-center font-semibold rounded-full flex items-center justify-center";

export const getColumnConfig = ({ setIsSidebarOpen, setSelectedEmployee }) => [
  {
    key: "employee_id",
    label: "Employee ID",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Employee ID</Typography>,
    render: (row) => (
      <div className="flex justify-center">
        <Chip size="sm" variant="ghost" color="red" className="text-center font-bold rounded-full w-4 h-4 flex items-center justify-center p-5" value={row.employee_id} />
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
          setSelectedEmployee(row.reference_number);
        }}
      >
        {row.reference_number}
      </Typography>
    ),
  },
  {
    key: "first_name",
    label: "First Name",
    header: <Typography variant="small" color="blue-gray" className={normalText}>First Name</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.first_name}</Typography>,
  },
  {
    key: "last_name",
    label: "Last Name",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Last Name</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.last_name}</Typography>,
  },
  {
    key: "email",
    label: "Email",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Email</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.email}</Typography>,
  },
  {
    key: "position",
    label: "Position",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Position</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.position}</Typography>,
  },
  {
    key: "department",
    label: "Department",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Department</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.department}</Typography>,
  },
  {
    key: "expertise",
    label: "Expertise",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Expertise</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.expertise}</Typography>,
  },
  {
    key: "employment_status",
    label: "Employment Status",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Employment Status</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.employment_status}</Typography>,
  },
  {
    key: "hire_date",
    label: "Hire Date",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Hire Date</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{formatDate(row.hire_date)}</Typography>,
  },
  {
    key: "contact_number",
    label: "Contact Number",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Contact Number</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.contact_number}</Typography>,
  },
  {
    key: "address",
    label: "Address",
    header: <Typography variant="small" color="blue-gray" className={normalText}>Address</Typography>,
    render: (row) => <Typography variant="small" color="blue-gray" className={normalText}>{row.address}</Typography>,
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
