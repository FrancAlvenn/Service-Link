import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import jobRequestRoutes from "./routes/job_request.js";
import venueRequestRoutes from "./routes/venue_request.js";
import vehicleRequestRoutes from "./routes/vehicle_request.js";
import settingsRoutes from "./routes/settings.js";
import ticketRoutes from "./routes/ticketing.js";
import userRoutes from "./routes/user_management.js";
import purchasingRequestRoutes from "./routes/purchasing_request.js";
import requestActivityRoutes from "./routes/request_activity.js";
import assetRoutes from "./routes/assets.js";
import assetAssignmentRoutes from "./routes/asset_assignment.js";
import employeeRoutes from "./routes/employee.js";

import sequelize from "./database.js";
import { syncModels } from "./models/syncModels.js";

import { verifyToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://b8eb-2001-4452-2f2-9300-30f9-3915-2282-42e8.ngrok-free.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());

//Routes for api requests -- connected to routes/ directory

//Auth Route
app.use("/service_link_api/auth", authRoutes);

//Job_Request Route
app.use("/service_link_api/job_request", verifyToken, jobRequestRoutes);

//Venue Request Route
app.use("/service_link_api/venue_request", verifyToken, venueRequestRoutes);

//Vehicle Request Route
app.use("/service_link_api/vehicle_request", verifyToken, vehicleRequestRoutes);

//Purchasing Request Route
app.use(
  "/service_link_api/purchasing_request",
  verifyToken,
  purchasingRequestRoutes
);

//Settings Route
app.use("/service_link_api/settings", verifyToken, settingsRoutes);

//Ticket Route
app.use("/service_link_api/ticket", verifyToken, ticketRoutes);

//User Management
app.use("/service_link_api/users", verifyToken, userRoutes);

//Request Activity
app.use(
  "/service_link_api/request_activity",
  verifyToken,
  requestActivityRoutes
);

//Asset Management
app.use("/service_link_api/assets", verifyToken, assetRoutes);

//Asset Assignment Logs
app.use(
  "/service_link_api/asset_assignment",
  verifyToken,
  assetAssignmentRoutes
);

app.use("", verifyToken);

//Employee Management
app.use("/service_link_api/employees", verifyToken, employeeRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  console.log("✅ Connected");
  await syncModels(sequelize); // Sync all models
});
