import { CreateContext, useEffect, useState } from "react";

export const RequestsContext = CreateContext();

function getAllRequests() {
    return [1];
}


export const RequestsProvider = ({ children }) => {

    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

    // On initial load, get the requests
    useEffect(() => {
        setRequests(getAllRequests());
    }, []);

    




    return <RequestsContext.Provider value={{}}>{children}</RequestsContext.Provider>;
}