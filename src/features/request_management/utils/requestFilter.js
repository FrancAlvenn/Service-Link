import { useEffect, useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Chip,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FunnelSimple } from "@phosphor-icons/react";
import axios from "axios";

export default function RequestFilter({ filters, onFilterChange }) {
  const [status, setStatus] = useState(filters.status);
  const [department, setDepartment] = useState(filters.department);
  const [statusOptions, setStatusOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    const getStatus = async () => {
      try {
        const res = await axios.get("/settings/status", {
          withCredentials: true,
        });
        if (Array.isArray(res.data.status)) {
          setStatusOptions(res.data.status);
        } else {
          console.error("Invalid response: 'status' is not an array");
        }
      } catch (err) {
        console.error("Error fetching status options:", err);
      }
    };

    const getDepartments = async () => {
      try {
        const res = await axios.get("/settings/department", {
          withCredentials: true,
        });
        if (Array.isArray(res.data.departments)) {
          setDepartmentOptions(res.data.departments);
        } else {
          console.error("Invalid response: 'departments' is not an array");
        }
      } catch (err) {
        console.error("Error fetching department options:", err);
      }
    };

    getStatus();
    getDepartments();
  }, []);

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    onFilterChange(updatedFilters);
    if (key === "status") setStatus(value);
    if (key === "department") setDepartment(value);
  };

  const handleReset = () => {
    setStatus("");
    setDepartment("");
    onFilterChange({ status: "", department: "" });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 w-full">
      {/* Status Filter Menu */}
      <div className="w-full sm:w-auto">
        <Menu placement="bottom-start">
          <MenuHandler>
            <Chip
              value={status || "Filter Status"}
              onClick={() => handleFilterChange("status", "")}
              variant={status ? "filled" : "ghost"}
              color={
                status
                  ? statusOptions.find((s) => s.status === status)?.color ||
                    "gray"
                  : "gray"
              }
              className="cursor-pointer w-full sm:w-fit"
              icon={<FunnelSimple size={16} />}
            />
          </MenuHandler>
          <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none max-h-[50vh] overflow-y-auto">
            <div className="p-2">
              <Typography variant="small" className="mb-2 font-semibold">
                Status
              </Typography>
              <div className="flex flex-col gap-2">
                <Chip
                  value="All"
                  onClick={() => handleFilterChange("status", "")}
                  variant={status === "" ? "filled" : "ghost"}
                  color={status === "" ? "blue" : "gray"}
                  className="cursor-pointer w-fit"
                />
                {statusOptions.map((s) => (
                  <Chip
                    key={s.id}
                    value={s.status}
                    onClick={() => handleFilterChange("status", s.status)}
                    variant={status === s.status ? "filled" : "ghost"}
                    color={status === s.status ? s.color : "gray"}
                    className="cursor-pointer w-fit"
                  />
                ))}
              </div>
            </div>
          </MenuList>
        </Menu>
      </div>

      {/* Department Filter Menu */}
      <div className="w-full sm:w-auto">
        <Menu placement="bottom-start">
          <MenuHandler>
            <Chip
              value={department || "Filter Department"}
              onClick={() => handleFilterChange("department", "")}
              variant={department ? "filled" : "ghost"}
              color={department ? "blue" : "gray"}
              className="cursor-pointer w-full sm:w-fit"
              icon={<FunnelSimple size={16} />}
            />
          </MenuHandler>
          <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none max-h-[50vh] overflow-y-auto">
            <div className="p-2">
              <Typography variant="small" className="mb-2 font-semibold">
                Department
              </Typography>
              <div className="flex flex-col gap-2">
                <Chip
                  value="All"
                  onClick={() => handleFilterChange("department", "")}
                  variant={department === "" ? "filled" : "ghost"}
                  color={department === "" ? "blue" : "gray"}
                  className="cursor-pointer w-fit"
                />
                {departmentOptions.map((d) => (
                  <Chip
                    key={d.id}
                    value={d.name}
                    onClick={() => handleFilterChange("department", d.name)}
                    variant={department === d.name ? "filled" : "ghost"}
                    color={department === d.name ? "blue" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                ))}
              </div>
            </div>
          </MenuList>
        </Menu>
      </div>

      {/* Reset Button */}
      <div className="w-full sm:w-auto flex justify-end">
        <Button
          size="sm"
          variant="outlined"
          color="red"
          onClick={handleReset}
          className="w-full sm:w-fit"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
