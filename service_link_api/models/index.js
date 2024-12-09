import JobRequestModel from "./JobRequestModel.js";
import JobRequestDetails from "./JobRequestDetails.js";
import PurchasingRequestModel from "./PurchasingRequestModel.js";
import PurchasingRequestDetails from "./PurchasingRequestDetails.js";
import VenueRequests from "./VenueRequestModel.js";
import VenueRequestDetail from "./VenueRequestDetails.js";

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

VenueRequests.hasMany(VenueRequestDetail, {
  foreignKey: "venue_request_id",
  sourceKey: "reference_number",
  as: "details",
});

VenueRequestDetail.belongsTo(VenueRequests, {
  foreignKey: "venue_request_id",
  targetKey: "reference_number",
  as: "request",
});



export { JobRequestModel, JobRequestDetails, PurchasingRequestModel, PurchasingRequestDetails, VenueRequests, VenueRequestDetail };
