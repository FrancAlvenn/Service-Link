import express from 'express'
import authRoutes from './routes/auth.js'
import jobRequestRoutes from './routes/job_request.js'
import venueRequestRoutes from './routes/venue_request.js'


const app = express()


app.use(express.json())

//Routes for api requests -- connected to routes/ directory

//Auth Route
app.use("/service_link_api/auth", authRoutes);

//Job_Request Route
app.use("/service_link_api/job_request", jobRequestRoutes)

//Venue Request Route
app.use("/service_link_api/venue_request", venueRequestRoutes)


app.listen(8080, () => {
    console.log("Connected");
})