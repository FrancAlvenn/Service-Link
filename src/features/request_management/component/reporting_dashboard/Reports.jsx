import React, { useContext } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Typography } from "@material-tailwind/react";
import { JobRequestsContext } from "../../context/JobRequestsContext";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../context/VenueRequestsContext";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext";
import { UserContext } from "../../../../context/UserContext";
import Header from "../../../../layouts/header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { jobRequests } = useContext(JobRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);

  const allRequests = [
    ...jobRequests.map((r) => ({ ...r, request_type: "Job" })),
    ...vehicleRequests.map((r) => ({ ...r, request_type: "Vehicle" })),
    ...venueRequests.map((r) => ({ ...r, request_type: "Venue" })),
    ...purchasingRequests.map((r) => ({ ...r, request_type: "Purchasing" })),
  ];

  const { allUserInfo } = useContext(UserContext);

  // Count access levels from allUserInfo
  const getAccessLevelDistribution = () => {
    const map = {};
    if (!allUserInfo) return map;

    allUserInfo.forEach((user) => {
      const key = user.access_level || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });

    return map;
  };

  const countByField = (field) => {
    const map = {};
    allRequests.forEach((req) => {
      const key = req[field];
      if (!key || key === "Unknown") return; // Skip empty or 'Unknown' values
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  };

  const countStatusFunnel = () => {
    const funnel = { Submitted: 0, Reviewed: 0, Approved: 0, Completed: 0 };
    allRequests.forEach(({ status }) => {
      if (status === "Submitted") funnel.Submitted++;
      if (["Reviewed", "Pending", "In Review"].includes(status))
        funnel.Reviewed++;
      if (status === "Approved") funnel.Approved++;
      if (status === "Completed") funnel.Completed++;
    });
    return funnel;
  };

  const getMonthlyCounts = () => {
    const counts = Array(12).fill(0);
    allRequests.forEach((req) => {
      const month = new Date(req.createdAt).getMonth();
      counts[month]++;
    });
    return counts.slice(0, 6); // Jan–Jun
  };

  const getWeeklyTrends = () => {
    const approved = [0, 0, 0, 0];
    const rejected = [0, 0, 0, 0];
    allRequests.forEach(({ status, createdAt }) => {
      const day = new Date(createdAt).getDate();
      const week = Math.floor((day - 1) / 7); // 0–3
      if (status === "Approved") approved[week]++;
      if (status === "Rejected") rejected[week]++;
    });
    return { approved, rejected };
  };

  const funnelCounts = countStatusFunnel();
  const departmentCounts = countByField("department");
  const typeCounts = countByField("request_type");
  const statusCounts = countByField("status");
  const vehicleCounts = countByField("vehicle_requested");
  const venueCounts = countByField("venue_requested");
  const archiveCounts = {
    Active: allRequests.filter((r) => r.archived !== true).length,
    Archived: allRequests.filter((r) => r.archived === true).length,
  };
  const roleCounts = getAccessLevelDistribution();

  const { approved, rejected } = getWeeklyTrends();

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-900 mt-0 px-3 flex flex-col justify-between transition-colors">
      <Header title={"Reports"} description={"See information about reports"} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. Request Type Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">Request Type Breakdown</h2>
          <Pie
            data={{
              labels: Object.keys(typeCounts),
              datasets: [
                {
                  label: "Types",
                  data: Object.values(typeCounts),
                  backgroundColor: [
                    "#4F46E5",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#6366F1",
                  ],
                },
              ],
            }}
          />
        </div>

        {/* 2. Request Status Distribution */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">
            Request Status Distribution
          </h2>
          <Doughnut
            data={{
              labels: Object.keys(statusCounts),
              datasets: [
                {
                  label: "Statuses",
                  data: Object.values(statusCounts),
                  backgroundColor: ["#22C55E", "#EAB308", "#EF4444", "#3B82F6"],
                },
              ],
            }}
          />
        </div>

        {/* 3. Monthly Requests */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">Monthly Requests</h2>
          <Bar
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [
                {
                  label: "Requests",
                  data: getMonthlyCounts(),
                  backgroundColor: "#3B82F6",
                },
              ],
            }}
          />
        </div>

        {/* 4. Approval Trends */}
        <div className="bg-white rounded-2xl shadow-md p-4 col-span-1 sm:col-span-2 h-fit">
          <h2 className="text-lg font-medium mb-2">
            Approval Trends Over Time
          </h2>
          <Line
            data={{
              labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
              datasets: [
                {
                  label: "Approved",
                  data: approved,
                  borderColor: "#10B981",
                  backgroundColor: "rgba(16,185,129,0.1)",
                  fill: true,
                  tension: 0.3,
                },
                {
                  label: "Rejected",
                  data: rejected,
                  borderColor: "#EF4444",
                  backgroundColor: "rgba(239,68,68,0.1)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
          />
        </div>

        {/* 5. Requests per Department */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">Requests per Department</h2>
          <Bar
            data={{
              labels: Object.keys(departmentCounts),
              datasets: [
                {
                  label: "Requests",
                  data: Object.values(departmentCounts),
                  backgroundColor: "#8B5CF6",
                },
              ],
            }}
          />
        </div>

        {/* 6. Top Requested Vehicles */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">Top Requested Vehicles</h2>
          <Bar
            data={{
              labels: Object.keys(vehicleCounts),
              datasets: [
                {
                  label: "Reservations",
                  data: Object.values(vehicleCounts),
                  backgroundColor: "#0EA5E9",
                },
              ],
            }}
          />
        </div>

        {/* 7. Most Reserved Venues */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">Most Reserved Venues</h2>
          <Bar
            data={{
              labels: Object.keys(venueCounts),
              datasets: [
                {
                  label: "Reservations",
                  data: Object.values(venueCounts),
                  backgroundColor: "#F97316",
                },
              ],
            }}
          />
        </div>

        {/* 8. Approval Funnel */}
        <div className="bg-white rounded-2xl shadow-md p-4 col-span-1 sm:col-span-2 h-fit">
          <h2 className="text-lg font-medium mb-2">Approval Funnel</h2>
          <Bar
            data={{
              labels: Object.keys(funnelCounts),
              datasets: [
                {
                  label: "Request Flow",
                  data: Object.values(funnelCounts),
                  backgroundColor: "#6366F1",
                },
              ],
            }}
            options={{ indexAxis: "y" }}
          />
        </div>

        {/* 9. Archived vs Active Requests */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2">Archived vs Active</h2>
          <Doughnut
            data={{
              labels: Object.keys(archiveCounts),
              datasets: [
                {
                  label: "Request Status",
                  data: Object.values(archiveCounts),
                  backgroundColor: ["#3B82F6", "#9CA3AF"],
                },
              ],
            }}
          />
        </div>

        {/* 10. User Count */}
        <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
          <h2 className="text-lg font-medium mb-2">
            Access Control Distribution
          </h2>
          <Pie
            data={{
              labels: Object.keys(roleCounts).map((role) => role.toUpperCase()),
              datasets: [
                {
                  label: "Roles",
                  data: Object.values(roleCounts),
                  backgroundColor: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"],
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
