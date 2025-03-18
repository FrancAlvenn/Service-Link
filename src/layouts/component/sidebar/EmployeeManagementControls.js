import React from "react";
import {Card, Typography,List, ListItem, ListItemPrefix, ListItemSuffix, Chip, Accordion, AccordionHeader, AccordionBody, Menu, MenuHandler, Button, MenuList, MenuItem} from "@material-tailwind/react";

import { Stack, ClipboardText, ChalkboardSimple, ChatCircle, ChartBar, CaretDown, UserPlus, ChalkboardTeacher} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

/**
 * Renders the Employee Management Controls component.
 *
 * The component consists of a list of 3 items:
 * 1. "Board" item with a ChalkboardTeacher icon
 * 2. "Add Employee" item with a UserPlus icon
 * 3. "Reporting Dashboard" item with a ChartBar icon
 *
 * Each item can be opened and closed by clicking on it.
 * The component uses the `useState` hook to maintain the state of the open/closed items.
 * The `handleOpen` function is used to toggle the state of an item.
 * The component renders a list of the items, with the open/closed state of each item
 * being determined by the `open` state variable.
 */
function EmployeeManagementControls() {

    const [open, setOpen] = React.useState(0);

    const navigate = useNavigate();

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    return (
        <>
            <ListItem className="text-sm" onClick={() => navigate("/workspace/employee-management/board")}>
                <ListItemPrefix>
                    <ChalkboardTeacher size={20} />
                </ListItemPrefix>
                Board
            </ListItem>

            <ListItem className="text-sm" onClick={() => navigate("/workspace/employee-management/add-employee")}>
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