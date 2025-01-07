import React, { useReducer } from "react";
import { Card,
  Typography,
  List,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  ClipboardText,
  Ticket,
  ArchiveBox,
  UsersThree,
  CaretDown,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import RequestsManagementControls from "./component/sidebar/RequestsManagementControls";
import TicketManagementControls from "./component/sidebar/TicketManagementControls";
import AssetManagementControls from "./component/sidebar/AssetManagementControls";
import EmployeeManagementControls from "./component/sidebar/EmployeeManagementControls";
import ControlRenderer from "./component/sidebar/ControlRenderer";

const options = {
  "Requests Management": <ClipboardText size={20} />, // Default icon
  "Ticket Management": <Ticket size={20} />,
  "Asset Management": <ArchiveBox size={20} />,
  "Employee Management": <UsersThree size={20} />,
};

// Map menu options to their corresponding routes
const routeMap = {
  "Requests Management": "/workspace/requests-management",
  "Ticket Management": "/workspace/ticket-management",
  "Asset Management": "/workspace/asset-management",
  "Employee Management": "/workspace/employee-management",
};

const initialState = {
  openDropdown: false,
  selectedControl: "Requests Management",
};


function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_DROPDOWN":
      return { ...state, openDropdown: !state.openDropdown };
    case "SELECT_CONTROL":
      return {
        ...state,
        selectedControl: action.payload,
        openDropdown: true,
      };
    default:
      return state;
  }
}

function Sidebar() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = useNavigate();

  const handleSelection = (control) => {
    dispatch({ type: "SELECT_CONTROL", payload: control });
    navigate(routeMap[control]); // Navigate to the corresponding route
  };

  return (
    <Card className="h-fill p-4 w-72 max-h-screen max-w-[20rem] shadow-xl shadow-blue-gray-900/5">
      <div className="mt-5 px-4">
        <Typography variant="h5" color="blue-gray" className="text-lg">
          Requests Management
        </Typography>
      </div>
      <List>
        <hr className="my-7 border-gray-400" />

        <Menu
          className="w-full"
          open={state.openDropdown}
          handler={(isOpen) => dispatch({ type: "TOGGLE_DROPDOWN" })}
        >
          <MenuHandler>
            <button
              onClick={() => dispatch({ type: "TOGGLE_DROPDOWN" })}
              className="flex justify-between items-center gap-2 pl-4 pr-3 py-2 text-xs font-bold bg-blue-gray-50 border border-gray-400 rounded-lg"
            >
              <span className="flex gap-2 items-center">
                {options[state.selectedControl]}
                {state.selectedControl}
              </span>
              <CaretDown
                size={12}
                strokeWidth={2.5}
                className={`h-4 w-4 transition-transform ${
                  state.openDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
          </MenuHandler>
          <MenuList className="border-none w-56 py-3 shadow-md">
            <span className="py-3 text-xs font-bold">Workspace</span>
            <hr className="my-3 h-px text-gray-400" />
            {Object.keys(options).map((control) => (
              <MenuItem
                key={control}
                className="px-3 py-3 text-left hover:bg-gray-200"
                onClick={() =>handleSelection(control)}
              >
                {control}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <ControlRenderer selectedControl={state.selectedControl}/>
      </List>
    </Card>
  );
}

export default Sidebar;
