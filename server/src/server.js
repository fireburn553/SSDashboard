const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const roleMiddleware = require("./middleware/role");

const authRoutes = require("./routes/auth");
const instructorsRoutes = require("./routes/instructors");
const adminRoutes = require("./routes/admin");
const participantsRoutes = require("./routes/participant");
const gradesRoutes = require("./routes/grades");
const reportRoutes = require("./routes/reports");
const setupSwagger = require("./swagger"); // import swagger.js

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
/* Swagger setup */
setupSwagger(app);
app.use(authMiddleware);

/* Public routes */
app.use("/api", authRoutes); // login/register
app.use("/api/admin", adminRoutes);

/* Protected routes */
app.use("/api/instructor", instructorsRoutes);
app.use("/api/participant", participantsRoutes);
app.use("/api/participant", gradesRoutes);
app.use("/api/report", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
