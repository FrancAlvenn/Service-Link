import JobRequestModel from "./JobRequestModel.js";
import JobRequestDetails from "./JobRequestDetails.js";
import PurchasingRequestModel from "./PurchasingRequestModel.js";
import PurchasingRequestDetails from "./PurchasingRequestDetails.js";
import VenueRequests from "./VenueRequestModel.js";
import VenueRequestDetail from "./VenueRequestDetails.js";
import DepartmentsModel from "./SettingsModels/DeparmentsModel.js";
import DesignationModel from "./SettingsModels/DesignationModel.js";
import UserModel from "./UserModel.js";
import VehicleRequestModel from "./VehicleRequestModel.js";
import Organization from "./SettingsModels/OrganizationModel.js";
import AssetModel from "./AssetsModel.js";

// Define associations
JobRequestModel.hasMany(JobRequestDetails, {
  foreignKey: "job_request_id",
  sourceKey: "reference_number",
  as: "details",
});

JobRequestModel.belongsTo(UserModel, {
  foreignKey: "requester",
  targetKey: "reference_number",
  as: "requester_details",
});

JobRequestDetails.belongsTo(JobRequestModel, {
  foreignKey: "job_request_id",
  targetKey: "reference_number",
});

PurchasingRequestDetails.belongsTo(PurchasingRequestModel, {
  foreignKey: "purchasing_request_id",
  targetKey: "reference_number",
});

PurchasingRequestModel.belongsTo(UserModel, {
  foreignKey: "requester",
  targetKey: "reference_number",
  as: "requester_details",
});

PurchasingRequestModel.hasMany(PurchasingRequestDetails, {
  foreignKey: "purchasing_request_id",
  sourceKey: "reference_number",
  as: "details",
});

VenueRequests.hasMany(VenueRequestDetail, {
  foreignKey: "venue_request_id",
  sourceKey: "reference_number",
  as: "details",
});

VenueRequests.belongsTo(AssetModel, {
  foreignKey: "venue_id",
  targetKey: "asset_id",
  as: "venue_details",
});

VenueRequests.belongsTo(UserModel, {
  foreignKey: "requester",
  targetKey: "reference_number",
  as: "requester_details",
});

VenueRequestDetail.belongsTo(VenueRequests, {
  foreignKey: "venue_request_id",
  targetKey: "reference_number",
  as: "request",
});

VehicleRequestModel.belongsTo(UserModel, {
  foreignKey: "requester",
  targetKey: "reference_number",
  as: "requester_details",
});

UserModel.belongsTo(DepartmentsModel, {
  foreignKey: "department_id",
  targetKey: "id",
  as: "department",
});

UserModel.belongsTo(DesignationModel, {
  foreignKey: "designation_id",
  targetKey: "id",
  as: "designation",
});

UserModel.belongsTo(Organization, {
  foreignKey: "organization_id",
  targetKey: "id",
  as: "organization",
});

export {
  JobRequestModel,
  JobRequestDetails,
  PurchasingRequestModel,
  PurchasingRequestDetails,
  VenueRequests,
  VenueRequestDetail,
  VehicleRequestModel,
  UserModel,
  AssetModel,
};
