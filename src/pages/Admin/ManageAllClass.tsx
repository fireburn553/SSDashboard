/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useSortableData } from "../../hooks/useSortableData";
// Define the structure of a single class in the list
interface AdminClass {
  class_id: number;
  class_number: string;
  course_name: string;
  class_start_date: string;
  class_end_date: string;
  instructor_name: string;
  is_concluded: boolean;
  participant_count: number;
}

function ManageAllClasses() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchWithAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const getSortIndicator = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) {
      return null;
    }
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };
  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const res = await fetchWithAuth(
          "http://localhost:5000/api/admin/all-classes"
        );
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setClasses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllClasses();
  }, [fetchWithAuth]);
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // Status Filter
      const statusMatch =
        statusFilter === "All" ||
        (statusFilter === "Active" && !cls.is_concluded) ||
        (statusFilter === "Concluded" && cls.is_concluded);

      // Search Term Filter (case-insensitive)
      const searchMatch =
        searchTerm === "" ||
        cls.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [classes, searchTerm, statusFilter]);

  const {
    items: sortedClasses,
    requestSort,
    sortConfig,
  } = useSortableData(filteredClasses, {
    key: "class_start_date",
    direction: "descending",
  });

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  if (isLoading)
    return (
      <div className="container-fluid mt-5 p-4">
        <p>Loading classes...</p>
      </div>
    );
  if (error)
    return (
      <div className="container-fluid mt-5 p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    // Use container-fluid for a full-width layout
    <div className="container-fluid mt-5 p-4">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-4"
      >
        &larr; Back to Dashboard
      </button>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage All Classes</h1>
        <Link to="/instructor/create-class" className="btn btn-primary">
          + Create New Class
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search by Course or Instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Concluded">Concluded</option>
              </select>
            </div>
          </div>
          <div className="table-responsive-cards">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th
                    onClick={() => requestSort("class_number")}
                    style={{ cursor: "pointer" }}
                  >
                    Class Number{getSortIndicator("class_number")}
                  </th>
                  <th
                    onClick={() => requestSort("course_name")}
                    style={{ cursor: "pointer" }}
                  >
                    Course Name{getSortIndicator("course_name")}
                  </th>
                  <th
                    onClick={() => requestSort("class_start_date")}
                    style={{ cursor: "pointer" }}
                  >
                    Dates{getSortIndicator("class_start_date")}
                  </th>
                  <th
                    onClick={() => requestSort("instructor_name")}
                    style={{ cursor: "pointer" }}
                  >
                    Instructor{getSortIndicator("instructor_name")}
                  </th>
                  <th
                    onClick={() => requestSort("participant_count")}
                    style={{ cursor: "pointer" }}
                  >
                    Participants{getSortIndicator("participant_count")}
                  </th>
                  <th
                    onClick={() => requestSort("is_concluded")}
                    style={{ cursor: "pointer" }}
                  >
                    Status{getSortIndicator("is_concluded")}
                  </th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((cls) => (
                  <tr key={cls.class_id}>
                    <td data-label="Class Number">{cls.class_number}</td>
                    <td data-label="Course Name">{cls.course_name}</td>
                    <td data-label="Dates">
                      {formatDateRange(
                        cls.class_start_date,
                        cls.class_end_date
                      )}
                    </td>
                    <td data-label="Instructor">{cls.instructor_name}</td>
                    <td data-label="Participants">{cls.participant_count}</td>
                    <td data-label="Status">
                      <span
                        className={`badge ${
                          cls.is_concluded ? "bg-secondary" : "bg-success"
                        }`}
                      >
                        {cls.is_concluded ? "Concluded" : "Active"}
                      </span>
                    </td>
                    <td data-label="Actions" className="text-end">
                      {/* Bootstrap Dropdown for the Actions Menu */}
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/instructor/class/${cls.class_id}`}
                            >
                              Manage Class
                            </Link>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <a
                              className={`dropdown-item ${
                                !cls.is_concluded ? "disabled" : ""
                              }`}
                              href={`http://localhost:5000/api/report/${cls.class_id}/report`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Generate Report
                            </a>
                          </li>
                          <li>
                            <a
                              className={`dropdown-item ${
                                !cls.is_concluded ? "disabled" : ""
                              }`}
                              href={`http://localhost:5000/api/certificates/class/${cls.class_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Print Certificates
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageAllClasses;
