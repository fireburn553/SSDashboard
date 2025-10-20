const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");
const roleMiddleware = require("./middleware/role");
const errorHandler = require("./middleware/error");
const authRoutes = require("./routes/auth");
const instructorsRoutes = require("./routes/instructors");
const adminRoutes = require("./routes/admin");
const participantsRoutes = require("./routes/participant");
const gradesRoutes = require("./routes/grades");
const reportRoutes = require("./routes/reports");
const setupSwagger = require("./swagger"); // import swagger.js
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const certificateRoutes = require("./routes/certificates");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
// Allow cookies across origins
const allowedOrigins = [
  'http://localhost:5173',               
  'https://ss-dashboard-two.vercel.app' 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
  credentials: true, 
  optionsSuccessStatus: 204 
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
/* Swagger setup */
setupSwagger(app);

/* Public routes */
app.use("/api", authRoutes); // login/register
app.use("/api/participant", participantsRoutes);

app.use(authMiddleware);
/* Protected routes */
app.use("/api/admin", roleMiddleware(["Admin"]), adminRoutes);
app.use("/api/instructor", roleMiddleware(["Instructor"]), instructorsRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/report", reportRoutes);
app.use(errorHandler);
app.use("/api/certificates", certificateRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
