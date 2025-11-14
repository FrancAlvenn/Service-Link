// components/request/AIAssistantPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { Spinner } from "@material-tailwind/react";
import { Sparkle, CaretDown, CaretUp } from "@phosphor-icons/react";

// Initialise Gemini (frontend)
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

const AIAssistantPanel = ({ request, requestType, referenceNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cache: all job requests & employees
  const [allRequests, setAllRequests] = useState([]);
  const [employees, setEmployees] = useState([]);

  const isJobRequest = requestType === "job_request";

  // ---------------------------------------------------------------
  // 1. Fetch context data (once)
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!isJobRequest) return;

    const fetchData = async () => {
      try {
        const [reqRes, empRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/job_request`, {
            withCredentials: true,
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/employees`, {
            withCredentials: true,
          }),
        ]);

        setAllRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      } catch (err) {
        console.warn("Failed to load context data:", err);
      }
    };

    fetchData();
  }, [isJobRequest]);

  // ---------------------------------------------------------------
  // 2. AI call – with 503-retry & message shown **inside the panel**
  // ---------------------------------------------------------------
  const runAI = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500; // ms

    setLoading(true);
    setError("");

    try {
      const context = gatherContext(request, allRequests, employees);
      const prompt = buildPrompt(context);

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim() ?? "No response.";
      setAiResponse(text);
    } catch (err) {
      console.error("Gemini Assistant Error:", err);

      // ---- Detect service-unavailable / network problems ----
      const isUnavailable =
        err?.status === 503 ||
        err?.code === "ECONNABORTED" ||
        /network|timeout|unavailable/i.test(err?.message ?? "");

      // ---- Auto-retry -------------------------------------------------
      if (isUnavailable && retryCount < MAX_RETRIES) {
        setTimeout(() => runAI(retryCount + 1), RETRY_DELAY);
        return;
      }

      // ---- Final message (shown inside the panel) --------------------
      const message = isUnavailable
        ? "AI assistant is temporarily unavailable. Please try again later."
        : "Failed to generate suggestions. Please try again.";

      setError(message);               // <-- shown in the panel
      setAiResponse("");               // clear any previous response
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // 3. Trigger AI when panel opens & data is ready
  // ---------------------------------------------------------------
  useEffect(() => {
    if (
      !isOpen ||
      !isJobRequest ||
      aiResponse ||
      !allRequests.length ||
      !request?.title
    )
      return;

    runAI();
  }, [isOpen, isJobRequest, aiResponse, request, allRequests]);

  // ---------------------------------------------------------------
  // 4. Render
  // ---------------------------------------------------------------
  return (
    <div className="mb-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <div className="flex items-center gap-2">
          <Sparkle size={20} className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            AI Assistant
          </span>
        </div>
        {isOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 border-t border-gray-300 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Spinner className="h-4 w-4" />
              <span className="text-sm">Analyzing request...</span>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : aiResponse ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: formatResponse(aiResponse) }}
            />
          ) : (
            <p className="text-gray-500 italic text-sm">
              No suggestion available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* -----------------------------------------------------------------
   Helper functions (unchanged – just moved below for clarity)
----------------------------------------------------------------- */
const gatherContext = (current, allRequests, employees) => {
  const keywords = current.title + " " + current.purpose + " " + current.department;
  const lower = keywords.toLowerCase();

  const past = allRequests
    .filter((r) => {
      if (r.reference_number === current.reference_number) return false;
      if (r.status !== "completed" && r.status !== "closed") return false;
      const text = `${r.title} ${r.purpose} ${r.department}`.toLowerCase();
      return text.includes(lower.split(" ")[0]) || lower.includes(text.split(" ")[0]);
    })
    .slice(0, 5)
    .map((r) => ({
      ref: r.reference_number,
      title: r.title,
      assigned:
        r.assigned_to?.map((a) => a.first_name + " " + a.last_name).join(", ") ||
        "None",
      assets: r.assigned_assets?.join(", ") || "None",
      time:
        r.completed_at && r.created_at
          ? `${Math.round(
              (new Date(r.completed_at) - new Date(r.created_at)) / 86400000
            )} days`
          : "Ongoing",
      status: r.status,
    }));

  let guess = "";
  if (!past.length && employees.length) {
    const roleMap = {
      plumber: /plumb|bathroom|toilet|pipe|leak|drain/i,
      electrician: /electric|light|wiring|outlet|switch|panel/i,
      technician: /repair|fix|maintenance|ac|aircon|machine/i,
      driver: /vehicle|car|van|transport|delivery/i,
    };

    const match = Object.entries(roleMap).find(([_, re]) => re.test(lower));
    if (match) {
      const [role] = match;
      const expert = employees.find((e) =>
        e.expertise?.toLowerCase().includes(role)
      );
      if (expert) {
        guess = `**Suggested Assignee**: ${expert.first_name} ${expert.last_name} (${expert.expertise})\n`;
      }
    }
  }

  return {
    current: {
      title: current.title || "N/A",
      purpose: current.purpose || "N/A",
      department: current.department || "N/A",
      items:
        current.details
          ?.map((d) => `${d.particulars}: ${d.description}`)
          .join("; ") || "None",
    },
    past,
    guess,
  };
};

const buildPrompt = (context) => {
  const { current, past, guess } = context;

  let prompt = `${guess}You are a facilities operations expert.\n\nCURRENT REQUEST:\n`;
  prompt += `- Title: ${current.title}\n`;
  prompt += `- Purpose: ${current.purpose}\n`;
  prompt += `- Department: ${current.department}\n`;
  prompt += `- Items: ${current.items}\n\n`;

  if (past.length) {
    prompt += `PAST SIMILAR:\n`;
    past.forEach((p, i) => {
      prompt += `${i + 1}. [${p.ref}] ${p.title} → Assigned: ${p.assigned}, Time: ${p.time}\n`;
    });
  } else {
    prompt += `No past data.\n`;
  }

  prompt += `\nRespond in **HTML** with **<strong>** and **<ul><li>**:\n`;
  prompt += `- **1–2 recommended employees** (name + role)\n`;
  prompt += `- **Assets** if needed\n`;
  prompt += `- **Estimated time**\n`;
  prompt += `- **3-step plan**\n`;
  prompt += `Keep under 250 words. Be direct.`;

  return prompt;
};

const formatResponse = (text) => {
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

export default AIAssistantPanel;