import { CardHeader } from "@material-tailwind/react";
import Header from "../../../layouts/header";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";
import Department from "./Department";
import Priority from "./Priority";
import Status from "./Status";
import Organization from "./Organizations";
import Approver from "./Approvers";

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex flex-col h-fit bg-white">
      {/* Header */}
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit sticky top-0 z-10 pt-2"
      >
        <Header title={"Settings"} description={"Manage system settings"} />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3">
          <div className="flex items-center justify-end relative w-full  min-w-[200px]">
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

      {/* Settings Content */}

      {/* Status */}
      <div className="flex flex-col gap-4 p-4">
        <Status />
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-4 p-4">
        <Priority />
      </div>

      {/* Department */}
      <div className="flex flex-col gap-4 p-4">
        <Department />
      </div>

      {/* Organization */}
      <div className="flex flex-col gap-4 p-4">
        <Organization />
      </div>

      {/* Approvers */}
      <div className="flex flex-col gap-4 p-4">
        <Approver />
      </div>
    </div>
  );
};

export default Settings;
