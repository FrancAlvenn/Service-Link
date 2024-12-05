import JobRequestModel from "./JobRequestModel.js";
import JobRequestDetails from "./JobRequestDetails.js";
import PurchasingRequestModel from "./PurchasingRequestModel.js";
import PurchasingRequestDetails from "./PurchasingRequestDetails.js";

// Define associations
JobRequestModel.hasMany(JobRequestDetails, {
  foreignKey: "job_request_id",
  sourceKey: "reference_number",
  as: "details",
});

JobRequestDetails.belongsTo(JobRequestModel, {
  foreignKey: "job_request_id",
  targetKey: "reference_number",
});


PurchasingRequestDetails.belongsTo(PurchasingRequestModel, {
  foreignKey: "purchasing_request_id",
  targetKey: "reference_number",

});

PurchasingRequestModel.hasMany(PurchasingRequestDetails, {
  foreignKey: "purchasing_request_id",
  sourceKey: "reference_number",
  as: "details",
});


export { JobRequestModel, JobRequestDetails, PurchasingRequestModel, PurchasingRequestDetails };
