/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext"; // Adjust path
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Link } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Define an interface for the summary data
interface AdminSummary {
  stats: {
    active_classes: string;
    approved_instructors: string;
    concluded_classes: string;
    disabled_instructors: string;
    pending_instructors: string;
    total_classes: string;
    total_instructors: string;
    total_participants: string;
    male_participants: string;
    female_participants: string;
  };
  outcomes: { pax_remarks: string; count: string }[];
  courseDistribution: {
    course_name: string;
    participant_count: string;
    training_count: string;
  }[];
  topInstructors: { instructor_name: string; class_count: string }[];
}

function AdminHome() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    const fetchAdminSummary = async () => {
      try {
        const res = await fetchWithAuth(
          "http://localhost:5000/api/admin/dashboard-summary"
        );
        if (!res.ok) throw new Error("Could not fetch admin summary data.");
        const data = await res.json();
        setSummary(data);
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminSummary();
  }, [fetchWithAuth]);
  if (isLoading) {
    return (
      <div className="container mt-5">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  // This is the crucial check to ensure `summary` is not null.
  if (!summary) {
    return (
      <div className="container mt-5">
        <p>No summary data available.</p>
      </div>
    );
  }
  // Prepare data for the charts
  const outcomesData = {
    labels: summary.outcomes?.map((d) => d.pax_remarks) ?? [],
    datasets: [
      {
        data: summary.outcomes?.map((d) => d.count) ?? [],
        backgroundColor: ["#198754", "#dc3545", "#6c757d"],
      },
    ],
  };

  const topInstructorsData = {
    labels: summary.topInstructors?.map((i) => i.instructor_name) ?? [],
    datasets: [
      {
        label: "Classes Taught",
        data: summary.topInstructors?.map((i) => i.class_count) ?? [],
        backgroundColor: "rgba(0, 123, 255, 0.6)",
      },
    ],
  };

  // Data for the Course Distribution Bar Chart
  const courseData = {
    // This was the line causing the crash. It now has the safe optional chaining.
    labels: summary.courseDistribution?.map((c) => c.course_name) ?? [],
    datasets: [
      {
        label: "Participants",
        data:
          summary.courseDistribution?.map((c) => Number(c.participant_count)) ??
          [],
        backgroundColor: "rgba(0, 123, 255, 0.6)",
      },
      {
        label: "Trainings",
        data:
          summary.courseDistribution?.map((c) => Number(c.training_count)) ??
          [],
        backgroundColor: "rgba(220, 53, 69, 0.6)",
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>
      <p>A high-level overview of all organizational activity.</p>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Instructors</h5>
              <p className="card-text fs-1 fw-bold">
                {summary.stats?.total_instructors || 0}
              </p>
              <ul className="list-group list-group-flush list-group-horizontal mt-2">
                <li className="list-group-item flex-fill">
                  Pending
                  <span className="badge bg-warning rounded-pill ms-1">
                    {summary.stats?.pending_instructors || 0}
                  </span>
                </li>
                <li className="list-group-item flex-fill">
                  Approved
                  <span className="badge bg-success rounded-pill ms-1">
                    {summary.stats?.approved_instructors || 0}
                  </span>
                </li>
                <li className="list-group-item flex-fill">
                  Disabled
                  <span className="badge bg-secondary rounded-pill ms-1">
                    {summary.stats?.disabled_instructors || 0}
                  </span>
                </li>
              </ul>
            </div>
            <div className="card-footer bg-white border-0">
              <Link to="/admin/manage-instructors">
                View Details <i className="bi bi-arrow-right-circle ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Classes Conducted</h5>
              <p className="card-text fs-1 fw-bold">
                {summary.stats?.total_classes || 0}
              </p>
              <ul className="list-group list-group-flush list-group-horizontal mt-2">
                <li className="list-group-item flex-fill">
                  Active
                  <br />
                  <span className="badge bg-success rounded-pill ms-1">
                    {summary.stats?.active_classes || 0}
                  </span>
                </li>
                <li className="list-group-item flex-fill">
                  Concluded
                  <br />
                  <span className="badge bg-warning rounded-pill ms-1">
                    {summary.stats?.concluded_classes || 0}
                  </span>
                </li>
              </ul>
            </div>
            <div className="card-footer bg-white border-0">
              <Link to="/admin/manage-classes">
                View Details <i className="bi bi-arrow-right-circle ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Participants Trained</h5>
              <p className="card-text fs-1 fw-bold">
                {summary.stats?.total_participants || 0}
              </p>
              {/* Gender Breakdown */}
              <ul className="list-group list-group-flush list-group-horizontal mt-2">
                <li className="list-group-item flex-fill">
                  Male <br />
                  <span className="badge bg-primary rounded-pill ms-1">
                    {summary.stats?.male_participants || 0}
                  </span>
                </li>
                <li className="list-group-item flex-fill">
                  Female <br />
                  <span className="badge bg-danger rounded-pill ms-1">
                    {summary.stats?.female_participants || 0}
                  </span>
                </li>
              </ul>
            </div>
            <div className="card-footer bg-white border-0">
              <Link to="/admin/participants">
                View Details <i className="bi bi-arrow-right-circle ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row ">
        <div className="col-md-8 ">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                Top 5 Instructors (by Classes Taught)
              </h5>
              <Bar
                data={topInstructorsData}
                options={{ indexAxis: "y" as const, responsive: true }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Overall Participant Outcomes</h5>
              <Pie data={outcomesData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>
      <div className="card mt-4 dashboard-card">
        <div className="card-body ">
          <h5 className="card-title">Course Performance</h5>
          <Bar
            data={courseData}
            options={{
              responsive: true,
              plugins: { legend: { display: true } },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
