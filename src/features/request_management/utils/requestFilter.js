import { useContext, useEffect, useState } from "react";
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
import { SettingsContext } from "../../settings/context/SettingsContext";

export default function RequestFilter({ filters, onFilterChange }) {
  const [status, setStatus] = useState(filters.status);
  const [department, setDepartment] = useState(filters.department);
  const [priority, setPriority] = useState(filters.priority || "");
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");

  const {
    statuses,
    departments,
    priorities,
    fetchDepartments,
    fetchPriorities,
    fetchStatuses,
  } = useContext(SettingsContext);

  useEffect(() => {
    fetchDepartments();
    fetchPriorities();
    fetchStatuses();
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
    <div className="flex flex-wrap gap-3 w-full max-w-[100vw] sm:max-w-[50vw] ">
      {/* Status Filter */}
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            value={status || "Filter Status"}
            variant={status ? "filled" : "ghost"}
            color={
              status
                ? statuses.find((s) => s.status === status)?.color || "gray"
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
          {statuses.map((s) => (
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
        <MenuList className="mt-2 p-2 max-h-[50vh] overflow-y-auto gap-2 flex flex-col">
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
          {departments.map((d) => (
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
            color={
              priority
                ? priorities.find((p) => p.priority === priority)?.color ||
                  "gray"
                : "gray"
            }
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
            className="cursor-pointer w-fit"
          />
          {priorities.map((p) => (
            <Chip
              key={p.id}
              value={p.priority}
              onClick={() => handleFilterChange("priority", p.priority)}
              variant={priority === p.priority ? "filled" : "ghost"}
              color={priority === p.priority ? p.color : "gray"}
              className="cursor-pointer w-fit"
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
