

export const getAllVenueRequests = (request,response) => {
    response.status(200).json("All Venue Request")
}

export const createVenueRequest = (request,response) => {
    response.status(200).json("Create Venue Request")
}

export const getVenueRequestById = (request,response) => {
    response.status(200).json("Get Venue Request by ID")
}

export const updateVenueRequest = (request,response) => {
    response.status(200).json("Update Venue Request")
}

export const deleteVenueRequest = (request,response) => {
    response.status(200).json("Delete Venue Request")
}

export const getVenueRequestByStatus = (request,response) => {
    response.status(200).json("Get Venue Request by Status")
}

export const updateVenueRequestStatus = (request,response) => {
    response.status(200).json("Update Venue Request Status")
}

export const getVenueRequestCountByStatus = (request,response) => {
    response.status(200).json("Get Venue Request by Status")
}

