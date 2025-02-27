import React, { useContext, useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import { CardBody, CardHeader, Typography, Menu, MenuHandler, MenuList, MenuItem } from '@material-tailwind/react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { JobRequestsContext } from '../../context/JobRequestsContext';
import { VenueRequestsContext } from '../../context/VenueRequestsContext';
import { VehicleRequestsContext } from '../../context/VehicleRequestsContext';
import { PurchasingRequestsContext } from '../../context/PurchasingRequestsContext';
import axios from 'axios';
import { AuthContext } from '../../../authentication';

export function KanbanBoard() {
    const [columns, setColumns] = useState([]);
    const [requestType, setRequestType] = useState('job_request'); // Default request type

    const { jobRequests, fetchJobRequests, setJobRequests } = useContext(JobRequestsContext);
    const { purchasingRequests, fetchPurchasingRequests, setPurchasingRequests } = useContext(PurchasingRequestsContext);
    const { vehicleRequests, fetchVehicleRequests, setVehicleRequests } = useContext(VehicleRequestsContext);
    const { venueRequests, fetchVenueRequests, setVenueRequests } = useContext(VenueRequestsContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // Retrieve user preferences from local storage
        const userPreferences = JSON.parse(localStorage.getItem('userPreference'));
        if (userPreferences && userPreferences.kanban_config) {
            setColumns(userPreferences.kanban_config.columns);
        } else {
            setColumns([]);
        }
    }, []);

    const getRequestData = () => {
        switch (requestType) {
            case 'job_request':
                return { requests: jobRequests, setRequests: setJobRequests, fetchRequests: fetchJobRequests };
            case 'purchasing_request':
                return { requests: purchasingRequests, setRequests: setPurchasingRequests, fetchRequests: fetchPurchasingRequests };
            case 'vehicle_request':
                return { requests: vehicleRequests, setRequests: setVehicleRequests, fetchRequests: fetchVehicleRequests };
            case 'venue_request':
                return { requests: venueRequests, setRequests: setVenueRequests, fetchRequests: fetchVenueRequests };
            default:
                return { requests: [], setRequests: () => {}, fetchRequests: () => {} };
        }
    };

    const { requests, setRequests, fetchRequests } = getRequestData();

    const handleStatusChange = async (referenceNumber, status) => {
        try {
            const response = await axios.patch(
                `/${requestType}/${referenceNumber}/status`,
                { requester: user.reference_number, status },
                { withCredentials: true }
            );
            if (response.status === 200) {
                fetchRequests();
            }
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    const handleOnDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const referenceNumber = draggableId.toString();
        const newStatus = destination.droppableId;

        setRequests((prevRequests) =>
            prevRequests.map((task) =>
                task.reference_number === referenceNumber ? { ...task, status: newStatus } : task
            )
        );

        handleStatusChange(referenceNumber, newStatus);
    };

    return (
        <div className="h-full bg-white rounded-lg w-full mt-0 p-1 flex flex-col justify-between">
            <div className="flex flex-col gap-2 h-full">
                <CardHeader floated={false} shadow={false} className="rounded-none min-h-fit pb-2">
                    <div className="mb-1 flex items-center justify-between gap-5">
                        <div>
                            <Typography color="black" className="text-lg px-3 font-bold">Kanban Board</Typography>
                        </div>

                    </div>
                    <div className="flex items-center justify-between px-3 gap-4 mt-2">
                        {/* Search Bar */}
                        <div className="relative w-full max-w-sm min-w-[200px]">
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Search"
                            />
                            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
                                <MagnifyingGlass size={16} />
                            </span>
                        </div>

                        {/* Material Tailwind Menu for Request Type Selection */}
                        <div className="flex items-center gap-2">
                        <span className='text-xs font-semibold whitespace-nowrap text-gray-700'>GROUP BY</span>
                            <Menu>
                                <MenuHandler>
                                    <button className="font-semibold border border-slate-300 text-sm py-2 px-5 w-full max-w-[250px] rounded-md shadow-sm focus:outline-none focus:border-slate-500 hover:border-slate-400">
                                        {requestType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </button>
                                </MenuHandler>
                                <MenuList>
                                    <MenuItem onClick={() => setRequestType('job_request')}>Job Requests</MenuItem>
                                    <MenuItem onClick={() => setRequestType('purchasing_request')}>Purchasing Requests</MenuItem>
                                    <MenuItem onClick={() => setRequestType('vehicle_request')}>Vehicle Requests</MenuItem>
                                    <MenuItem onClick={() => setRequestType('venue_request')}>Venue Requests</MenuItem>
                                </MenuList>
                            </Menu>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="custom-scrollbar h-full pt-0">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <div className='flex justify-between items-center flex-row gap-3'>
                            {columns.map((column) => {
                                const tasksForColumn = Array.isArray(requests)
                                    ? requests.filter(task => task.status === column.name)
                                    : [];
                                return (
                                    <Column key={column.name} title={column.name} tasks={tasksForColumn} id={column.name} requestType={requestType} setRequests={setRequests} />
                                );
                            })}
                        </div>
                    </DragDropContext>
                </CardBody>
            </div>
        </div>
    );
}

export default KanbanBoard;