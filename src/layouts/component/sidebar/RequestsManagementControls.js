import React from "react";
import {Card, Typography,List, ListItem, ListItemPrefix, ListItemSuffix, Chip, Accordion, AccordionHeader, AccordionBody, Menu, MenuHandler, Button, MenuList, MenuItem} from "@material-tailwind/react";

import { Stack, ClipboardText, ChalkboardSimple, ChatCircle, ChartBar, CaretDown} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

function RequestsManagementControls() {

    const [open, setOpen] = React.useState(0);

    const navigate = useNavigate();

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    return (
        <div>
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
                        <Stack size={20} color="black" />
                    </ListItemPrefix>
                    <Typography color="black" className="mr-auto font-normal text-sm">
                        Queues
                    </Typography>
                </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
                <List className="p-0">
                    <ListItem className="text-xs"
                        onClick={() => navigate("/workspace/requests-management/queues/job-requests")}>
                        Job Requests
                    </ListItem>
                    <ListItem className="text-xs"
                        onClick={() => navigate("/workspace/requests-management/queues/purchasing-requests")}>
                        Purchasing Requests
                    </ListItem>
                    <ListItem className="text-xs"
                        onClick={() => navigate("/workspace/requests-management/queues/vehicle-requests")}>
                        Vehicle Requests
                    </ListItem>
                    <ListItem className="text-xs"
                        onClick={() => navigate("/workspace/requests-management/queues/venue-requests")}>
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
                className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
                />
            }
            >
            <ListItem className="p-0" selected={open === 2}>
                <AccordionHeader onClick={() => handleOpen(3)} className="border-b-0 p-3">
                    <ListItemPrefix>
                        <ChalkboardSimple size={20} color="black" />
                    </ListItemPrefix>
                    <Typography color="black" className="mr-auto font-normal text-sm">
                        Views
                    </Typography>
                    <ListItemSuffix>
                        <Chip value="14" size="sm" variant="ghost" color="black" className="rounded-full" />
                    </ListItemSuffix>
                </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
                <List className="p-0">
                    <ListItem className="text-xs">
                        Kanban
                    </ListItem>
                    <ListItem className="text-xs">
                        Calendar
                    </ListItem>
                </List>
            </AccordionBody>
            </Accordion>


            <ListItem className="text-sm">
            <ListItemPrefix>
                <ChatCircle size={20} />
            </ListItemPrefix>
            <Typography  color="black" className="mr-auto font-normal text-sm">
                Raise a Request
            </Typography>
            </ListItem>

            <ListItem className="text-sm">
            <ListItemPrefix>
                <ChartBar size={20} />
            </ListItemPrefix>
            <Typography  color="black" className="mr-auto font-normal text-sm">
                Reporting Dashboard
            </Typography>
            </ListItem>
        </div>
    )

}


export default RequestsManagementControls;