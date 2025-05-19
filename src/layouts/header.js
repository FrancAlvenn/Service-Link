import { Typography } from "@material-tailwind/react";
import NotificationModal from "./component/navbar/NotificationModal";
import ProfileModal from "./component/navbar/ProfileModal";

const Header = ({ title, description }) => {
  return (
    <div className="mb-1 flex items-center justify-between gap-5 px-3">
      <div>
        <Typography color="black" className="text-lg font-bold">
          {title}
        </Typography>
        <Typography color="gray" className="mt-1 font-normal text-sm">
          {description}
        </Typography>
      </div>
      <div className="flex items-center text-black">
        <NotificationModal />
        <ProfileModal />
      </div>
    </div>
  );
};

export default Header;
