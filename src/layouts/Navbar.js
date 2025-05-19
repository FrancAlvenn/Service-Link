import NotificationModal from "./component/navbar/NotificationModal";
import HelpModal from "./component/navbar/HelpModal";
import SettingsModal from "./component/navbar/SettingsModal";
import ProfileModal from "./component/navbar/ProfileModal";

function Navbar() {
  return (
    <nav className="w-full bg-white z-10">
      <div className="flex justify-end items-center gap-3 px-5 py-1 border-gray-200">
        <div className="flex items-center text-black">
          <NotificationModal />
          <ProfileModal />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
