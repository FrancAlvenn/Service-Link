import JobRequestModel from "./JobRequestModel.js";
import JobRequestDetails from "./JobRequestDetails.js";

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


export { JobRequestModel, JobRequestDetails };
