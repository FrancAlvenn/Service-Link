import { useContext, useMemo } from "react";
import { JobRequestsContext } from "@/context/JobRequestsContext";
import { PurchasingRequestsContext } from "@/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "@/context/VehicleRequestsContext";
import { VenueRequestsContext } from "@/context/VenueRequestsContext";

const useRequestReportData = () => {
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);

  const requestData = useMemo(() => {
    const mapRequests = (requests, type) =>
      requests.map((request) => ({
        type,
        status: request.status ?? "pending",
        created_at: request.createdAt ?? request.created_at,
        user: `${request?.requested_by?.first_name || "N/A"} ${request?.requested_by?.last_name || ""}`.trim(),
      }));

    return [
      ...mapRequests(jobRequests, "Job Request"),
      ...mapRequests(purchasingRequests, "Purchasing Request"),
      ...mapRequests(vehicleRequests, "Vehicle Request"),
      ...mapRequests(venueRequests, "Venue Request"),
    ];
  }, [jobRequests, purchasingRequests, vehicleRequests, venueRequests]);

  return requestData;
};

export default useRequestReportData;
