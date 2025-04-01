import { Button, Menu, MenuHandler, MenuItem, MenuList, Typography } from "@material-tailwind/react";
import { Link, User } from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from "../../../features/authentication";
import { UserContext } from "../../../context/UserContext";
import axios from "axios";
import ToastNotification from "../../../utils/ToastNotification";



const RequestAccess = ({selectedRequest, requestType}) => {
  const {user} = useContext(AuthContext)

  const { getUserByReferenceNumber, getUserEmailByReferenceNumber } = useContext(UserContext);

  //get users with access to the request
  const [ userWithAccess, setUserWithAccess ] = useState(selectedRequest.authorized_access);

  const [ accessRequest, setAccessRequest ] = useState([]);

  useEffect(() => {
    getAccessRequest();
  }, []);

  const getAccessRequest = async () => {
    try {
      const res = await axios.get(`/request_activity/${selectedRequest.reference_number}`, { withCredentials: true });
  
      // Filter request activities where type is "request_access"
      const accessRequests = res.data.filter((activity) => activity.request_type === "request_access");
  
      console.log("UserWithAccess", userWithAccess)
      

      // Filter out users who already have access
      const filteredRequests = accessRequests.filter(
        (access) => !userWithAccess.some((user) => user === access.created_by)
      );
  
      // Update state correctly
      setAccessRequest((prev) => [...prev, ...filteredRequests]);
  
      console.log("Access Request:", filteredRequests);
    } catch (error) {
      console.error("Error fetching access requests:", error);
    }
  };

  const handleGrantAccess = async (user) => {
    try {
      await axios.put(`/${requestType}/${selectedRequest.reference_number}`, {
        ...selectedRequest,
        authorized_access: ([...selectedRequest.authorized_access, user]),
      }).then(() => {
        getAccessRequest();
        ToastNotification.success("Success", `Request access to ${selectedRequest.title || "document"} has been granted.`);
      })
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", `Failed to update.`);
    }
  };



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


            {/* Map through the authorized access */}
            {
              userWithAccess.map((access) => (
                <MenuItem className="flex justify-between items-center px-2 py-2 text-xs text-gray-700 hover:bg-gray-200">
                  <div className="flex gap-1 items-center">
                      {/* <User size={32} className="cursor-pointer" /> */}
                      <span className="flex flex-col items-start">
                          <p className="text-xs font-bold leading-3">{getUserByReferenceNumber(access)}</p>
                          <p className="text-xs text-gray-500">{getUserEmailByReferenceNumber(access)}</p>
                      </span>
                  </div>
              </MenuItem>
              ))
            }

            <Typography variant="small" className="text-gray-500 font-medium">Request Access</Typography>

            {
              accessRequest.map((request) => (
                <MenuItem className="flex justify-between items-center px-2 py-2 text-xs text-gray-700 hover:bg-gray-200">
                  <div className="flex gap-1 items-center justify-between w-full">
                      {/* <User size={32} className="cursor-pointer" /> */}
                      <span className="flex flex-col items-start">
                          <p className="text-xs font-bold leading-3">{getUserByReferenceNumber(request.created_by)}</p>
                          <p className="text-xs text-gray-500">{getUserEmailByReferenceNumber(request.created_by)}</p>
                      </span>
                      <Link size={20} className="cursor-pointer" onClick={() => handleGrantAccess(request.created_by)} />
                  </div>
              </MenuItem>
              ))
            }
      </MenuList>
    </Menu>
    
  )
}

export default RequestAccess
