import React, { useState } from "react";
import {Card, Typography,List, ListItem, ListItemPrefix, ListItemSuffix, Chip, Accordion, AccordionHeader, AccordionBody, Menu, MenuHandler, Button, MenuList, MenuItem} from "@material-tailwind/react";

import { Stack, ClipboardText, ChalkboardSimple, ChatCircle, ChartBar, CaretDown, UserPlus, Plus, PlusCircle, Chalkboard, ChalkboardTeacher} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

/**
 * AssetManagementControls is a React component that renders a list of controls for managing assets in the workspace.
 *
 * It renders a list of three items: a board, an "Add Asset" button, and a reporting dashboard. The "Add Asset" button
 * is prefixed with a PlusCircle icon, and the reporting dashboard is prefixed with a ChartBar icon.
 *
 * The component uses the useState hook to manage the state of the list items, and the handleOpen function is used
 * to toggle the visibility of the list items.
 *
 * @function
 * @returns {ReactElement} A React element representing the AssetManagementControls component.
 */
function AssetManagementControls() {

    const [open, setOpen] = useState(0);

    const navigate = useNavigate();

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    return (
        <>
            <ListItem className="text-sm" onClick={() => navigate("/workspace/asset-management/board")}>
                <ListItemPrefix>
                    <ChalkboardTeacher size={20} />
                </ListItemPrefix>
                Board
            </ListItem>

            <ListItem className="text-sm" onClick={() => navigate("/workspace/asset-management/create-asset")}>
                <ListItemPrefix>
                    <PlusCircle size={20} />
                </ListItemPrefix>
                Add Asset
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


export default AssetManagementControls;