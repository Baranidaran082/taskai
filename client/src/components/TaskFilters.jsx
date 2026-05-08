import React from "react";
import "./TaskFilters.css";

function TaskFilters({ filters, setFilters }) {
  const handleStatusChange = (status) => {
    setFilters({ ...filters, status });
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  const hasActiveFilters = filters.search || filters.status !== "all";

  return (
    <div className="filters-bar">
      <div className="filters-status-pills">
        {["all", "Pending", "In Progress", "Completed"].map((s) => (
          <button
            key={s}
            className={`filter-pill ${filters.status === s ? "active" : ""}`}
            onClick={() => handleStatusChange(s)}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button className="filter-clear-btn" onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  );
}

export default TaskFilters;
