import {
  CardHeader,
  Typography,
  Button,
  CardBody,
  Spinner,
} from "@material-tailwind/react";
import { ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { getColumnConfig } from "../utils/columnConfig.js";
import { EmployeeContext } from "../context/EmployeeContext.js";
import EmployeeSidebar from "./EmployeeSidebar.jsx";
import Header from "../../../layouts/header.js";

const EmployeeTable = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { employees, fetchEmployees, deleteEmployee } =
    useContext(EmployeeContext);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter employees based on search query
  const filteredRows = (Array.isArray(employees) ? employees : []).filter(
    (row) => {
      const rowString = Object.entries(row)
        .filter(([key]) => key !== "details")
        .map(([_, value]) => value)
        .join(" ")
        .toLowerCase();
      return rowString.includes(searchQuery.toLowerCase());
    }
  );

  const columns = getColumnConfig({ setIsSidebarOpen, setSelectedEmployee });

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-6"
      >
        <Header
          title={"In-house   Management"}
          description={"View and manage available in-house employee"}
        />
        <div className="flex items-center justify-end px-3 gap-4">
          <div className="relative w-full max-w-sm min-w-[200px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span>
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
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none opacity-70 capitalize font-semibold"
                        >
                          {col.header}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row, rowIndex) => (
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
                                  setSelectedEmployee
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
                          No employees available.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </div>
        </div>

        <EmployeeSidebar
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          referenceNumber={selectedEmployee}
          employees={employees}
          fetchEmployees={fetchEmployees}
          deleteEmployee={deleteEmployee}
        />
      </div>
    </div>
  );
};

export default EmployeeTable;
