import { Button, Menu, MenuHandler, MenuList, MenuItem, Typography } from "@material-tailwind/react";
import { Bell, ArrowSquareOut } from "@phosphor-icons/react";
import axios from "axios";
import { useState } from "react";

function statusModal(status) {

    const [metaStatus, setStatus] = useState(status);


    async function fetchStatus(){
        const _tempstatus = await axios({
            method: "get",
            url: "http://localhost:8080/service_link_api/settings/status/",
            withCredentials: true,
        })
        
        

    }


    return (
        <Menu placement="bottom-start" dismissType="click">
            <MenuHandler>
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center justify-between gap-2 font-normal leading-none opacity-70 capitalize">
                   {status}
                </Typography>
            </MenuHandler>

            <MenuList className="left z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
                <div className="py-4 px-4 text-sm font-semibold">
                    Notification
                </div>
                <div className="py-1">

                    <MenuItem  className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">

                    </MenuItem>

                </div>
                <div className="py-1">
                    <MenuItem className="flex items-center justify-end px-4 py-4 text-xs text-blue-500 hover:bg-gray-200">
                        View all
                    </MenuItem>
                </div>
            </MenuList>
        </Menu>
    );
}

export default statusModal;
