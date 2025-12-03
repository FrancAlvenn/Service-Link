import { CardHeader, Typography, Accordion, AccordionHeader, AccordionBody, List, ListItem, Card } from "@material-tailwind/react";
import Header from "../../../layouts/header";
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import { useContext, useEffect, useMemo } from "react";
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
import useLocalStorage from "../../../utils/useLocalStorage";
import { AnimatePresence, motion } from "framer-motion";

const Settings = () => {
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

  const [selectedKey, setSelectedKey] = useLocalStorage("settings.selectedKey", "workflow.requestType");
  const [openGroup, setOpenGroup] = useLocalStorage("settings.openGroup", "workflow");

  const menu = useMemo(
    () => [
      {
        key: "workflow",
        label: "Workflow Settings",
        items: [
          { key: "workflow.requestType", label: "Approval by Request Type" },
          { key: "workflow.designationRule", label: "Approval by Designation" },
          { key: "workflow.departmentRule", label: "Approval by Department" },
          { key: "workflow.approvers", label: "Approvers" },
        ],
      },
      {
        key: "organizational",
        label: "Organizational Settings",
        items: [
          { key: "organizational.department", label: "Departments" },
          { key: "organizational.organization", label: "Organizations" },
          { key: "organizational.position", label: "Positions" },
          { key: "organizational.designation", label: "Designations" },
        ],
      },
      {
        key: "status",
        label: "Status Settings",
        items: [
          { key: "status.status", label: "Statuses" },
          { key: "status.priority", label: "Priorities" },
        ],
      },
      // {
      //   key: "preferences",
      //   label: "User Preferences",
      //   items: [
      //     { key: "preferences.user", label: "Preferences" },
      //   ],
      // },
    ],
    []
  );

  useEffect(() => {
    const group = selectedKey.split(".")[0];
    setOpenGroup(group);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    switch (selectedKey) {
      case "workflow.requestType":
        return <ApprovalRuleByRequestType />;
      case "workflow.designationRule":
        return <ApprovalRuleByDesignation />;
      case "workflow.departmentRule":
        return <ApprovalRuleByDepartment />;
      case "workflow.approvers":
        return <Approver />;
      case "organizational.department":
        return <Department />;
      case "organizational.organization":
        return <Organization />;
      case "organizational.position":
        return <Position />;
      case "organizational.designation":
        return <Designation />;
      case "status.status":
        return <Status />;
      case "status.priority":
        return <Priority />;
      case "preferences.user":
        return <UserPreference />;
      default:
        return <ApprovalRuleByRequestType />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <CardHeader
        floated={false}
        shadow={false}
        className="min-h-fit sticky top-0 z-50 pt-2"
      >
        <Header title={"Settings"} description={"Manage system settings"} />
        <div className="flex items-center justify-between gap-4 p-3"></div>
      </CardHeader>

      <div className="flex flex-col h-full md:flex-row gap-4 p-4 w-full">
        <Card className="md:w-64 w-full shadow-none border border-gray-200">
          <div className="p-4">
            <Typography variant="h6" className="text-sm font-bold text-gray-800">Settings</Typography>
          </div>
          <div className="px-2">
            {menu.map((group) => (
              <Accordion
                key={group.key}
                open={openGroup === group.key}
                className={`rounded-lg ${openGroup === group.key ? "bg-gray-100" : ""}`}
                icon={
                  <CaretDown
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${openGroup === group.key ? "rotate-180" : ""}`}
                  />
                }
              >
                <AccordionHeader
                  onClick={() => setOpenGroup(openGroup === group.key ? "" : group.key)}
                  className="border-b-0 p-3"
                >
                  <Typography className="mr-auto font-normal text-sm">{group.label}</Typography>
                </AccordionHeader>
                <AccordionBody className="py-1">
                  <List className="p-0">
                    {group.items.map((item) => {
                      const selected = selectedKey === item.key;
                      return (
                        <ListItem
                          key={item.key}
                          className={`text-sm ${selected ? "bg-blue-50 text-blue-700" : ""}`}
                          selected={selected}
                          onClick={() => setSelectedKey(item.key)}
                          aria-selected={selected}
                        >
                          {item.label}
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionBody>
              </Accordion>
            ))}
          </div>
        </Card>

        <div className="flex-1 w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedKey}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
