import {database} from "../database.js"


export const getAllJobRequests = (request,response) => {

    //Change later for categorized get :: REFERENCE - const query = req.query.cat ? "SELECT * FROM posts WHERE category = ?" : "SELECT * FROM posts";
    const query = `SELECT * FROM job_request`;

    //Execute the query to get all the job request
    database.query(query,(error, data) =>{
        if (error) return response.status(500).json("There is a server error!" + error);

        return response.status(200).json(data)
    })
}

export const createJobRequest = (request,response) => {

    //Formatted fate for due date - 3 days relative to the date of creation of the request
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    let formattedDate = currentDate.toISOString().split('T')[0];

    //Insert query for the job request
    const query = `INSERT INTO job_request (request_title, request_desc, created_by, assigned_to, status_id, urgency, impact, affected_field, priority_level_id, due_date)
                   VALUES (?, ? ,? ,? ,? ,? ,? ,? ,? ,?)`;

    //Get values from the request body
    const values = [
    request.body.request_title,
    request.body.request_desc,
    request.body.created_by,
    request.body.assigned_to || 1,
    request.body.status_id || 1,
    request.body.urgency || 'N/A',
    request.body.impact || 'N/A',
    request.body.affected_field || 'N/A',
    request.body.priority_level || 1,
    formattedDate
    ];

    //Execute the query to insert into database
    database.query(query,  values, (error, data) =>{
        //Error handler
        if (error) return response.status(500).json("There is a server error!" + error);

        //Success handler
        return response.status(200).json({message: "Job request has been successfully created."});
    })

}

export const getJobRequestById = (request,response) => {

    //Select query with where clause for specific search
    const query = `SELECT * FROM job_request WHERE request_id = ?`;

    //Get value from params
    const value = request.params.request_id

    // Execute the query with the specified request_id
    database.query(query, [value], (error, data) => {
        //Error handler
        if (error) return response.status(500).json({ message: "There was a server error!", error });

        //Not found handler
        if (data.length === 0) {
            return response.status(404).json({ message: "Job request not found" });
        }

        // Return the found job request
        return response.status(200).json(data[0]);
    });

}

export const updateJobRequest = (request,response) => {
    response.status(200).json("Update Job Request")
}

export const deleteJobRequest = (request,response) => {

    //Delete query with the specified request_id
    const query = `DELETE FROM job_request WHERE request_id = ?`;

    //Get value from params
    const value = request.params.request_id

    // Execute the query with the specified request_id
    database.query(query, [value], (error, data) => {
        //Error handler
        if (error) return response.status(500).json({ message: "There was a server error!", error });

        // Return the found job request
        return response.status(200).json({message: "Job request successfully deleted!"});
    });
}

export const getJobRequestsByStatus = (request,response) => {
    response.status(200).json("Get Job Request by Status")
}

export const assignJobRequest = (request,response) => {
    response.status(200).json("Assign Job Request")
}

export const updateJobRequestStatus = (request,response) => {
    response.status(200).json("Update Job Request Status")
}

export const getJobRequestCountByStatus = (request,response) => {
    response.status(200).json("Get Job Request by Status")
}

