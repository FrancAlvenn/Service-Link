import {
  Button,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "@material-tailwind/react";
import { User } from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../../authentication";
import { UserContext } from "../../../../context/UserContext";
import ToastNotification from "../../../../utils/ToastNotification";

const RequestAccess = ({ selectedRequest }) => {
  const { user } = useContext(AuthContext);

  const { getUserByReferenceNumber, getUserEmailByReferenceNumber } =
    useContext(UserContext);

  const [content, setContent] = useState("");

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  //get users with access to the request
  const requestAccess = selectedRequest.authorized_access;

  const handleRequestAccess = async () => {
    const newActivity = {
      reference_number: selectedRequest.reference_number,
      type: "request_access",
      visibility: "external",
      action: "Request Access",
      details: content || "Admin has requested to access the document",
      performed_by: user.reference_number,
    };

    try {
      await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}/request_activity`,
        data: newActivity,
        withCredentials: true,
      }).then(() => {
        ToastNotification.info("Success", "Access request sent successfully");
        setContent("");
      });
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  return (
    <Menu placement="bottom-end" dismiss={{ itemPress: false }}>
      <MenuHandler>
        <div title="Request Access" className="flex items-center">
          <Button
            variant="outlined"
            color="blue"
            className="flex items-center font-bold  py-2 px-4"
          >
            Request Access
          </Button>
        </div>
      </MenuHandler>
      <MenuList
        className="w-full max-w-[300px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Typography
          variant="title"
          color="black"
          className="flex items-center font-semibold mb-3"
        >
          Request Access to "{selectedRequest.title || "Document"}"
        </Typography>

        <Typography variant="small" className="text-gray-500 font-medium">
          People with Access
        </Typography>

        {/* Map through the authorized access */}
        {requestAccess.map((access) => (
          <MenuItem className="flex justify-between items-center px-2 py-2 text-xs text-gray-700 hover:bg-gray-200">
            <div className="flex gap-1 items-center">
              {/* <User size={32} className="cursor-pointer" /> */}
              <span className="flex flex-col items-start">
                <p className="text-xs font-bold leading-3">
                  {getUserByReferenceNumber(access)}
                </p>
                <p className="text-xs text-gray-500">
                  {getUserEmailByReferenceNumber(access)}
                </p>
              </span>
            </div>
          </MenuItem>
        ))}

        {/* This should be in the activity tab use that when you finished it // REMARKS */}
        {/* 
            <Typography variant="paragraph" color="gray" className="flex items-center">
                <span className="mr-2 w-full">
                    <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                      placeholder="Enter message (optional)" 
                      value={content}
                      onChange={(e) => handleContentChange(e.target.value)}
                    />
                </span>
            </Typography> */}

        <MenuItem>
          <Button
            variant="contained"
            color="blue"
            className="w-full"
            onClick={handleRequestAccess}
          >
            Send Request
          </Button>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default RequestAccess;
