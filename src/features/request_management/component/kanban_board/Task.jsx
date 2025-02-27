import { Menu, MenuHandler, MenuItem, MenuList, Typography } from '@material-tailwind/react';
import React, { useContext } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import StatusModal from '../../../../utils/statusModal';
import { DotsThree } from '@phosphor-icons/react';
import axios from 'axios';
import { AuthContext } from "../../../authentication";
import ToastNotification from '../../../../utils/ToastNotification';

export default function Task({ task, index, requestType, setRequests }) {
  const { user } = useContext(AuthContext);

  async function handleArchiveRequest(task) {
    try {
      const res = await axios.delete(`/${requestType}/${task.reference_number}/archive/1`, {
        data: { requester: user.reference_number },
        withCredentials: true
      });

      if (res.status === 200) {
        ToastNotification.success('Success!', res.data.message);
        
        // Remove the archived task from the list
        setRequests(prevTasks => prevTasks.filter(t => t.reference_number !== task.reference_number));
      }
    } catch (error) {
      ToastNotification.error('Error!', 'Failed to update status.');
    }
  }

  return (
    <Draggable draggableId={task.reference_number.toString()} key={task.reference_number} index={index}>
      {(provided, snapshot) => (
        <div
          className='flex justify-start flex-col bg-white rounded-md mx-2 min-h-[90px]'
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className='flex justify-between items-center p-2'>
            <Typography color="black" className="text-sm font-semibold">{task.title}</Typography>
            
            <Menu placement="bottom-end">
              <MenuHandler>
                <DotsThree size={24} className="cursor-pointer hover:bg-gray-200 rounded-full"/>
              </MenuHandler>
              <MenuList>
                <MenuItem onClick={() => handleArchiveRequest(task)}>Archive Request</MenuItem>
              </MenuList>
            </Menu>
          </div>

          <div className='flex justify-between items-center px-2'>
            <StatusModal input={task.status} referenceNumber={task.reference_number} requestType={requestType}/>
          </div>

          <div className='flex justify-between items-center p-2 '>
            <Typography color="black" className="text-xs">{task.reference_number}</Typography>
          </div>

          {provided.placeholder}
        </div>
      )}
    </Draggable>
  )
}
