import { useContext, useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import { UserCircle } from "@phosphor-icons/react";
import { UserContext } from "../../context/UserContext";
import PropTypes from "prop-types";

const UserPicker = ({
  onSelect,
  disabled,
  dismiss = false,
  title = "Select User",
  color = "blue",
  variant = "outlined",
  closeOnSelect = true,
}) => {
  const { allUserInfo } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered =
    allUserInfo === null
      ? []
      : allUserInfo.filter((user) =>
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

  return (
    <Menu placement="bottom-start" dismiss={{ itemPress: dismiss }}>
      <MenuHandler>
        <Button
          variant={variant}
          color={color}
          size="sm"
          className="w-fit text-left py-2"
          disabled={disabled}
        >
          {title}
        </Button>
      </MenuHandler>
      <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px] p-2 z-40">
        <input
          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm"
          placeholder="Search employee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filtered.length > 0 ? (
          filtered.map((user) => (
            <MenuItem
              key={user.reference_number}
              onClick={() => onSelect(user)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <UserCircle size={20} /> {user.first_name} {user.last_name}
              </span>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No matching users</MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

// Add propTypes at the bottom
UserPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  dismiss: PropTypes.bool,
  title: PropTypes.string,
  color: PropTypes.string,
  variant: PropTypes.string,
  closeOnSelect: PropTypes.bool,
};

UserPicker.defaultProps = {
  disabled: false,
  dismiss: false,
  title: "Select User",
  color: "blue",
  variant: "outlined",
};

export default UserPicker;
