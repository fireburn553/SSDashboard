const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const roleMiddleware = require("./middleware/role");

const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");
const instructorsRoutes = require("./routes/instructors");
const adminRoutes = require("./routes/admin");
const participantsRoutes = require("./routes/participant");

const app = express();

// Allow cookies across origins
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* Public routes */
app.use("/api", authRoutes); // login/register
app.use("/api/admin", adminRoutes);

/* Protected routes */
app.use(authMiddleware);
app.use("/api/instructor", instructorsRoutes);
app.use("/api/participant", participantsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
