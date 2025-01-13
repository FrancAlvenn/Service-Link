import React, { useReducer } from "react";
import { Typography, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { ClipboardText, Ticket, ArchiveBox, UsersThree, CaretDown, ArrowsLeftRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import ControlRenderer from "./component/sidebar/ControlRenderer";

const options = {
  "Requests Management": <ClipboardText size={20} />,
  "Ticket Management": <Ticket size={20} />,
  "Asset Management": <ArchiveBox size={20} />,
  "Employee Management": <UsersThree size={20} />,
};

const routeMap = {
  "Requests Management": "/workspace/requests-management",
  "Ticket Management": "/workspace/ticket-management",
  "Asset Management": "/workspace/asset-management",
  "Employee Management": "/workspace/employee-management",
};

const initialState = {
  openDropdown: false,
  selectedControl: "Requests Management",
  isMinimized: false,  // New state to control sidebar minimization
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_DROPDOWN":
      return { ...state, openDropdown: !state.openDropdown };
    case "SELECT_CONTROL":
      return { ...state, selectedControl: action.payload, openDropdown: true };
    case "TOGGLE_MINIMIZE":
      return { ...state, isMinimized: !state.isMinimized };
    default:
      return state;
  }
}

function Sidebar() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const handleSelection = (control) => {
    dispatch({ type: "SELECT_CONTROL", payload: control });
    navigate(routeMap[control]);
  };

  return (
    <div
      className={`bg-white flex flex-col h-full p-4 transition-all   ${
        state.isMinimized ? "w-12" : "w-72 justify-center"
      } shadow-xl shadow-blue-gray-900/5 rounded-none rounded-tr-lg rounded-br-lg`}
    >
      <div className={`mt-0 flex items-center ${state.isMinimized ? "justify-center" : "justify-between"}`}>
        {!state.isMinimized && (
          <Typography color="blue-gray" className="text-lg font-bold">
            Requests Management
          </Typography>
        )}
        <button
          className="text-xl"
          onClick={() => dispatch({ type: "TOGGLE_MINIMIZE" })}
        >
          {state.isMinimized ? <CaretRight size={20} /> : <CaretLeft size={20} />}
        </button>
      </div>

      <hr className="my-5 border-gray-400" />

      {/* Show dropdown and other menu items only if sidebar is not minimized */}
      {!state.isMinimized && (
        <>
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
                onClick={() => handleSelection(control)}
              >
                {control}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <ControlRenderer selectedControl={state.selectedControl} />
        </>
      )}
      
    </div>
  );
}

export default Sidebar;
