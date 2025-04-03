import React, { useContext, useReducer, useEffect } from "react";
import { Typography, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { ClipboardText, Ticket, ArchiveBox, UsersThree, CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import ControlRenderer from "./component/sidebar/ControlRenderer";
import { AuthContext } from "../features/authentication";

const options = {
  "Requests Management": <ClipboardText size={20} />,
  "Ticket Management": <Ticket size={20} />,
  "Asset Management": <ArchiveBox size={20} />,
  "Employee Management": <UsersThree size={20} />,
};

const routeMap = {
  "Requests Management": "/workspace/requests-management",
  "Ticket Management": "/workspace/ticket-management/board",
  "Asset Management": "/workspace/asset-management/board",
  "Employee Management": "/workspace/employee-management/board",
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_DROPDOWN":
      return { ...state, openDropdown: !state.openDropdown };
    case "SELECT_CONTROL":
      localStorage.setItem("selectedControl", JSON.stringify(action.payload));
      return { ...state, selectedControl: action.payload, openDropdown: true };
    case "TOGGLE_MINIMIZE":
      const newState = { ...state, isMinimized: !state.isMinimized };
      localStorage.setItem("sidebarMinimized", JSON.stringify(newState.isMinimized)); // Persist state
      return newState;
    default:
      return state;
  }
}

function Sidebar() {
  const { userPreference } = useContext(AuthContext);
  const navigate = useNavigate();

  // Get sidebar state from localStorage (or fallback to userPreference)
  const initialSidebarState = JSON.parse(localStorage.getItem("sidebarMinimized"));
  const initialControl = JSON.parse(localStorage.getItem("selectedControl"));
  const isMinimized = initialSidebarState ?? (userPreference?.sidebar_view === false);

  const initialState = {
    openDropdown: false,
    selectedControl: initialControl ?? "Requests Management",
    isMinimized, // Load from localStorage
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSelection = (control) => {
    dispatch({ type: "SELECT_CONTROL", payload: control });
    navigate(routeMap[control]);
  };

  return (
    <div
      className={`bg-white flex flex-col h-full p-4 transition-all ${
        state.isMinimized ? "w-12" : "w-72 justify-center"
      } shadow-xl shadow-black-900/5 rounded-none `}
    >
      <div className={`mt-0 flex items-center ${state.isMinimized ? "justify-center" : "justify-between"}`}>
        {!state.isMinimized && (
          <Typography color="black" className="text-md font-bold whitespace-nowrap font-body">
            {state.selectedControl}
          </Typography>
        )}
        <button className="text-xl" onClick={() => dispatch({ type: "TOGGLE_MINIMIZE" })}>
          {state.isMinimized ? <CaretRight size={20} /> : <CaretLeft size={20} />}
        </button>
      </div>

      <hr className="my-5 border-gray-400" />

      {!state.isMinimized && (
        <>
          <Menu className="w-full" open={state.openDropdown} handler={() => dispatch({ type: "TOGGLE_DROPDOWN" })}>
            <MenuHandler>
              <button
                onClick={() => dispatch({ type: "TOGGLE_DROPDOWN" })}
                className="flex justify-between items-center gap-2 pl-4 pr-3 py-2 text-xs font-bold bg-black-50 border border-gray-400 rounded-lg"
              >
                <span className="flex gap-2 items-center whitespace-nowrap">
                  {options[state.selectedControl]}
                  {state.selectedControl}
                </span>
                <CaretDown
                  size={12}
                  strokeWidth={2.5}
                  className={`h-4 w-4 transition-transform whitespace-nowrap ${
                    state.openDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            </MenuHandler>
            <MenuList className="mt-2 border-none w-60 py-3 shadow-md whitespace-nowrap">
              <span className="py-3 text-xs font-bold text-black ">Workspace</span>
              <hr className="my-3 h-px text-gray-400" />
              {Object.keys(options).map((control) => (
                <MenuItem
                  key={control}
                  className="px-3 py-3 text-left text-black text-xs hover:bg-gray-200 whitespace-nowrap"
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
