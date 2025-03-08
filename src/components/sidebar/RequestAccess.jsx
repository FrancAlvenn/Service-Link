import { Button, Menu, MenuHandler, MenuItem, MenuList, Typography } from "@material-tailwind/react";
import { User } from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from "../../context/UserContext";


const RequestAccess = ({selectedRequest}) => {
    const { getUserByReferenceNumber, getUserEmailByReferenceNumber } = useContext(UserContext);

    // Request Access to Document


  return (
    <Menu placement="bottom-end" dismiss={{ itemPress: false }}>
      <MenuHandler>
        <Button variant="outlined" color="blue" className="flex items-center font-bold rounded-full py-2 px-4" >
          Request Access
        </Button>
      </MenuHandler>
      <MenuList 
        className="w-full max-w-[300px] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
            <Typography variant="title" color="black" className="flex items-center font-semibold mb-3" >Request Access to "{selectedRequest.title || "Document"}"</Typography>

            <Typography variant="small" className="text-gray-500 font-medium">People with Access</Typography>

            <MenuItem className="flex justify-between items-center px-2 py-2 text-xs text-gray-700 hover:bg-gray-200">
                <div className="flex gap-1 items-center">
                    {/* <User size={32} className="cursor-pointer" /> */}
                    <span className="flex flex-col items-start">
                        <p className="text-xs font-bold leading-3">{getUserByReferenceNumber(selectedRequest.requester)}</p>
                        <p className="text-xs text-gray-500">{getUserEmailByReferenceNumber(selectedRequest.requester)}</p>
                    </span>
                </div>
            </MenuItem>

            {/* This should be in the activity tab use that when you finished it // REMARKS */}

            {/* <Typography variant="paragraph" color="gray" className="flex items-center">
                <span className="mr-2">
                    <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Enter message (optional)" />
                </span>
            </Typography> */}

            <MenuItem>
                <Button variant="contained" color="blue" fullWidth>
                    Send Request
                </Button>
            </MenuItem>
      </MenuList>
    </Menu>
    
  )
}

export default RequestAccess
