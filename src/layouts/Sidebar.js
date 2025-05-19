import React, { useContext, useReducer, useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import {
  ClipboardText,
  ArchiveBox,
  UsersThree,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useNavigate, useLocation } from "react-router-dom";
import ControlRenderer from "./component/sidebar/ControlRenderer";
import { AuthContext } from "../features/authentication";
import logo from "../assets/dyci_logo.png";

const options = {
  "Requests Management": <ClipboardText size={20} />,
  "Asset Management": <ArchiveBox size={20} />,
  "Employee Management": <UsersThree size={20} />,
};

const routeMap = {
  "Requests Management": "/workspace/requests-management",
  "Ticket Management": "/workspace/ticket-management",
  "Asset Management": "/workspace/asset-management",
  "Employee Management": "/workspace/employee-management",
};

const pathToControlMap = {
  "/workspace/requests-management": "Requests Management",
  "/workspace/ticket-management": "Ticket Management",
  "/workspace/asset-management": "Asset Management",
  "/workspace/employee-management": "Employee Management",
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
      localStorage.setItem(
        "sidebarMinimized",
        JSON.stringify(newState.isMinimized)
      );
      return newState;
    default:
      return state;
  }
}

function Sidebar() {
  const { userPreference } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const derivedControl = pathToControlMap[currentPath];

  const initialSidebarState = JSON.parse(
    localStorage.getItem("sidebarMinimized")
  );
  const initialControl = JSON.parse(localStorage.getItem("selectedControl"));
  const isMinimized =
    initialSidebarState ?? userPreference?.sidebar_view === false;

  const initialState = {
    openDropdown: false,
    selectedControl: derivedControl ?? initialControl ?? "Workspace",
    isMinimized,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // 🔁 Sync selectedControl with route
  useEffect(() => {
    const control = pathToControlMap[location.pathname];
    if (control && control !== state.selectedControl) {
      dispatch({ type: "SELECT_CONTROL", payload: control });
    }
  }, [location.pathname]);

  const handleSelection = (control) => {
    dispatch({ type: "SELECT_CONTROL", payload: control });
    navigate(routeMap[control]);
  };

  return (
    <div
      className={`bg-white flex flex-col h-full p-4 transition-all ${
        state.isMinimized ? "w-12" : "w-72 justify-center"
      } shadow-xl shadow-black-900/5 rounded-none`}
    >
      <div
        className={`mt-0 flex items-center ${
          state.isMinimized ? "justify-center" : "justify-between"
        }`}
      >
        {!state.isMinimized && (
          <div className="flex items-center gap-3">
            <img src={logo} alt="DYCI" className="w-10 h-10" />
            <p>Service Link</p>
          </div>
        )}
        <button
          className="text-xl"
          onClick={() => dispatch({ type: "TOGGLE_MINIMIZE" })}
        >
          {state.isMinimized ? (
            <CaretRight size={20} />
          ) : (
            <CaretLeft size={20} />
          )}
        </button>
      </div>

      <hr className="my-5 border-gray-400" />

      {!state.isMinimized && (
        <ControlRenderer selectedControl={state.selectedControl} />
      )}
    </div>
  );
}

export default Sidebar;
