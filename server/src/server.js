/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
const session = require("express-session");
const pool = require("./database/");
/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const roleMiddleware = require("./middleware/role");

const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");
const instructorsRoutes = require('./routes/instructors');
/* ***********************
 * Middleware
 * ************************/
const app = express();
app.use(cors());
app.use(express.json());
/* ***********************
 * Routes
 *************************/
app.use("/api", authRoutes);
// app.use(
//   "/api/attendance",
//   authMiddleware,
//   roleMiddleware("Admin"),
//   attendanceRoutes
// );
app.use('/api/instructors', instructorsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
