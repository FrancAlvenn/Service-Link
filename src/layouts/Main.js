import { useState } from "react";
import SidebarView from "../components/sidebar/SidebarView";
import Navbar from "./Navbar";

function Main({ children }) {
  return (
    <main className="flex-1 pl-1 h-full">
      {/* <Navbar /> */}
      {children}
    </main>
  );
}

export default Main;
