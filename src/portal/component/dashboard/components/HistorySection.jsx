import React, { useEffect, useMemo, useRef, useState } from "react";
import { Typography, Chip, Button, Input, Spinner } from "@material-tailwind/react";
import styled from "styled-components";
import PropTypes from "prop-types";

/**
 * CustomSelect
 * Controlled dropdown select component using styled-components.
 * Accessibility: keyboard navigation (ArrowUp/Down, Home/End, Enter, Escape), ARIA roles and labels.
 * Props:
 *  - value: string (required)
 *  - onChange: (value: string) => void (required)
 *  - options: Array<{ value: string, label: string }> (required)
 *  - placeholder: string
 *  - ariaLabel: string
 *  - disabled: boolean
 *  - className: string
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  ariaLabel = "Custom select",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const ref = useRef(null);

  const safeOptions = useMemo(() => {
    if (!Array.isArray(options)) {
      console.error("CustomSelect: 'options' must be an array");
      return [];
    }
    return options.filter(
      (opt) =>
        opt &&
        typeof opt.value === "string" &&
        typeof opt.label === "string"
    );
  }, [options]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setHighlightIndex(-1);
  }, [open]);

  const currentLabel =
    safeOptions.find((o) => o.value === value)?.label || placeholder;

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      if (!open) {
        setOpen(true);
        setHighlightIndex(Math.max(0, safeOptions.findIndex((o) => o.value === value)));
      } else {
        if (highlightIndex >= 0 && highlightIndex < safeOptions.length) {
          const v = safeOptions[highlightIndex].value;
          onChange?.(v);
        }
        setOpen(false);
      }
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      e.preventDefault();
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      setHighlightIndex(Math.max(0, safeOptions.findIndex((o) => o.value === value)));
      e.preventDefault();
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        setHighlightIndex((i) => {
          const next = i < 0 ? 0 : Math.min(safeOptions.length - 1, i + 1);
          return next;
        });
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setHighlightIndex((i) => {
          const prev = i < 0 ? 0 : Math.max(0, i - 1);
          return prev;
        });
        e.preventDefault();
      } else if (e.key === "Home") {
        setHighlightIndex(0);
        e.preventDefault();
      } else if (e.key === "End") {
        setHighlightIndex(safeOptions.length - 1);
        e.preventDefault();
      }
    }
  };

  return (
    <SelectWrapper
      ref={ref}
      className={className}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls="custom-select-listbox"
      role="combobox"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      <Trigger
        onClick={() => !disabled && setOpen((o) => !o)}
        $disabled={disabled}
      >
        <span className="truncate">{currentLabel}</span>
        <Arrow $open={open} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Arrow>
      </Trigger>
      <Dropdown
        id="custom-select-listbox"
        role="listbox"
        $open={open}
      >
        {safeOptions.map((opt, idx) => {
          const selected = opt.value === value;
          const highlighted = idx === highlightIndex;
          return (
            <OptionItem
              key={opt.value}
              role="option"
              aria-selected={selected}
              $selected={selected}
              $highlighted={highlighted}
              onMouseEnter={() => setHighlightIndex(idx)}
              onMouseLeave={() => setHighlightIndex(-1)}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </OptionItem>
          );
        })}
      </Dropdown>
    </SelectWrapper>
  );
}

CustomSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

const SelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  min-width: 160px;
  max-width: 100%;
  outline: none;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: var(--tw-bg-opacity, 1) !important;
  color: inherit;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(243, 244, 246, 1);
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};
  &:hover {
    box-shadow: ${(p) => (p.$disabled ? "none" : "0 2px 8px rgba(0,0,0,0.08)")};
    border-color: ${(p) => (p.$disabled ? "rgba(148,163,184,0.3)" : "rgba(59, 130, 246, 0.6)")};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
    border-color: rgba(59, 130, 246, 0.75);
  }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Arrow = styled.span`
  display: inline-flex;
  transform: ${(p) => (p.$open ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
  color: rgba(75, 85, 99, 1);
`;

const Dropdown = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255,255,255,1);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  max-height: 240px;
  overflow-y: auto;
  transform-origin: top center;
  transition: opacity 0.15s ease, transform 0.15s ease;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: ${(p) => (p.$open ? "scale(1)" : "scale(0.98)")};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
`;

const OptionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  background: ${(p) => (p.$highlighted ? "rgba(243, 244, 246, 1)" : "transparent")};
  color: ${(p) => (p.$selected ? "rgba(29, 78, 216, 1)" : "inherit")};
  font-weight: ${(p) => (p.$selected ? 600 : 400)};
  &:hover {
    background: rgba(243, 244, 246, 1);
  }
`;

function HistorySection({
  items = [],
  statusOptions = [],
  title = "Request History",
  onOpenDetails,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    try {
      setLoading(true);
      setError("");
    } catch (e) {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [items]);

  const normalizeStatus = (s) => (typeof s === "string" ? s.toLowerCase() : "");

  const filtered = useMemo(() => {
    const toTime = (ts) => {
      if (!ts) return 0;
      const d = new Date(ts);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(dateTo).getTime() : null;

    return items
      .filter((item) => {
        if (statusFilter !== "All") {
          const st = normalizeStatus(item.finalStatus);
          if (statusFilter === "Approved" && st !== "approved") return false;
          if (statusFilter === "Rejected" && st !== "rejected") return false;
        }
        return true;
      })
      .filter((item) => {
        const t = toTime(item.timestamp);
        if (fromMs && t < fromMs) return false;
        if (toMs && t > toMs) return false;
        return true;
      })
      .filter((item) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          (item.reference_number || "").toLowerCase().includes(q) ||
          (item.title || "").toLowerCase().includes(q) ||
          (item.purpose || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ta = new Date(a.timestamp).getTime();
        const tb = new Date(b.timestamp).getTime();
        return sortOrder === "newest" ? tb - ta : ta - tb;
      });
  }, [items, statusFilter, search, sortOrder, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, sortOrder, dateFrom, dateTo, pageSize]);

  const resolveChipColor = (statusText) => {
    const match = statusOptions.find((o) => o.status === statusText) ||
      statusOptions.find((o) => normalizeStatus(o.status) === normalizeStatus(statusText));
    return match?.color || (normalizeStatus(statusText) === "approved" ? "green" : normalizeStatus(statusText) === "rejected" ? "red" : "gray");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="text-gray-800 dark:text-gray-200">
          {title}
        </Typography>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col md:flex-row items-center gap-2 w-full">
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status</label>
            <CustomSelect
              ariaLabel="Filter by status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { value: "All", label: "All" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
              className="min-w-[160px]"
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
              <input type="date" id="dateFrom" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 rounded-md max-w-[160px] border border-gray-300 dark:border-gray-600" />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="dateTo" className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              <input type="date" id="dateTo" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 rounded-md max-w-[160px] border border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <input id="search" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] p-2 rounded-md border border-gray-300 dark:border-gray-600" />
          </div>
        <div className="flex gap-1 w-full">
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label>
            <CustomSelect
              ariaLabel="Sort order"
              value={sortOrder}
              onChange={(v) => setSortOrder(v)}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ]}
              className="min-w-[160px]"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="pageSize" className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Size</label>
            <CustomSelect
              ariaLabel="Page size"
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v))}
              options={[
                { value: "5", label: "5" },
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
              ]}
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      {error && (
        <Typography variant="small" className="text-red-500">
          {error}
        </Typography>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6 text-blue-500" />
        </div>
      ) : pageItems.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm py-3 text-center flex flex-col gap-2 items-center justify-center w-full">
          <Typography variant="small" className="text-gray-500 dark:text-gray-400">
            No history matches your filters
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pageItems.map((item) => (
            <div
              key={`${item.reference_number}-${item.timestamp}`}
              className="flex flex-col bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md w-full"
              onClick={() => onOpenDetails(item.reference_number)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-1">
                  <div className="flex justify-between items-center w-full">
                    <Typography variant="small" className="font-semibold dark:text-gray-200">
                      {item.title || "Request"}
                    </Typography>
                    <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center w-full mt-1">
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={item.finalStatus}
                      color={resolveChipColor(item.finalStatus)}
                      className="w-fit dark:bg-opacity-20 dark:text-gray-300 dark:border-gray-600"
                    />
                    <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-xs">
                      {item.actionUser ? `By: ${item.actionUser}` : "By: Unknown"}
                    </Typography>
                  </div>
                  <Typography variant="small" className="text-gray-600 dark:text-gray-300 mt-2">
                    {item.purpose || "No description available."}
                  </Typography>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Chip size="sm" variant="outlined" color="blue" value={`${item.reference_number}`} className="w-fit" />
                    {item.job_category && (
                      <Chip size="sm" variant="outlined" color="blue" value={String(item.job_category).toUpperCase()} className="w-fit" />
                    )}
                    {/* {item.type && (
                      <Chip size="sm" variant="outlined" color="purple" value={item.type} className="w-fit" />
                    )} */}
                  </div>
                </div>
              </div>

              {/* {onOpenDetails && (
                <div className="mt-3 flex justify-end">
                  <Button size="sm" color="blue" variant="outlined" onClick={() => onOpenDetails(item.reference_number)}>
                    View details
                  </Button>
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <Typography variant="small" className="text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages} • {filtered.length} items
        </Typography>
        <div className="flex gap-2">
          <Button size="sm" variant="outlined" color="blue" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <Button size="sm" variant="filled" color="blue" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HistorySection;
