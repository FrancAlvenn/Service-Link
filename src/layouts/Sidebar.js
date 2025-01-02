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
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";



import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Stack, ClipboardText, ChalkboardSimple, ChatCircle, ChartBar} from "@phosphor-icons/react";
 
function Sidebar() {
  const [open, setOpen] = React.useState(0);
 
  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };
 
  return (
    <Card className="h-fill w-64 max-h-screen max-w-[20rem] shadow-xl shadow-blue-gray-900/5">
      <div className="mt-5 px-4">
        <Typography variant="h5" color="blue-gray" className="text-lg">
          Requests Management
        </Typography>
      </div>
      <List>
      <hr className="my-7 border-gray-400" />
        <Accordion
          open={open === 1}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
            />
          }
        >
            <ListItem className="mt-1 p-0 border" selected={open === 1}>
            <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-2">
                <ListItemPrefix>
                <span className="flex items-center p-2 bg-blue-500 rounded-lg ">
                    <ClipboardText size={16} className="cursor-pointer text-white" />
                </span>
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-semibold text-sm">
                    Request Management
                </Typography>
            </AccordionHeader>
            </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
                <ListItem className="text-sm">
                    <ListItemPrefix>    
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    Analytics
                </ListItem>
                <ListItem className="text-sm">
                    <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    Reporting
                </ListItem>
                <ListItem className="text-sm">
                    <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    Projects
                </ListItem>
            </List>
          </AccordionBody>
        </Accordion>


        <Accordion
          open={open === 2}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
            />
          }
        >
          <ListItem className="p-0" selected={open === 2}>
            <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-3">
                <ListItemPrefix>
                    <Stack size={20} />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal text-sm">
                    Queues
                </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List className="p-0">
                <ListItem className="text-sm">
                    All Open
                </ListItem>
                <ListItem className="text-sm">
                    In Progress
                </ListItem>
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={open === 3}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
            />
          }
        >
          <ListItem className="p-0" selected={open === 2}>
            <AccordionHeader onClick={() => handleOpen(3)} className="border-b-0 p-3">
                <ListItemPrefix>
                    <ChalkboardSimple size={20} />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal text-sm">
                    Views
                </Typography>
                <ListItemSuffix>
                    <Chip value="14" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
                </ListItemSuffix>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List className="p-0">
                <ListItem className="text-sm">
                    Kanban
                </ListItem>
                <ListItem className="text-sm">
                    Calendar
                </ListItem>
            </List>
          </AccordionBody>
        </Accordion>


        <ListItem className="text-sm">
          <ListItemPrefix>
            <ChatCircle size={20} />
          </ListItemPrefix>
          Raise a Request
        </ListItem>

        <ListItem className="text-sm">
          <ListItemPrefix>
            <ChartBar size={20} />
          </ListItemPrefix>
          Reporting Dashboard
        </ListItem>

      </List>
    </Card>
  );
}

export default Sidebar;