import DepartmentsModel from "./SettingsModels/DeparmentsModel.js";
import Designation from "./SettingsModels/DesignationModel.js";
import Organization from "./SettingsModels/OrganizationModel.js";
import Priority from "./SettingsModels/PriorityModel.js";
import Status from "./SettingsModels/StatusModel.js";

import AssetsModel from "./AssetsModel.js";
import ImageModel from "./ImageModel.js";
import { JobRequestModel, JobRequestDetails, PurchasingRequestModel, PurchasingRequestDetails, VenueRequests, VenueRequestDetail } from "./index.js";
import SystemLogsModel from "./SystemLogs.js";
import Ticket from "./TicketModel.js";
import UserModel from "./UserModel.js";
import VehicleRequestModel from "./VehicleRequestModel.js";

const models = [
    DepartmentsModel,
    Designation,
    Organization,
    Priority,
    Status,
    AssetsModel,
    ImageModel,
    JobRequestModel,
    JobRequestDetails,
    PurchasingRequestModel,
    PurchasingRequestDetails,
    VenueRequests,
    VenueRequestDetail,
    SystemLogsModel,
    Ticket,
    UserModel,
    VehicleRequestModel
]; // Add all models to this array

const syncModels = async (sequelizeInstance) => {
  try {
    await sequelizeInstance.sync({ force: true }); // Safely update schema
    console.log("✅ All models synchronized successfully.");
    
    // Seed default values
    await seedData();

  } catch (error) {
    console.error("❌ Error synchronizing models:", error);
  }
};

// Function to seed default data (if not already present)
const seedData = async () => {
  await seedStatuses();
  await seedPriorities();
  await seedDepartments();
  console.log("✅ Default data seeded.");
};

// Seed Statuses
const seedStatuses = async () => {
  const defaultStatuses = [
    { status: "Approved", color: "green", description: "Request has been approved", archived: false },
    { status: "Rejected", color: "red", description: "Request has been rejected", archived: false },
    { status: "Approved w/ Condition", color: "orange", description: "Request approved with conditions", archived: false },
    { status: "Pending", color: "amber", description: "Request is currently under review", archived: false },
    { status: "In Progress", color: "blue", description: "Request is being processed", archived: false },
    { status: "On Hold", color: "gray", description: "Request is on hold due to some reasons", archived: false },
    { status: "Completed", color: "green", description: "Request has been completed", archived: false },
    { status: "Canceled", color: "pink", description: "Request has been canceled", archived: false },
  ];

  for (const status of defaultStatuses) {
    await Status.findOrCreate({
      where: { status: status.status },
      defaults: status, // Only inserts if status does not exist
    });
  }
};


// Seed Priorities
const seedPriorities = async () => {
  const defaultPriorities = [
    { priority: "Low", description: "Non-urgent requests" },
    { priority: "Medium", description: "Important but not urgent" },
    { priority: "High", description: "Urgent requests" },
  ];

  for (const priority of defaultPriorities) {
    await Priority.findOrCreate({
      where: { priority: priority.priority },
      defaults: priority,
    });
  }
};

// Seed Departments
const seedDepartments = async () => {
  const defaultDepartments = [
    { name: "College of Accountancy", description: "Department for Accounting and Finance" },
    { name: "College of Arts and Sciences", description: "Department for Academic Programs" },
    { name: "College of Business Administration", description: "Department for Business and Management" },
    { name: "College of Computer Studies", description: "Department for IT and CS programs" },
    { name: "College of Education", description: "Department for Teacher Education" },
    { name: "College of Health Science", description: "Department for Nursing and Allied Health" },
    { name: "College of Hospitality Management and Tourism", description: "Department for Hospitality and Tourism" },
    { name: "College of Maritime Engineering", description: "Department for Marine Engineering" },
    { name: "School of Mechanical Engineering", description: "Department for Mechanical Engineering" },
    { name: "School of Psychology", description: "Department for Psychology programs" }
  ];

  for (const department of defaultDepartments) {
    await DepartmentsModel.findOrCreate({
      where: { name: department.name },
      defaults: department,
    });
  }
};

export { syncModels };

