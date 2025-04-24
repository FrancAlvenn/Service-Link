import { useEffect, useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  Chip,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FunnelSimple } from "@phosphor-icons/react";
import axios from "axios";

export default function RequestFilter({ filters, onFilterChange }) {
  const [status, setStatus] = useState(filters.status);
  const [department, setDepartment] = useState(filters.department);
  const [priority, setPriority] = useState(filters.priority || "");
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");

  const [statusOptions, setStatusOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const priorityOptions = ["Low", "Medium", "High"];

  const priorityBgClass = {
    Low: "blue",
    Medium: "orange",
    High: "red",
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const res = await axios.get("/settings/status", {
          withCredentials: true,
        });
        if (Array.isArray(res.data.status)) setStatusOptions(res.data.status);
        else console.error("Invalid response: 'status' is not an array");
      } catch (err) {
        console.error("Error fetching status options:", err);
      }
    };

    const getDepartments = async () => {
      try {
        const res = await axios.get("/settings/department", {
          withCredentials: true,
        });
        if (Array.isArray(res.data.departments))
          setDepartmentOptions(res.data.departments);
        else console.error("Invalid response: 'departments' is not an array");
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
    if (key === "priority") setPriority(value);
    if (key === "dateFrom") setDateFrom(value);
    if (key === "dateTo") setDateTo(value);
  };

  const handleReset = () => {
    setStatus("");
    setDepartment("");
    setPriority("");
    setDateFrom("");
    setDateTo("");
    onFilterChange({
      status: "",
      department: "",
      priority: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="flex flex-wrap gap-3 w-full max-w-[100vw] sm:max-w-[40vw] ">
      {/* Status Filter */}
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            value={status || "Filter Status"}
            variant={status ? "filled" : "ghost"}
            color={
              status
                ? statusOptions.find((s) => s.status === status)?.color ||
                  "gray"
                : "gray"
            }
            className="cursor-pointer w-fit"
            icon={<FunnelSimple size={16} />}
          />
        </MenuHandler>
        <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto gap-2 flex flex-col">
          <Typography variant="small" className="mb-2 font-semibold">
            Status
          </Typography>
          <Chip
            value="All"
            onClick={() => handleFilterChange("status", "")}
            variant={status === "" ? "filled" : "ghost"}
            color="blue"
            className="cursor-pointer  w-fit"
          />
          {statusOptions.map((s) => (
            <Chip
              key={s.id}
              value={s.status}
              onClick={() => handleFilterChange("status", s.status)}
              variant={status === s.status ? "filled" : "ghost"}
              color={status === s.status ? s.color : "gray"}
              className="cursor-pointer  w-fit"
            />
          ))}
        </MenuList>
      </Menu>

      {/* Department Filter */}
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            value={department || "Filter Department"}
            variant={department ? "filled" : "ghost"}
            color={department ? "blue" : "gray"}
            className="cursor-pointer w-fit"
            icon={<FunnelSimple size={16} />}
          />
        </MenuHandler>
        <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto p-2 gap-2 flex flex-col">
          <Typography variant="small" className="mb-2 font-semibold">
            Department
          </Typography>
          <Chip
            value="All"
            onClick={() => handleFilterChange("department", "")}
            variant={department === "" ? "filled" : "ghost"}
            color="blue"
            className="cursor-pointer  w-fit"
          />
          {departmentOptions.map((d) => (
            <Chip
              key={d.id}
              value={d.name}
              onClick={() => handleFilterChange("department", d.name)}
              variant={department === d.name ? "filled" : "ghost"}
              color={department === d.name ? "blue" : "gray"}
              className="cursor-pointer  w-fit"
            />
          ))}
        </MenuList>
      </Menu>

      {/* Priority Filter */}
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            value={priority || "Filter Priority"}
            variant={priority ? "filled" : "ghost"}
            color={priority ? priorityBgClass[priority] : "gray"}
            className="cursor-pointer w-fit"
            icon={<FunnelSimple size={16} />}
          />
        </MenuHandler>
        <MenuList className="mt-2 p-2 gap-2 flex flex-col">
          <Typography variant="small" className="mb-2 font-semibold">
            Priority
          </Typography>
          <Chip
            value="All"
            onClick={() => handleFilterChange("priority", "")}
            variant={priority === "" ? "filled" : "ghost"}
            color="green"
            className="cursor-pointer  w-fit"
          />
          {priorityOptions.map((p) => (
            <Chip
              key={p}
              value={p}
              onClick={() => handleFilterChange("priority", p)}
              variant={priority === p ? "filled" : "ghost"}
              color={priority === p ? priorityBgClass[p] : "gray"}
              className="cursor-pointer  w-fit"
            />
          ))}
        </MenuList>
      </Menu>

      {/* Reset Button */}
      <div className="w-fit">
        <Button
          size="sm"
          variant="outlined"
          color="red"
          onClick={handleReset}
          className="w-fit"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
