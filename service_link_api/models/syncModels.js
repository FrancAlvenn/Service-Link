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
    await sequelizeInstance.sync({ force: true }); // Sync all models
    console.log("All models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
};

export { models, syncModels };
