/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
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

// Register the components you'll be using from Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface MyClass {
  class_id: number;
  class_number: string;
  course_name: string;
  class_start_date: string;
  is_concluded: boolean;
}

interface DashboardSummary {
  stats: {
    total_classes: string;
    active_classes: string;
    total_participants: string;
  };
  passFailDistribution: { pax_remarks: string; count: string }[];
  courseDistribution: { course_name: string; participant_count: string }[];
}

function InstructorHome() {
  const [myClasses, setMyClasses] = useState<MyClass[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchWithAuth, user } = useAuth(); // Assuming 'user' is available from your auth context

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch both sets of data at the same time
        const [classesRes, summaryRes] = await Promise.all([
          fetchWithAuth("http://localhost:5000/api/instructor/my-classes"),
          fetchWithAuth(
            "http://localhost:5000/api/instructor/dashboard-summary"
          ),
        ]);
        if (!classesRes.ok || !summaryRes.ok) {
          throw new Error("Failed to fetch dashboard data.");
        }
        const classesData = await classesRes.json();
        const summaryData = await summaryRes.json();
        setMyClasses(classesData);
        setSummary(summaryData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [fetchWithAuth]);

  // Data for the Pass/Fail Pie Chart
  const passFailData = {
    labels:
      summary?.passFailDistribution.map(
        (d) => d.pax_remarks.charAt(0).toUpperCase() + d.pax_remarks.slice(1)
      ) || [],
    datasets: [
      {
        data: summary?.passFailDistribution.map((d) => Number(d.count)) || [],
        backgroundColor: ["#198754", "#dc3545", "#6c757d"], // Green for passed, Red for failed, Gray for drop
      },
    ],
  };

  // Data for the Course Distribution Bar Chart
  const courseData = {
    labels: summary?.courseDistribution.map((c) => c.course_name) || [],
    datasets: [
      {
        label: "Number of Participants",
        data:
          summary?.courseDistribution.map((c) => Number(c.participant_count)) ||
          [],
        backgroundColor: "rgba(0, 123, 255, 0.6)",
      },
    ],
  };

  if (isLoading)
    return (
      <div className="container mt-5">
        <h4>Loading Class Details...</h4>
      </div>
    );
  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container mt-5">
      <h1>Instructor Dashboard</h1>
      <p>
        Welcome, {user?.user_fname || "instructor"}. From here you can manage
        your classes and view your statistics.
      </p>

      {/* === STAT CARDS === */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Classes Taught</h5>
              <p className="card-text fs-1 fw-bold">
                {summary?.stats.total_classes || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Active Classes</h5>
              <p className="card-text fs-1 fw-bold">
                {summary?.stats.active_classes || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Participants Trained</h5>
              <p className="card-text fs-1 fw-bold">
                {summary?.stats.total_participants || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === CHARTS === */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card h-100 dashboard-card">
            <div className="card-body d-flex flex-column">
              {" "}
              {/* Added flex classes for centering */}
              <h5 className="card-title">Participants per Course</h5>
              {/* === START: BAR CHART CONDITIONAL RENDERING === */}
              {summary?.courseDistribution &&
              summary.courseDistribution.length > 0 ? (
                <Bar
                  data={courseData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <p className="text-muted">No course data to display yet.</p>
                </div>
              )}
              {/* === END: BAR CHART CONDITIONAL RENDERING === */}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 dashboard-card">
            <div className="card-body d-flex flex-column">
              {" "}
              {/* Added flex classes for centering */}
              <h5 className="card-title">Participant Outcomes</h5>
              {/* === START: PIE CHART CONDITIONAL RENDERING === */}
              {summary?.passFailDistribution &&
              summary.passFailDistribution.length > 0 ? (
                <Pie data={passFailData} options={{ responsive: true }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <p className="text-muted">No outcome data to display yet.</p>
                </div>
              )}
              {/* === END: PIE CHART CONDITIONAL RENDERING === */}
            </div>
          </div>
        </div>
      </div>

      {/* === CLASS LIST === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>My Classes</h4>
        <Link to="/instructor/create-class" className="btn btn-primary">
          + Create New Class
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive-cards">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Class Number</th>
                  <th>Course Name</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myClasses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      You are not assigned to any classes.
                    </td>
                  </tr>
                ) : (
                  myClasses.map((cls) => (
                    <tr key={cls.class_id}>
                      <td data-label="Class Number">{cls.class_number}</td>
                      <td data-label="Course Name">{cls.course_name}</td>
                      <td data-label="Start Date">
                        {new Date(cls.class_start_date).toLocaleDateString()}
                      </td>
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
                        <Link
                          to={`/instructor/class/${cls.class_id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorHome;
