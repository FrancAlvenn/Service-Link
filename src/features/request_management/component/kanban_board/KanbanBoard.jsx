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
    const [status, setStatus] = useState([]); // Stores departments from DB
    const [requestType, setRequestType] = useState('job_request'); // Default request type
    const [searchQuery, setSearchQuery] = useState('');

    const { jobRequests, fetchJobRequests, setJobRequests } = useContext(JobRequestsContext);
    const { purchasingRequests, fetchPurchasingRequests, setPurchasingRequests } = useContext(PurchasingRequestsContext);
    const { vehicleRequests, fetchVehicleRequests, setVehicleRequests } = useContext(VehicleRequestsContext);
    const { venueRequests, fetchVenueRequests, setVenueRequests } = useContext(VenueRequestsContext);
    const { user } = useContext(AuthContext);


    const fetchData = async () => {
        try {
            // Retrieve user preferences
            const userPreferences = JSON.parse(localStorage.getItem('userPreference'));
            if (userPreferences?.kanban_config) {
                setColumns(userPreferences.kanban_config.columns);
            }

            // Fetch status list from the backend
            const { data } = await axios.get('/settings/status', { withCredentials: true });
            if (Array.isArray(data.status)) {
                setStatus(data.status);
            } else {
            console.error("Invalid response: 'status' is not an array");
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    // Fetch user preferences and departments on mount
    useEffect(() => {
        fetchData();
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
            console.error('Status update failed:', error);
        }
    };

    const handleOnDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const referenceNumber = draggableId.toString();
        const newStatus = destination.droppableId;

        setRequests((prevRequests) =>
            prevRequests.map((task) =>
                task.reference_number === referenceNumber ? { ...task, status: newStatus } : task
            )
        );

        handleStatusChange(referenceNumber, newStatus);
    };

    const filteredTasks = (tasks) => {
        return tasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery) || 
            task.reference_number.toLowerCase().includes(searchQuery)
        );
    };

    const addColumn = async (status) => {
        if (!status) return;

        const newColumn = { id: columns.length + 1, name: status};
        const updatedColumns = [...columns, newColumn];

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
            console.error('Failed to add column:', error);

        }
    };

    return (
        <div className="h-full bg-white rounded-lg w-full mt-0 p-1 flex flex-col justify-between">
            <div className="flex flex-col gap-2 h-full">
                <CardHeader floated={false} shadow={false} className="rounded-none min-h-fit pb-2">
                    <div className="mb-1 flex items-center justify-between gap-5">
                        <Typography color="black" className="text-lg px-3 font-bold">Kanban Board</Typography>
                    </div>

                    <div className="flex items-center justify-between px-3 gap-4 mt-2">
                        {/* Search Bar */}
                        <div className="relative w-1/4 max-w-sm min-w-[150px]">
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                            />
                            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
                                <MagnifyingGlass size={16} />
                            </span>
                        </div>

                        {/* Request Type Selection */}
                        <div className="flex justify-end items-center gap-2 w-1/2">
                            <span className="text-xs font-semibold whitespace-nowrap text-gray-700">GROUP BY</span>
                            <Menu placement="bottom-end">
                                <MenuHandler>
                                    <button className="font-semibold border border-slate-300 text-sm py-2 px-5 w-fit rounded-md shadow-sm focus:outline-none focus:border-slate-500 hover:border-slate-400">
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

                            {/* Add Column Menu */}
                            <Menu placement="bottom-end">
                                <MenuHandler>
                                    <button className="font-semibold border border-slate-300 text-sm py-2 px-5 rounded-md shadow-sm focus:outline-none focus:border-slate-500 hover:border-slate-400">
                                        Add Column
                                    </button>
                                </MenuHandler>
                                <MenuList>
                                    {status.map((stat) => (
                                        <MenuItem key={stat.id} onClick={() => addColumn(stat.status)}>
                                            {stat.status}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="custom-scrollbar h-full pt-0">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <div className="flex justify-between items-center flex-row gap-3">
                            {columns.map((column) => (
                                <Column
                                key={column.name}
                                title={column.name}
                                tasks={filteredTasks(requests.filter(task => task.status === column.name))}
                                id={column.name}
                                columnID={column.id}
                                requestType={requestType}
                                setRequests={setRequests}
                                user={user}
                                columns={columns}
                                setColumns={setColumns}
                                fetchData={fetchData} />
                            ))}
                        </div>
                    </DragDropContext>
                </CardBody>
            </div>
        </div>
    );
}

export default KanbanBoard;
