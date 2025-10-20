/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useSortableData } from "../../hooks/useSortableData";

interface ParticipantSummary {
  ageDistribution: { age_group: string; count: string }[];
  csoDistribution: { cso_name: string; participant_count: string }[];
  heaDistribution: { hea_name: string; participant_count: string }[];
}

interface Participant {
  pax_id: number;
  pax_fname: string;
  pax_lname: string;
  pax_email: string;
  pax_bday: string;
  gender_name: string;
  class_number: string;
  course_name: string;
  pax_remarks: string;
}

function AllParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [summary, setSummary] = useState<ParticipantSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        const res = await fetchWithAuth(
          "http://localhost:5000/api/admin/all-participants"
        );
        if (!res.ok) {
          throw new Error("Failed to fetch participant data");
        }
        const data = await res.json();

        // Set both the list and the summary from the single response
        setParticipants(data.participants);
        setSummary(data.summary);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParticipantData();
  }, [fetchWithAuth]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(
      (p) =>
        (p.pax_fname + " " + p.pax_lname)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.pax_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [participants, searchTerm]);

  const {
    items: sortedParticipants,
    requestSort,
    sortConfig,
  } = useSortableData(filteredParticipants, {
    key: "pax_lname",
    direction: "ascending",
  });

  const getSortIndicator = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  if (isLoading)
    return (
      <div className="container-fluid mt-5 p-4">
        <p>Loading participants...</p>
      </div>
    );
  if (error)
    return (
      <div className="container-fluid mt-5 p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container-fluid mt-5 p-4">
      <h1>All Participants</h1>
      <p>A complete list of all participants registered in the system.</p>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Age Distribution</h5>
              {summary?.ageDistribution &&
              summary.ageDistribution.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {summary.ageDistribution.map((item) => (
                    <li
                      key={item.age_group}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {item.age_group}
                      <span className="badge bg-info rounded-pill">
                        {item.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No age data available.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Top 5 Organizations</h5>
              {summary?.csoDistribution &&
              summary.csoDistribution.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {summary.csoDistribution.map((item) => (
                    <li
                      key={item.cso_name}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {item.cso_name}
                      <span className="badge bg-primary rounded-pill">
                        {item.participant_count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No organization data available.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Educational Attainment</h5>
              {summary?.heaDistribution &&
              summary.heaDistribution.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {summary.heaDistribution.map((item) => (
                    <li
                      key={item.hea_name}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {item.hea_name}
                      <span className="badge bg-secondary rounded-pill">
                        {item.participant_count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No education data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="card-body">
          <div className="table-responsive-cards">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th
                    onClick={() => requestSort("pax_lname")}
                    style={{ cursor: "pointer" }}
                  >
                    Name{getSortIndicator("pax_lname")}
                  </th>
                  <th
                    onClick={() => requestSort("pax_email")}
                    style={{ cursor: "pointer" }}
                  >
                    Email{getSortIndicator("pax_email")}
                  </th>
                  <th
                    onClick={() => requestSort("course_name")}
                    style={{ cursor: "pointer" }}
                  >
                    Course{getSortIndicator("course_name")}
                  </th>
                  <th
                    onClick={() => requestSort("class_number")}
                    style={{ cursor: "pointer" }}
                  >
                    Class #{getSortIndicator("class_number")}
                  </th>
                  <th
                    onClick={() => requestSort("gender_name")}
                    style={{ cursor: "pointer" }}
                  >
                    Gender{getSortIndicator("gender_name")}
                  </th>
                  <th
                    onClick={() => requestSort("pax_remarks")}
                    style={{ cursor: "pointer" }}
                  >
                    Final Remarks{getSortIndicator("pax_remarks")}
                  </th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.map((p) => (
                  <tr key={p.pax_id}>
                    <td data-label="Name">
                      {p.pax_fname} {p.pax_lname}
                    </td>
                    <td data-label="Email">{p.pax_email}</td>
                    <td data-label="Course">{p.course_name}</td>
                    <td data-label="Class">{p.class_number}</td>
                    <td data-label="Gender">{p.gender_name}</td>
                    <td data-label="Final Remarks">
                      <span
                        className={`badge ${
                          p.pax_remarks === "passed"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {p.pax_remarks}
                      </span>
                    </td>
                    <td data-label="Actions" className="text-end">
                      <a
                        href={`http://localhost:5000/api/certificates/participant/${p.pax_id}`}
                        className={`btn btn-sm btn-outline-secondary ${
                          p.pax_remarks !== "passed" ? "disabled" : ""
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={
                          p.pax_remarks !== "passed"
                            ? "Only passed participants can receive a certificate"
                            : "Print Certificate"
                        }
                      >
                        <i className="bi bi-printer"></i>
                      </a>
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

export default AllParticipants;
