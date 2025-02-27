import { Typography } from '@material-tailwind/react';
import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import styled from 'styled-components'

const Container = styled.div`
    border-radius: 10px;
    padding: 8px;
    color : #000;
    min-height: 90px;
    margin-left: 8px;
    margin-right: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border: 1px solid lightgrey;
    padding: 8px;
    margin-bottom: 8px;
    background-color: ${props => bgcolorChange(props)};
`;


function bgcolorChange(props) {
    return props.isDragging
        ? "#60d1fd"
        : props.isDraggable
        ? props.isBacklog
            ? "#F2D7D5"
            : "#DCDCDC"
        : props.isBacklog
        ? "#F2D7D5"
        : "#fff";
}

export default function Task({ task, index}) {
  return (
    <Draggable draggableId={task.reference_number.toString()} key={task.reference_number} index={index}>
      {(provided, snapshot) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
        >
          <div className='flex justify-start p-2'>
            <span>
              <small>
                {task.id}
                  {"  "}
              </small>
            </span>
          </div>

          <div className='flex justify-between items-center p-2'>
            <Typography color="blue" className="text-lg font-bold">{task.title}</Typography>
            <Typography color="black" className="text-sm font-bold">{task.status}</Typography>
          </div>

          {provided.placeholder}
        </Container>
      )}
    </Draggable>
  )
}
