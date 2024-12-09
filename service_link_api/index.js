import express from 'express'
import authRoutes from './routes/auth.js'
import jobRequestRoutes from './routes/job_request.js'
import venueRequestRoutes from './routes/venue_request.js'
import vehicleRequestRoutes from './routes/vehicle_request.js'
import settingsRoutes from './routes/settings.js';
import ticketRoutes from './routes/ticketing.js';
import userRoutes from './routes/user_management.js';
import purchasingRequestRoutes from './routes/purchasing_request.js';

import sequelize from './database.js'
import { syncModels } from './models/syncModels.js';

const app = express()


app.use(express.json())

//Routes for api requests -- connected to routes/ directory

//Auth Route
app.use("/service_link_api/auth", authRoutes);

//Job_Request Route
app.use("/service_link_api/job_request", jobRequestRoutes)

//Venue Request Route
app.use("/service_link_api/venue_request", venueRequestRoutes)

//Vehicle Request Route
app.use("/service_link_api/vehicle_request", vehicleRequestRoutes)

//Purchasing Request Route
app.use("/service_link_api/purchasing_request", purchasingRequestRoutes)

//Settings Route
app.use("/service_link_api/settings", settingsRoutes)

//Ticket Route
app.use("/service_link_api/ticket", ticketRoutes)

//User Management
app.use("/service_link_api/users", userRoutes)


const PORT = process.env.PORT || 8080

app.listen(PORT, async () => {
    console.log("Connected");
    await syncModels(sequelize); // Sync all models
})