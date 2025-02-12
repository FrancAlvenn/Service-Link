import { JobRequestsProvider } from "./JobRequestsContext";
import { PurchasingRequestsProvider } from "./PurchasingRequestsContext";
import { VehicleRequestsProvider } from "./VehicleRequestsContext";
import { VenueRequestsProvider } from "./VenueRequestsContext";
// import { PurchasingRequestsProvider } from "./PurchasingRequestsContext";
// import { VehicleRequestsProvider } from "./VehicleRequestsContext";
// import { VenueRequestsProvider } from "./VenueRequestsContext";

/**
 * This component wraps the entire application in all the necessary
 * contexts required for the requests management feature. This includes
 * contexts for job requests, purchasing requests, vehicle requests, and
 * venue requests.
 *
 * This component should be used at the top level of the application, and
 * should wrap all other components.
 */
export function RequestsProviderWrapper ({ children })  {
  return (
    <JobRequestsProvider>
      <PurchasingRequestsProvider>
        <VehicleRequestsProvider>
          <VenueRequestsProvider>
            {children}
          </VenueRequestsProvider>
        </VehicleRequestsProvider>
      </PurchasingRequestsProvider>
    </JobRequestsProvider>
  );
};


