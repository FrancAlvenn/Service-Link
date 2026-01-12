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
} from "@material-tailwind/react";
import {
  Stack,
  ClipboardText,
  ChalkboardSimple,
  ChatCircle,
  ChartBarHorizontal,   // <-- New icon for Reports
  CaretDown,
  Archive,
  ChalkboardTeacher,
  UserPlus,
  PlusCircle,
  Gear,
  Notebook,
  UsersThree,
  Car,
  Calendar,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

function RequestsManagementControls() {
  const [open, setOpen] = React.useState(0);
  const navigate = useNavigate();

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  return (
    <div className="space-y-1">
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Request Management
      </Typography>

      {/* Queues */}
      <Accordion
        open={open === 1}
        className={`rounded-lg ${open === 1 ? "bg-gray-100" : ""}`}
        icon={
          <CaretDown
            strokeWidth={2.5}
            className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
          />
        }
      >
        <ListItem className="p-0" selected={open === 1}>
          <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
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
            <ListItem className="text-xs" onClick={() => navigate("/workspace/requests-management/queues/job-requests")}>
              Job Requests
            </ListItem>
            <ListItem className="text-xs" onClick={() => navigate("/workspace/requests-management/queues/purchasing-requests")}>
              Purchasing Requests
            </ListItem>
            <ListItem className="text-xs" onClick={() => navigate("/workspace/requests-management/queues/vehicle-requests")}>
              Vehicle Requests
            </ListItem>
            <ListItem className="text-xs" onClick={() => navigate("/workspace/requests-management/queues/venue-requests")}>
              Venue Requests
            </ListItem>
          </List>
        </AccordionBody>
      </Accordion>

      {/* Views */}
      <Accordion
        open={open === 2}
        className={`rounded-lg ${open === 2 ? "bg-gray-100" : ""}`}
        icon={
          <CaretDown
            strokeWidth={2.5}
            className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
          />
        }
      >
        <ListItem className="p-0" selected={open === 2}>
          <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-3">
            <ListItemPrefix>
              <ChalkboardSimple size={20} color="black" />
            </ListItemPrefix>
            <Typography color="black" className="mr-auto font-normal text-sm">
              Views
            </Typography>
          </AccordionHeader>
        </ListItem>
        <AccordionBody className="py-1">
          <List className="p-0">
            <ListItem className="text-xs" onClick={() => navigate("/workspace/requests-management/views/kanban-board")}>
              Kanban Board
            </ListItem>
            <ListItem className="text-xs" onClick={() => navigate("/workspace/requests-management/views/calendar")}>
              Calendar
            </ListItem>
          </List>
        </AccordionBody>
      </Accordion>

      {/* Other items */}
      {/*
      <ListItem className="text-sm">
        <ListItemPrefix>
          <ChatCircle size={20} />
        </ListItemPrefix>
        <Typography
          color="black"
          className="mr-auto font-normal text-sm"
          onClick={() => navigate("/workspace/requests-management/raise-request")}
        >
          Raise a Request
        </Typography>
      </ListItem>
      */}

      <ListItem className="text-sm">
        <ListItemPrefix>
          <Archive size={20} />
        </ListItemPrefix>
        <Typography
          color="black"
          className="mr-auto font-normal text-sm"
          onClick={() => navigate("/workspace/requests-management/archived-request")}
        >
          Archived Requests
        </Typography>
      </ListItem>

      {/* NEW: Reports Accordion */}
      <Accordion
        open={open === 3}
        className={`rounded-lg ${open === 3 ? "bg-gray-100" : ""}`}
        icon={
          <CaretDown
            strokeWidth={2.5}
            className={`mx-auto h-4 w-4 transition-transform ${open === 3 ? "rotate-180" : ""}`}
          />
        }
      >
        <ListItem className="p-0" selected={open === 3}>
          <AccordionHeader onClick={() => handleOpen(3)} className="border-b-0 p-3">
            <ListItemPrefix>
              <ChartBarHorizontal size={20} color="black" />
            </ListItemPrefix>
            <Typography color="black" className="mr-auto font-normal text-sm">
              Reports
            </Typography>
          </AccordionHeader>
        </ListItem>
        <AccordionBody className="py-1">
          <List className="p-0">
            <ListItem
              className="text-xs"
              onClick={() => navigate("/workspace/requests-management/reports")}
            >
              Reporting Dashboard
            </ListItem>
            <ListItem
              className="text-xs"
              onClick={() => navigate("/workspace/requests-management/summary-report")}
            >
              Summary Report
            </ListItem>
          </List>
        </AccordionBody>
      </Accordion>

      <hr className="my-2 border-t border-gray-300" />

      {/* In-house Management */}
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        In-house Management
      </Typography>
      <ListItem onClick={() => navigate("/workspace/employee-management/board")}>
        <ListItemPrefix>
          <ChalkboardTeacher size={20} />
        </ListItemPrefix>
        Employee List
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      {/* Venue Management */}
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Venue Management
      </Typography>
      <ListItem onClick={() => navigate("/workspace/venue-management/board")}>
        <ListItemPrefix>
          <ChalkboardSimple size={20} />
        </ListItemPrefix>
        Venue Registry
      </ListItem>
      <ListItem onClick={() => navigate("/workspace/venue-management/calendar")}>
        <ListItemPrefix>
          <Calendar size={20} />
        </ListItemPrefix>
        Venue Bookings
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      {/* Vehicle Management */}
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Vehicle Management
      </Typography>
      <ListItem onClick={() => navigate("/workspace/vehicle-management/board")}>
        <ListItemPrefix>
          <Car size={20} />
        </ListItemPrefix>
        Vehicle List
      </ListItem>
      <ListItem onClick={() => navigate("/workspace/vehicle-management/calendar")}>
        <ListItemPrefix>
          <Calendar size={20} />
        </ListItemPrefix>
        Vehicle Schedule
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      {/* Asset Management */}
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Asset Management
      </Typography>
      <ListItem onClick={() => navigate("/workspace/asset-management/board")}>
        <ListItemPrefix>
          <ChalkboardTeacher size={20} />
        </ListItemPrefix>
        Asset Directory
      </ListItem>
      <ListItem onClick={() => navigate("/workspace/asset-management/asset-tracking-log")}>
        <ListItemPrefix>
          <Notebook size={20} />
        </ListItemPrefix>
        Asset Tracking Log
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      {/* Directory */}
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Directory
      </Typography>
      <ListItem onClick={() => navigate("/workspace/user-management/board")}>
        <ListItemPrefix>
          <UsersThree size={20} />
        </ListItemPrefix>
        Directory
      </ListItem>

      <hr className="my-2 border-t border-gray-300" />

      {/* Settings */}
      <Typography className="text-xs font-semibold text-gray-700 pb-1">
        Settings
      </Typography>
      <ListItem onClick={() => navigate("/workspace/settings")}>
        <ListItemPrefix>
          <Gear size={20} />
        </ListItemPrefix>
        Settings
      </ListItem>
    </div>
  );
}

export default RequestsManagementControls;
