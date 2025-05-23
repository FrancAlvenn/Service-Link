import Navbar from "./Navbar";
import Main from "./Main";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="flex flex-col h-full bg-gray-200">
      {/* <Navbar /> */}

      <div className="flex flex-1 mb-0 h-[90%] ">
        <Sidebar />

        <div className="flex-1 overflow-auto">
          <Main>{children}</Main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
