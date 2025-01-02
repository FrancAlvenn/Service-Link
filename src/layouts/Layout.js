import Navbar from "./Navbar";
import Main from "./Main";
import Sidebar from "./Sidebar";

function Layout({ children }) {
    return (
        <div className="flex flex-col h-screen">
            <Navbar/>

            <div className="flex flex-1 h-screen">
                <Sidebar/>

                <div className="flex-1 overflow-y-auto">
                    <Main>{children}</Main>
                </div>
            </div>
        </div>
    );
}

export default Layout;
