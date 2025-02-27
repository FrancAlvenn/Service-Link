import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import Task from './Task';


export default function Column({title, tasks, id}) {
  return (
    <div className='flex flex-col bg-gray-100 rounded-md  w-full min-w-[250px] h-[70vh] max-h-[80vh] overflow-y-scroll  custom-scrollbar'>
      <div
        className="font-semibold text-xs p-4  bg-gray-100 sticky top-0"
      >{title.toUpperCase()}
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-grow min-h-[100px] rounded-sm">
            {tasks.map((task, index) => (
              <div key={task.id} className="mb-2">
                <Task key={task.id} task={task} index={index} />
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

    </div>
  )
}


