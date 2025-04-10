import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import Task from './Task';
import axios from 'axios';
import { X } from '@phosphor-icons/react';


export default function Column({title, tasks, id, columnID, requestType, setRequests, user, columns, setColumns, fetchData, setSelectedReferenceNumber, setSidebarOpen}) {

  const removeColumn = async (id) => {
    if (!id) return;

    const updatedColumns = columns.filter(column => column.id !== id);
    try {
        await axios({
            method: "put",
            url: `/settings/user_preference/${user.reference_number}`,
            data: {
                kanban_config: { columns: updatedColumns },
            },
            withCredentials: true
        })
        setColumns(updatedColumns);
        localStorage.setItem('userPreference', JSON.stringify({ kanban_config: { columns: updatedColumns } }));
        fetchData();
    } catch (error) {
        console.error('Failed to remove column:', error);
    }
  };

  return (
    <div className='flex flex-col bg-gray-100 rounded-md  w-full min-w-[250px] h-[70vh] max-h-[80vh] overflow-y-scroll  custom-scrollbar'>
      <div
        className="font-semibold text-xs p-4  bg-gray-100 sticky top-0"
      >{title.toUpperCase()}
      <button onClick={() => removeColumn(columnID)} className="float-right"><X size={18}/></button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-grow min-h-[100px] rounded-sm">
            {tasks.map((task, index) => (
              <div key={task.id} className="mb-2">
                <Task key={task.id} task={task} index={index} requestType={requestType} setRequests={setRequests} setSelectedReferenceNumber={setSelectedReferenceNumber} setSidebarOpen={setSidebarOpen} />
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

    </div>
  )
}


