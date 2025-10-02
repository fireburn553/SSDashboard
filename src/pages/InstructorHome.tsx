import React from "react";

function InstructorHome() {
  // Dummy summary data, replace with API data as needed
  const summary = {
    totalClasses: 5,
    studentsTaught: 120,
    recentActivity: "Conducted Safety Training - Sept 30, 2025",
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Instructor Dashboard</h2>
      <div className="row mb-4 justify-content-center">
        <div className="col-auto">
          <button className="btn btn-success me-2">
            <i className="bi bi-plus-circle"></i> Add Class
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-search"></i> Retrieve Class
          </button>
        </div>
      </div>
      <div className="row g-4 justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Total Classes</h5>
              <p className="display-6">{summary.totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Students Taught</h5>
              <p className="display-6">{summary.studentsTaught}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Recent Activity</h5>
              <p className="card-text">{summary.recentActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorHome;
