import { CardHeader, Typography } from "@material-tailwind/react";
import Header from "../../../layouts/header";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import Department from "./Department";
import Priority from "./Priority";
import Status from "./Status";
import Organization from "./Organizations";
import Approver from "./Approvers";
import Position from "./Position";
import UserPreference from "./UserPreference";
import ApprovalRuleByDepartment from "./ApprovalRuleByDepartment";
import ManualApprovalRule from "./ManualApprovalRule";
import ApprovalRuleByRequestType from "./ApprovalRuleByRequestType";
import ApprovalRuleByDesignation from "./ApprovalRuleByDesignation";
import Designation from "./Designation";
import assignApproversToRequest from "../../request_management/utils/assignApproversToRequest";
import { SettingsContext } from "../context/SettingsContext";

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const {
    approvers,
    approvalRulesByDepartment,
    approvalRulesByRequestType,
    approvalRulesByDesignation,
    positions,
    department,
    position,
    designation,
  } = useContext(SettingsContext);

  return (
    <div className="flex flex-col h-fit bg-white">
      {/* Header */}
      <CardHeader
        floated={false}
        shadow={false}
        className="min-h-fit sticky top-0 z-50 pt-2"
      >
        <Header title={"Settings"} description={"Manage system settings"} />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3">
          <div className="flex items-center justify-end relative w-full  min-w-[200px]">
            {/* <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span> */}
          </div>
        </div>
      </CardHeader>

      {/* Settings Content */}

      <div className="flex flex-col justify-center gap-8 p-4 w-full max-w-[calc(100%-100px)]">
        {/* Workflow Settings */}
        <div className="flex items-center justify-center w-full">
          <div className="w-[calc(100%-100px)] pb-8 border-b-[2px] border-blue-500 ">
            <Typography
              variant="h5"
              className="mb-4 text-lg font-bold text-blue-500 pl-4"
            >
              Workflow Settings
            </Typography>
            <button
              onClick={() =>
                assignApproversToRequest({
                  approvers,
                  approvalRulesByDepartment,
                  approvalRulesByDesignation,
                  approvalRulesByRequestType,
                  positions,
                  department,
                  position,
                  designation,
                })
              }
            >
              Click Me
            </button>
            <div className="flex flex-col gap-4">
              <ApprovalRuleByRequestType />
              <ApprovalRuleByDesignation />
              <ApprovalRuleByDepartment />
              {/* <ManualApprovalRule /> */}
              <Approver />
            </div>
          </div>
        </div>

        {/* Organizational Settings */}
        <div className="flex items-center justify-center w-full">
          <div className="w-[calc(100%-100px)] pb-8 border-b-[2px] border-blue-500">
            <Typography
              variant="h5"
              className="mb-4 text-lg font-bold text-blue-500 pl-4"
            >
              Organizational Settings
            </Typography>
            <div className="flex flex-col gap-4">
              <Department />
              <Organization />
              <Position />
              <Designation />
            </div>
          </div>
        </div>

        {/* Status Settings */}
        <div className="flex items-center justify-center w-full">
          <div className="w-[calc(100%-100px)] pb-8 border-b-[2px] border-blue-500">
            <Typography
              variant="h5"
              className="mb-4 text-lg font-bold text-blue-500 pl-4"
            >
              Status Settings
            </Typography>
            <div className="flex flex-col gap-4">
              <Status />
              <Priority />
            </div>
          </div>
        </div>

        {/* User Preferences (if shown to admin or self) */}
        {/* <div>
            <Typography variant="h5" className="mb-4">User Preferences</Typography>
            <UserPreference />
          </div>
        */}
      </div>
    </div>
  );
};

export default Settings;
