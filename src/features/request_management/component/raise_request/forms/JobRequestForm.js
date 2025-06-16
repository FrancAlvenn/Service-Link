import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for ReactQuill
import { Button, Typography } from "@material-tailwind/react";
import {
  Plus,
  FloppyDisk,
  PencilSimpleLine,
  Prohibit,
  X,
} from "@phosphor-icons/react";
import { AuthContext } from "../../../../authentication";
import axios from "axios";
import { UserContext } from "../../../../../context/UserContext";
import ToastNotification from "../../../../../utils/ToastNotification";
import { JobRequestsContext } from "../../../context/JobRequestsContext";
import { SettingsContext } from "../../../../settings/context/SettingsContext";
import assignApproversToRequest from "../../../utils/assignApproversToRequest";
import nlp from "compromise";

const JOB_CATEGORIES = {
  electrician: [
    // Core electrical terms
    "light",
    "bulb",
    "wiring",
    "socket",
    "electric",
    "outlet",
    "lighting",
    "switch",
    "breaker",
    "fuse",
    "panel",
    "circuit",
    "voltage",
    "generator",
    "transformer",

    // Problems & failures
    "flicker",
    "spark",
    "shock",
    "outage",
    "trip",
    "surge",
    "short",
    "burn",
    "failure",

    // Fixtures & devices
    "chandelier",
    "sconce",
    "lamp",
    "fluorescent",
    "led",
    "dimmer",
    "gfci",
    "conduit",

    // Actions
    "install",
    "replace",
    "rewire",
    "upgrade",
    "test",
    "troubleshoot",
    "connect",
  ],

  plumber: [
    // Fixtures & locations
    "bathroom",
    "toilet",
    "faucet",
    "sink",
    "shower",
    "tub",
    "kitchen",
    "lavatory",
    "urinal",
    "bidet",
    "vanity",
    "basin",
    "pantry",
    "laundry",

    // Components
    "pipe",
    "leak",
    "drain",
    "valve",
    "gasket",
    "seal",
    "flush",
    "trap",
    "vent",
    "hose",
    "spigot",
    "cartridge",
    "aerator",
    "nozzle",

    // Problems & actions
    "clog",
    "drip",
    "flush",
    "unclog",
    "pressure",
    "backflow",
    "overflow",
    "sewer",
    "water",
    "gas",
    "install",
    "repair",
    "replace",
    "clear",
    "snake",
  ],

  carpenter: [
    // Materials & structures
    "door",
    "table",
    "wood",
    "cabinet",
    "hinge",
    "frame",
    "trim",
    "molding",
    "shelf",
    "counter",
    "desk",
    "chair",
    "bench",
    "railing",
    "stair",
    "deck",
    "fence",
    "plywood",
    "lumber",
    "stud",
    "joist",

    // Fixtures & hardware
    "handle",
    "knob",
    "drawer",
    "lock",
    "latch",
    "bracket",
    "fastener",
    "nail",
    "screw",

    // Actions & problems
    "build",
    "install",
    "repair",
    "replace",
    "hang",
    "level",
    "squeak",
    "warp",
    "split",
    "crack",
    "sand",
    "varnish",
    "stain",
    "paint",
  ],

  groundskeeper: [
    // Vegetation
    "grass",
    "tree",
    "flower",
    "bush",
    "weed",
    "mulch",
    "shrub",
    "hedge",
    "lawn",
    "turf",
    "plant",
    "foliage",
    "ivy",
    "vines",
    "garden",
    "bed",
    "sod",
    "seedling",

    // Land features
    "path",
    "fountain",
    "pond",
    "drainage",
    "sprinkler",
    "irrigation",
    "ditch",
    "gutter",

    // Tools & maintenance
    "mow",
    "trim",
    "prune",
    "rake",
    "blow",
    "cultivate",
    "fertilize",
    "pesticide",
    "compost",
    "dig",
    "plant",
    "water",
    "harvest",
    "spray",
    "edge",
    "sweep",
  ],

  general_service_maintenance: [
    // Generic repairs
    "repair",
    "fix",
    "maintain",
    "service",
    "adjust",
    "troubleshoot",
    "restore",
    "renew",
  ],
};

// Levenshtein distance function for fuzzy matching
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1),
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1
      );
    }
  }
  return matrix[b.length][a.length];
};

// Precompute fuzzy indexes for faster matching
const buildFuzzyIndex = (keywords) => {
  const index = {};
  keywords.forEach((keyword) => {
    const prefix = keyword.slice(0, 4);
    if (!index[prefix]) index[prefix] = [];
    index[prefix].push(keyword);
  });
  return index;
};

// Build fuzzy indexes for all categories
const CATEGORY_FUZZY_INDEX = {};
Object.entries(JOB_CATEGORIES).forEach(([category, keywords]) => {
  CATEGORY_FUZZY_INDEX[category] = buildFuzzyIndex(keywords);
});

const classifyJobRequest = ({
  title,
  description = "",
  remarks = "",
  purpose = "",
}) => {
  const fullText =
    `${title} ${description} ${remarks} ${purpose}`.toLowerCase();

  // Extract and normalize words
  const words = fullText
    .split(/\W+/)
    .filter((word) => word.length > 3) // Only consider words >3 chars
    .map((word) => word.replace(/[^a-z]/, ""));

  // Count matches per category
  const categoryScores = {};

  Object.entries(JOB_CATEGORIES).forEach(([category, keywords]) => {
    const fuzzyIndex = CATEGORY_FUZZY_INDEX[category];
    let score = 0;
    const matchedKeywords = new Set();

    words.forEach((word) => {
      // 1. Check exact matches
      if (keywords.includes(word) && !matchedKeywords.has(word)) {
        matchedKeywords.add(word);
        score++;
        return;
      }

      // 2. Check fuzzy matches
      const prefix = word.slice(0, 4);
      if (fuzzyIndex[prefix]) {
        for (const keyword of fuzzyIndex[prefix]) {
          if (matchedKeywords.has(keyword)) continue;

          // Check for prefix match
          if (keyword.startsWith(word) && keyword.length - word.length <= 2) {
            matchedKeywords.add(keyword);
            score++;
            return;
          }

          // Check Levenshtein distance
          if (
            Math.abs(keyword.length - word.length) <= 2 &&
            levenshtein(word, keyword) <= 2
          ) {
            matchedKeywords.add(keyword);
            score++;
            return;
          }
        }
      }
    });

    categoryScores[category] = score;
  });

  // Find best match with priority to specialized categories
  let bestCategory = "general";
  let bestScore = -1;

  Object.entries(categoryScores).forEach(([category, score]) => {
    if (
      score > bestScore ||
      (score === bestScore &&
        Object.keys(JOB_CATEGORIES).indexOf(category) <
          Object.keys(JOB_CATEGORIES).indexOf(bestCategory))
    ) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestScore > 0 ? bestCategory : "general";
};

const JobRequestForm = ({ setSelectedRequest }) => {
  const { user } = useContext(AuthContext);

  const { allUserInfo, getUserByReferenceNumber, fetchUsers } =
    useContext(UserContext);

  const { fetchJobRequests } = useContext(JobRequestsContext);

  const [errorMessage, setErrorMessage] = useState("");

  const [request, setRequest] = useState({
    requester: user.reference_number,
    title: "",
    job_category: "",
    date_required: "",
    purpose: "",
    remarks: "",
    details: [],
    approvers: [],
  });

  const requestType = "Job Request";

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const {
    departments,
    designations,
    approvers,
    approvalRulesByDepartment,
    approvalRulesByRequestType,
    approvalRulesByDesignation,
    fetchDepartments,
    fetchDesignations,
    fetchApprovers,
    fetchApprovalRulesByDepartment,
    fetchApprovalRulesByRequestType,
    fetchApprovalRulesByDesignation,
  } = useContext(SettingsContext);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchApprovers();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchUsers();
  }, []);

  useEffect(() => {
    const category = classifyJobRequest({
      title: request.title,
      description: request.description,
      remarks: request.remarks,
      purpose: request.purpose,
    });
    setRequest((prev) => ({ ...prev, job_category: category }));
    console.log(request.job_category);
  }, [request.title, request.description, request.remarks, request.purpose]);

  const handleChange = (e) => {
    // Validate Date: Ensure date_required is not in the past
    if (e.target.name === "date_required") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day for accuracy
      const selectedDate = new Date(e.target.value);

      if (selectedDate < today) {
        setErrorMessage("Invalid Date. Date cannot be in the past.");
        // ToastNotification.error("Invalid Date", "Date cannot be in the past.");
        return; // Exit without updating state
      }
    }

    // Validate Date: Ensure that for user accounts the date_required should be at least one week prior
    if (user.access_level === "user") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day for accuracy

      const oneWeekFromToday = new Date(today);
      oneWeekFromToday.setDate(today.getDate() + 7);

      const selectedDate = new Date(e.target.value);

      if (selectedDate < oneWeekFromToday) {
        setErrorMessage(
          "Requests should be at least one week prior. For urgent requests, please contact the GSO."
        );
        setRequest({ ...request, [e.target.name]: "" });
        return;
      }
    }

    setErrorMessage("");
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleQuillChange = (name, value) => {
    setRequest({ ...request, [name]: value });
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedParticular({ ...request.details[index] });
  };

  const handleSaveEdit = (index) => {
    const updatedDetails = [...request.details];
    updatedDetails[index] = editedParticular;
    setRequest({ ...request, details: updatedDetails });
    setEditingIndex(null);
  };

  const handleDetailRemove = (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest({ ...request, details: updatedDetails });
  };

  const handleAddParticular = (e) => {
    e.preventDefault();
    const newParticular = { particulars: "", quantity: 0, description: "" };
    const updatedDetails = [...request.details, newParticular];

    setRequest({
      ...request,
      details: updatedDetails,
    });

    // Set the new index to edit mode
    setEditingIndex(updatedDetails.length - 1);
    setEditedParticular(newParticular);
  };

  // Fetch department options from backend
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await axios.get("/settings/department", {
          withCredentials: true,
        });

        if (Array.isArray(response.data.departments)) {
          setDepartmentOptions(response.data.departments);
        } else {
          console.error("Invalid response: 'departments' is not an array");
        }
      } catch (error) {
        console.error("Error fetching department options:", error);
      }
    };

    getDepartments();
  }, []);

  const submitJobRequest = async () => {
    try {
      // Ensure date is properly formatted for MySQL
      const formattedDate = request.date_required
        ? new Date(request.date_required).toISOString().split("T")[0]
        : null;

      // Prepare request payload with correctly formatted date
      let requestData = {
        ...request,
        date_required: formattedDate,
        authorized_access: Array.from(
          new Set([
            ...(request.authorized_access || []),
            user.reference_number,
            request.requester,
          ])
        ),
      };

      const requesterId = allUserInfo.find(
        (user) => user.reference_number === request.requester
      );

      requestData = assignApproversToRequest({
        requestType,
        requestInformation: requestData,
        approvers,
        approvalRulesByDepartment,
        approvalRulesByDesignation,
        approvalRulesByRequestType,
        department_id: requesterId?.department_id,
        designation_id: requesterId?.designation_id,
      });

      console.log(requestData);

      const response = await axios({
        method: "POST",
        url: "/job_request",
        data: requestData,
        withCredentials: true,
      });

      if (response.status === 201) {
        ToastNotification.success("Success!", response.data.message);
        fetchJobRequests();
        setSelectedRequest("");
        setRequest({
          requester: "",
          department: "",
          title: "",
          date_required: "",
          purpose: "",
          remarks: "",
          details: [],
        });
      } else {
        console.error("Invalid response");
      }
    } catch (error) {
      console.error("Error submitting job request:", error);
    }
  };

  return (
    <div className="py-2 text-sm space-y-4 overflow-y-auto">
      {/* Requester & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Requester
          </label>
          {user.access_level === "admin" ? (
            <select
              name="requester"
              value={request.requester || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              required
            >
              <option value="">Select Requester</option>
              {allUserInfo.map((user) => (
                <option
                  key={user.reference_number}
                  value={user.reference_number}
                >
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                value={getUserByReferenceNumber(user.reference_number)}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
              <input
                type="hidden"
                name="requester"
                value={user.reference_number}
              />
            </>
          )}
        </div>
      </div>

      {/* Title & Date Required */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={request.title || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date Required
        </label>
        <input
          type="date"
          name="date_required"
          value={request.date_required || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
        {errorMessage && (
          <p className="text-red-500 font-semibold text-xs pt-1">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose
        </label>
        <textarea
          name="purpose"
          value={request.purpose}
          onChange={(e) => handleQuillChange("purpose", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
      </div>

      {/* Particulars Section */}
      <div className="space-y-2">
        <Typography className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          Particulars
        </Typography>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 dark:border-gray-600">Item</th>
                <th className="px-4 py-2 dark:border-gray-600">Quantity</th>
                <th className="px-4 py-2  dark:border-gray-600">Description</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {request.details.map((detail, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-300 dark:border-gray-600"
                >
                  {editingIndex === index ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editedParticular.particulars}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              particulars: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-400 rounded-md dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editedParticular.quantity}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              quantity: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-400 rounded-md dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <textarea
                          value={editedParticular.description}
                          rows={1}
                          onChange={(e) =>
                            setEditedParticular({
                              ...editedParticular,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-400 rounded-md dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="text-green-500"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <FloppyDisk size={18} />
                        </button>
                        <button
                          className="text-red-500"
                          onClick={() => setEditingIndex(null)}
                        >
                          <Prohibit size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{detail.particulars}</td>
                      <td className="px-4 py-2">x{detail.quantity}</td>
                      <td className="px-4 py-2">{detail.description}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="text-blue-500"
                          onClick={() => handleEditClick(index)}
                        >
                          <PencilSimpleLine size={18} />
                        </button>
                        <button
                          className="text-red-500"
                          onClick={() => handleDetailRemove(index)}
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Particular Button */}
        <Button
          color="green"
          variant="outlined"
          onClick={handleAddParticular}
          className="flex items-center gap-1 px-3 py-2 border rounded-md hover:text-green-500 dark:border-gray-600"
        >
          <Plus size={18} />
          <Typography className="text-xs">Add Particular</Typography>
        </Button>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 pt-1">
          Remarks
        </label>
        <textarea
          name="remarks"
          value={request.remarks}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          required
        />
      </div>

      {/* Submit Button */}
      <Button
        color="blue"
        onClick={() => submitJobRequest()}
        disabled={
          !request.title ||
          !request.date_required ||
          !request.purpose ||
          errorMessage
        }
        className="dark:bg-blue-600 dark:hover:bg-blue-500 w-full md:w-auto"
      >
        Submit Job Request
      </Button>
    </div>
  );
};

export default JobRequestForm;
