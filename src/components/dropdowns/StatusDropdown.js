import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useState } from 'react';

function StatusDropdown() {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center items-center gap-x-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Options
          <FontAwesomeIcon aria-hidden="true" icon="chevron-down" className="text-center text-gray-500" />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        anchor="bottom start"
      >
        <div className="py-1">
          <MenuItem>
              <a
                href="#"
                className={"flex items-center px-4 py-2 text-sm text-gray-700"}
              >
                Edit
              </a>
          </MenuItem>
          <MenuItem>
              <a
                href="#"
                className={"flex items-center px-4 py-2 text-sm text-gray-700"}
              >
                Edit
              </a>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default StatusDropdown;
