import React from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Menu,
  MenuHandler,
  Button,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";

import {
  Stack,
  ClipboardText,
  ChalkboardSimple,
  ChatCircle,
  ChartBar,
  CaretDown,
  Archive,
  ChalkboardTeacher,
  UserPlus,
  PlusCircle,
  Gear,
  Notebook,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

function RequestsManagementControls() {
  const [open, setOpen] = React.useState(0);

  const navigate = useNavigate();

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  return (
    <div>
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Request Management
      </Typography>
      <Accordion
        open={open === 2}
        className={`rounded-lg ${open === 2 ? "bg-gray-100" : ""}`}
        icon={
          <CaretDown
            strokeWidth={2.5}
            className={`mx-auto h-4 w-4 transition-transform ${
              open === 2 ? "rotate-180" : ""
            }`}
          />
        }
      >
        <ListItem className="p-0" selected={open === 2}>
          <AccordionHeader
            onClick={() => handleOpen(2)}
            className="border-b-0 p-3"
          >
            <ListItemPrefix>
              <Stack size={20} color="black" />
            </ListItemPrefix>
            <Typography color="black" className="mr-auto font-normal text-sm">
              Queues
            </Typography>
          </AccordionHeader>
        </ListItem>
        <AccordionBody className="py-1">
          <List className="p-0">
            <ListItem
              className="text-xs"
              onClick={() =>
                navigate("/workspace/requests-management/queues/job-requests")
              }
            >
              Job Requests
            </ListItem>
            <ListItem
              className="text-xs"
              onClick={() =>
                navigate(
                  "/workspace/requests-management/queues/purchasing-requests"
                )
              }
            >
              Purchasing Requests
            </ListItem>
            <ListItem
              className="text-xs"
              onClick={() =>
                navigate(
                  "/workspace/requests-management/queues/vehicle-requests"
                )
              }
            >
              Vehicle Requests
            </ListItem>
            <ListItem
              className="text-xs"
              onClick={() =>
                navigate("/workspace/requests-management/queues/venue-requests")
              }
            >
              Venue Requests
            </ListItem>
          </List>
        </AccordionBody>
      </Accordion>

      <Accordion
        open={open === 3}
        className={`rounded-lg ${open === 3 ? "bg-gray-100" : ""}`}
        icon={
          <CaretDown
            strokeWidth={2.5}
            className={`mx-auto h-4 w-4 transition-transform ${
              open === 2 ? "rotate-180" : ""
            }`}
          />
        }
      >
        <ListItem className="p-0" selected={open === 2}>
          <AccordionHeader
            onClick={() => handleOpen(3)}
            className="border-b-0 p-3"
          >
            <ListItemPrefix>
              <ChalkboardSimple size={20} color="black" />
            </ListItemPrefix>
            <Typography color="black" className="mr-auto font-normal text-sm">
              Views
            </Typography>
            <ListItemSuffix>
              {/* <Chip
                value=""
                size="sm"
                variant="ghost"
                color="black"
                className="rounded-full"
              /> */}
            </ListItemSuffix>
          </AccordionHeader>
        </ListItem>
        <AccordionBody className="py-1">
          <List className="p-0">
            <ListItem
              className="text-xs"
              onClick={() =>
                navigate("/workspace/requests-management/views/kanban-board")
              }
            >
              Kanban Board
            </ListItem>
            <ListItem
              className="text-xs"
              onClick={() =>
                navigate("/workspace/requests-management/views/calendar")
              }
            >
              Calendar
            </ListItem>
          </List>
        </AccordionBody>
      </Accordion>

      <ListItem className="text-sm">
        <ListItemPrefix>
          <ChatCircle size={20} />
        </ListItemPrefix>
        <Typography
          color="black"
          className="mr-auto font-normal text-sm"
          onClick={() =>
            navigate("/workspace/requests-management/raise-request")
          }
        >
          Raise a Request
        </Typography>
      </ListItem>

      <ListItem className="text-sm">
        <ListItemPrefix>
          <Archive size={20} />
        </ListItemPrefix>
        <Typography
          color="black"
          className="mr-auto font-normal text-sm"
          onClick={() =>
            navigate("/workspace/requests-management/archived-request")
          }
        >
          Archived Requests
        </Typography>
      </ListItem>

      <ListItem className="text-sm">
        <ListItemPrefix>
          <ChartBar size={20} />
        </ListItemPrefix>
        <Typography
          color="black"
          className="mr-auto font-normal text-sm"
          onClick={() => navigate("/workspace/requests-management/reports")}
        >
          Reporting Dashboard
        </Typography>
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        In-house Management
      </Typography>

      <ListItem
        className="text-sm"
        onClick={() => navigate("/workspace/employee-management/board")}
      >
        <ListItemPrefix>
          <ChalkboardTeacher size={20} />
        </ListItemPrefix>
        Board
      </ListItem>

      <ListItem
        className="text-sm"
        onClick={() => navigate("/workspace/employee-management/add-employee")}
      >
        <ListItemPrefix>
          <UserPlus size={20} />
        </ListItemPrefix>
        Add Employee
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Asset Management
      </Typography>

      <ListItem
        className="text-sm"
        onClick={() => navigate("/workspace/asset-management/board")}
      >
        <ListItemPrefix>
          <ChalkboardTeacher size={20} />
        </ListItemPrefix>
        Board
      </ListItem>

      <ListItem
        className="text-sm"
        onClick={() =>
          navigate("/workspace/asset-management/asset-tracking-log")
        }
      >
        <ListItemPrefix>
          <Notebook size={20} />
        </ListItemPrefix>
        Asset Tracking Log
      </ListItem>

      <ListItem
        className="text-sm"
        onClick={() => navigate("/workspace/asset-management/create-asset")}
      >
        <ListItemPrefix>
          <PlusCircle size={20} />
        </ListItemPrefix>
        Add Asset
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Settings
      </Typography>

      <ListItem
        className="text-sm"
        onClick={() => navigate("/workspace/settings")}
      >
        <ListItemPrefix>
          <Gear size={20} />
        </ListItemPrefix>
        Settings
      </ListItem>
    </div>
  );
}

export default RequestsManagementControls;
