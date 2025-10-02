export default function LandingPage() {
  return (
    <section
      className="d-flex align-items-center justify-content-center text-center"
      style={{
        height: "80vh",
        backgroundColor: "FFFFFF", // Navy Blue background
      }}
    >
      <div className="container">
        {/* Heading */}
        <h1 className="display-4 fw-bold mb-3" style={{ color: "#E41E26" }}>
          WELCOME TO FIRST AID TRAINING DASHBOARD
        </h1>

        {/* Caption */}
        <p className="lead mb-4" style={{ color: "#002147" }}>
          Empowering communities through knowledge and preparedness. Manage your
          training records, track certifications, and stay ready to save lives.
        </p>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3">
          <a
            href="/signin"
            className="btn btn-lg"
            style={{
              backgroundColor: "#E41E26", // Red button
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "10px 30px",
            }}
          >
            Sign In
          </a>

          <a
            href="/signup"
            className="btn btn-lg"
            style={{
              backgroundColor: "#28A745", // Green button
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "10px 30px",
            }}
          >
            Register
          </a>
        </div>
      </div>
    </section>
  );
}
