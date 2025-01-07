import React from "react";
import {Card, Typography,List, ListItem, ListItemPrefix, ListItemSuffix, Chip, Accordion, AccordionHeader, AccordionBody, Menu, MenuHandler, Button, MenuList, MenuItem} from "@material-tailwind/react";

import { Stack, ClipboardText, ChalkboardSimple, ChatCircle, ChartBar, CaretDown, UserPlus, ChalkboardTeacher} from "@phosphor-icons/react";

function EmployeeManagementControls() {

    const [open, setOpen] = React.useState(0);

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    return (
        <>
            <ListItem className="text-sm">
                <ListItemPrefix>
                    <ChalkboardTeacher size={20} />
                </ListItemPrefix>
                Board
            </ListItem>

            <ListItem className="text-sm">
                <ListItemPrefix>
                    <UserPlus size={20} />
                </ListItemPrefix>
                Add Employee
            </ListItem>

            <ListItem className="text-sm">
                <ListItemPrefix>
                    <ChartBar size={20} />
                </ListItemPrefix>
                Reporting Dashboard
            </ListItem>
        </>
    )

}


export default EmployeeManagementControls;