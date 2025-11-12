/*  src/pages/Reports/Reports.jsx  */
import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
} from "react-chartjs-2";
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
import {
  Typography,
  Collapse,
  Spinner,
  Button,
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { JobRequestsContext } from "../../context/JobRequestsContext";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../context/VenueRequestsContext";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext";
import { UserContext } from "../../../../context/UserContext";
import Header from "../../../../layouts/header";
import { GoogleGenAI } from "@google/genai";
import {
  Sparkle,
  MagnifyingGlass,
  Calendar,
  ArrowClockwise,
  Filter,
} from "@phosphor-icons/react";
import dayjs from "dayjs";

/* --------------------------------------------------------------
   Gemini init
---------------------------------------------------------------- */
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

/* --------------------------------------------------------------
   HTML formatter
---------------------------------------------------------------- */
const formatResponse = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
    .replace(/•/g, "<li>")
    .replace(/^\d+\.\s/gm, "<strong>$1</strong>")
    .replace(/<li>/g, "</ul><ul><li>")
    .replace(/<\/ul><ul>/g, "")
    .replace(/^/, "<ul>")
    .replace(/$/, "</ul>");
};

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

/* --------------------------------------------------------------
   Helper: safe array / object
---------------------------------------------------------------- */
const safeArray = (v) => v ?? [];
const safeObj = (v) => v ?? {};

/* --------------------------------------------------------------
   Component
---------------------------------------------------------------- */
const Reports = () => {
  /* ------------------- Contexts ------------------- */
  const ctxJob = useContext(JobRequestsContext) || {};
  const ctxVehicle = useContext(VehicleRequestsContext) || {};
  const ctxVenue = useContext(VenueRequestsContext) || {};
  const ctxPurchasing = useContext(PurchasingRequestsContext) || {};
  const ctxUser = useContext(UserContext) || {};

  const { jobRequests } = ctxJob;
  const { vehicleRequests } = ctxVehicle;
  const { venueRequests } = ctxVenue;
  const { purchasingRequests } = ctxPurchasing;
  const { allUserInfo } = ctxUser;

  /* ------------------- Raw data ------------------- */
  const rawRequests = useMemo(() => {
    const list = [
      ...Object.values(safeObj(jobRequests)).map((r) => ({
        ...r,
        request_type: "Job",
      })),
      ...Object.values(safeObj(vehicleRequests)).map((r) => ({
        ...r,
        request_type: "Vehicle",
      })),
      ...Object.values(safeObj(venueRequests)).map((r) => ({
        ...r,
        request_type: "Venue",
      })),
      ...Object.values(safeObj(purchasingRequests)).map((r) => ({
        ...r,
        request_type: "Purchasing",
      })),
    ];
    return list;
  }, [jobRequests, vehicleRequests, venueRequests, purchasingRequests]);

  /* ------------------- Filter state ------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredRequests = useMemo(() => {
    let list = rawRequests;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.title ?? "").toLowerCase().includes(q) ||
          (r.reference_number ?? "").toLowerCase().includes(q)
      );
    }

    // Type
    if (selectedType) {
      list = list.filter((r) => r.request_type === selectedType);
    }

    // Date range
    if (dateRange.start) {
      const start = dayjs(dateRange.start).startOf("day");
      list = list.filter((r) =>
        dayjs(r.created_at ?? r.createdAt).isAfter(start)
      );
    }
    if (dateRange.end) {
      const end = dayjs(dateRange.end).endOf("day");
      list = list.filter((r) =>
        dayjs(r.created_at ?? r.createdAt).isBefore(end)
      );
    }

    return list;
  }, [rawRequests, searchQuery, selectedType, dateRange]);

  /* ------------------- Aggregations ------------------- */
  const countByField = (field) => {
    const map = {};
    filteredRequests.forEach((req) => {
      const key = req[field];
      if (!key || key === "Unknown") return;
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  };

  const countStatusFunnel = () => {
    const funnel = { Submitted: 0, Reviewed: 0, Approved: 0, Completed: 0 };
    filteredRequests.forEach(({ status }) => {
      if (status === "Submitted") funnel.Submitted++;
      if (["Reviewed", "Pending", "In Review"].includes(status ?? "")) funnel.Reviewed++;
      if (status === "Approved") funnel.Approved++;
      if (status === "Completed") funnel.Completed++;
    });
    return funnel;
  };

  const getMonthlyCounts = () => {
    const counts = Array(12).fill(0);
    filteredRequests.forEach((req) => {
      const d = new Date(req.created_at ?? req.createdAt);
      if (!isNaN(d.getTime())) counts[d.getMonth()]++;
    });
    return counts.slice(0, 6);
  };

  const getWeeklyTrends = () => {
    const approved = [0, 0, 0, 0];
    const rejected = [0, 0, 0, 0];
    filteredRequests.forEach(({ status, created_at, createdAt }) => {
      const d = new Date(created_at ?? createdAt);
      if (isNaN(d.getTime())) return;
      const day = d.getDate();
      const week = Math.floor((day - 1) / 7);
      if (status === "Approved") approved[week]++;
      if (status === "Rejected") rejected[week]++;
    });
    return { approved, rejected };
  };

  const getAvgResolutionDays = () => {
    const completed = filteredRequests.filter(
      (r) =>
        r.status === "Completed" &&
        (r.created_at ?? r.createdAt) &&
        (r.updated_at ?? r.updatedAt)
    );
    if (!completed.length) return "0";
    const total = completed.reduce((acc, r) => {
      const start = new Date(r.created_at ?? r.createdAt);
      const end = new Date(r.updated_at ?? r.updatedAt);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    return (total / completed.length).toFixed(1);
  };

  const getTopRequesters = () => {
    const map = {};
    filteredRequests.forEach((r) => {
      const name = r.requester_name ?? r.requester ?? "Unknown";
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
    );
  };

  const getRejectionReasons = () => {
    const map = {};
    filteredRequests
      .filter((r) => r.status === "Rejected")
      .forEach((r) => {
        const txt = (r.remarks ?? "").slice(0, 60) || "No reason";
        map[txt] = (map[txt] ?? 0) + 1;
      });
    return map;
  };

  const accessLevelDistribution = () => {
    const map = {};
    safeArray(allUserInfo).forEach((u) => {
      const key = u.access_level ?? "Unknown";
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  };

  /* ------------------- Data objects ------------------- */
  const typeCounts = countByField("request_type");
  const statusCounts = countByField("status");
  const departmentCounts = countByField("department");
  const vehicleCounts = countByField("vehicle_requested");
  const venueCounts = countByField("venue_requested");
  const funnelCounts = countStatusFunnel();
  const archiveCounts = {
    Active: filteredRequests.filter((r) => !r.archived).length,
    Archived: filteredRequests.filter((r) => r.archived).length,
  };
  const roleCounts = accessLevelDistribution();
  const { approved, rejected } = getWeeklyTrends();
  const avgResolution = getAvgResolutionDays();
  const topRequesters = getTopRequesters();
  const rejectionReasons = getRejectionReasons();

  /* ------------------- AI ------------------- */
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const generateAIInsights = async () => {
    setAiLoading(true);
    setShowAI(true);

    const total = filteredRequests.length;
    const approvedRate = total
      ? ((statusCounts.Approved ?? 0) / total * 100).toFixed(1)
      : "0";

    const topDept =
      Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
    const topVehicle =
      Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
    const topVenue =
      Object.entries(venueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

    const prompt = `
  You are a BI analyst. Summarise the dashboard in **max 6 bullet points**:

  - Total requests: ${total}
  - Approval rate: ${approvedRate}%
  - Top department: ${topDept} (${departmentCounts[topDept] ?? 0})
  - Most requested vehicle: ${topVehicle} (${vehicleCounts[topVehicle] ?? 0})
  - Most booked venue: ${topVenue} (${venueCounts[topVenue] ?? 0})
  - Avg resolution (days): ${avgResolution}
  - Active / Archived: ${archiveCounts.Active} / ${archiveCounts.Archived}

  Give **actionable recommendations** (bottlenecks, trends, suggestions). Use **bold** for key numbers.`;

    try {
      // Use v1 API format (same as VenueRequestForm but with correct path)
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // v1 response path
      const raw =
        result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "No insight generated.";

      console.log("Gemini Response:", result); // Debug
      setAiInsights(formatResponse(raw));
    } catch (err) {
      console.error("Gemini Error:", err);
      setAiInsights(formatResponse("**AI Error:** Failed to generate insights."));
    } finally {
      setAiLoading(false);
    }
  };


  useEffect(() => {
    console.log(showAI);
  },[showAI])

  /* ------------------- Render ------------------- */
  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 ">
      {/* Header */}
      <div className="rounded-none min-h-fit pb-2 mt-4 mx-4">
        <Header title="Reports" description="Actionable analytics" />

        {/* FILTER BAR – EXACT STYLE FROM KANBAN */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 gap-4 mt-2 w-full">
          {/* Search */}
          {/* <div className="relative w-full max-w-[230px] min-w-[150px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span>
          </div> */}

          {/* Filters + Menus */}
          <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center gap-2 w-full">
            {/* Date Range */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                className="border border-slate-200 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-slate-400"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, start: e.target.value }))
                }
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="border border-slate-200 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-slate-400"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, end: e.target.value }))
                }
              />
            </div>

            {/* GROUP BY + Request Type */}
            <div className="flex lg:flex-row lg:justify-end items-center gap-2 w-fit">
              <span className="text-xs font-semibold whitespace-nowrap text-gray-700">
                GROUP BY
              </span>

              <Menu placement="bottom-end">
                <MenuHandler>
                  <div className="cursor-pointer w-fit">
                    <Chip
                      value={selectedType || "All"}
                      variant="filled"
                      color={
                        {
                          Job: "blue",
                          Vehicle: "amber",
                          Venue: "purple",
                          Purchasing: "green",
                        }[selectedType] || "gray"
                      }
                      className="pointer-events-none"
                    />
                  </div>
                </MenuHandler>
                <MenuList className="flex flex-col flex-wrap gap-2 px-3 py-2">
                  <MenuItem onClick={() => setSelectedType("")}>
                    <Chip value="All" variant="ghost" color="gray" className="cursor-pointer w-fit" />
                  </MenuItem>
                  <MenuItem onClick={() => setSelectedType("Job")}>
                    <Chip value="Job Requests" variant="filled" color="blue" className="cursor-pointer w-fit" />
                  </MenuItem>
                  <MenuItem onClick={() => setSelectedType("Purchasing")}>
                    <Chip value="Purchasing Requests" variant="filled" color="green" className="cursor-pointer w-fit" />
                  </MenuItem>
                  <MenuItem onClick={() => setSelectedType("Vehicle")}>
                    <Chip value="Vehicle Requests" variant="filled" color="amber" className="cursor-pointer w-fit" />
                  </MenuItem>
                  <MenuItem onClick={() => setSelectedType("Venue")}>
                    <Chip value="Venue Requests" variant="filled" color="purple" className="cursor-pointer w-fit" />
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Reset */}
              <Button
                size="sm"
                variant="outlined"
                color="gray"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("");
                  setDateRange({ start: "", end: "" });
                }}
                className="flex items-center gap-1"
              >
                <ArrowClockwise size={16} />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 px-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <Typography className="text-sm text-gray-600 dark:text-gray-400">
            Total Requests
          </Typography>
          <Typography className="text-2xl font-bold">
            {filteredRequests.length}
          </Typography>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <Typography className="text-sm text-gray-600 dark:text-gray-400">
            Approval Rate
          </Typography>
          <Typography className="text-2xl font-bold">
            {filteredRequests.length
              ? ((statusCounts.Approved ?? 0) / filteredRequests.length * 100).toFixed(1)
              : 0}%
          </Typography>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <Typography className="text-sm text-gray-600 dark:text-gray-400">
            Avg Resolution (days)
          </Typography>
          <Typography className="text-2xl font-bold">{avgResolution}</Typography>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <Typography className="text-sm text-gray-600 dark:text-gray-400">
            Open Requests
          </Typography>
          <Typography className="text-2xl font-bold">
            {statusCounts.Pending ?? 0}
          </Typography>
        </div>
      </div>

      <div className="flex justify-end mt-4 mx-3">
        <Button
          color="indigo"
          size="sm"
          onClick={generateAIInsights}
          disabled={aiLoading}
          className="flex items-center gap-2"
        >
          {aiLoading ? (
            <>
              <Spinner className="h-4 w-4" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkle size={16} />
              Generate AI Insights
            </>
          )}
        </Button>
      </div>

      {/* AI Panel */}
      <Collapse>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-slate-200 dark:border-indigo-700 rounded-2xl p-5 shadow-md mt-6 mx-3">
          <div className="flex items-center justify-between mb-3">
            <Typography className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
              <Sparkle size={20} weight="fill" className="text-indigo-600" />
              AI Insights
            </Typography>
            {/* <Button
              size="sm"
              variant="text"
              onClick={() => setShowAI(false)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Close
            </Button> */}
            <Button
              size="sm"
              variant="text"
              onClick={() => setAiInsights(null)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Reset Insight
            </Button>
          </div>

          {aiLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner className="h-4 w-4" />
              Generating…
            </div>
          ) : aiInsights ? (
            <div
              className="text-sm text-gray-700 dark:text-gray-300 space-y-1"
              dangerouslySetInnerHTML={{ __html: aiInsights }}
            />
          ) : (
            <div className="text-sm text-gray-500 italic">
              Click "Generate AI Insights" to analyze the data.
            </div>
          )}
        </div>
      </Collapse>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 px-3 pb-6">
        {/* ... (all charts from previous version – unchanged) ... */}
        {/* 1. Request Type */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Request Type
          </h2>
          <Pie
            data={{
              labels: Object.keys(typeCounts),
              datasets: [
                {
                  data: Object.values(typeCounts),
                  backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1"],
                },
              ],
            }}
          />
        </div>

        {/* 2. Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Status Distribution
          </h2>
          <Doughnut
            data={{
              labels: Object.keys(statusCounts),
              datasets: [
                {
                  data: Object.values(statusCounts),
                  backgroundColor: ["#22C55E", "#EAB308", "#EF4444", "#3B82F6"],
                },
              ],
            }}
          />
        </div>

        {/* 3. Monthly */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Monthly Requests
          </h2>
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

        {/* 4. Weekly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 col-span-1 sm:col-span-2">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Approval Trends (Weeks)
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

        {/* 5. Department */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Requests per Department
          </h2>
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

        {/* 6. Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Top Vehicles
          </h2>
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

        {/* 7. Venues */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Top Venues
          </h2>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 col-span-1 sm:col-span-2">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Approval Funnel
          </h2>
          <Bar
            data={{
              labels: Object.keys(funnelCounts),
              datasets: [
                {
                  label: "Flow",
                  data: Object.values(funnelCounts),
                  backgroundColor: "#6366F1",
                },
              ],
            }}
            options={{ indexAxis: "y" }}
          />
        </div>

        {/* 9. Archived vs Active */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Archived vs Active
          </h2>
          <Doughnut
            data={{
              labels: Object.keys(archiveCounts),
              datasets: [
                {
                  data: Object.values(archiveCounts),
                  backgroundColor: ["#3B82F6", "#9CA3AF"],
                },
              ],
            }}
          />
        </div>

        {/* 10. Access Levels */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Access Levels
          </h2>
          <Pie
            data={{
              labels: Object.keys(roleCounts).map((r) => r.toUpperCase()),
              datasets: [
                {
                  data: Object.values(roleCounts),
                  backgroundColor: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"],
                },
              ],
            }}
          />
        </div>

        {/* NEW: Top Requesters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Top 5 Requesters
          </h2>
          <Bar
            data={{
              labels: Object.keys(topRequesters),
              datasets: [
                {
                  label: "Requests",
                  data: Object.values(topRequesters),
                  backgroundColor: "#EC4899",
                },
              ],
            }}
          />
        </div>

        {/* NEW: Rejection Reasons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Rejection Reasons
          </h2>
          <Pie
            data={{
              labels: Object.keys(rejectionReasons),
              datasets: [
                {
                  data: Object.values(rejectionReasons),
                  backgroundColor: [
                    "#EF4444",
                    "#F97316",
                    "#F59E0B",
                    "#EAB308",
                    "#84CC16",
                  ],
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