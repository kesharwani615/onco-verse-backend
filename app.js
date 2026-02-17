require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");   // ⭐ Add this
const logRequestMiddleware = require("./src/middelware/logRequest.middleware");
const errorMiddleware = require("./src/middelware/error");
const rootRoute =  require("./src/routes/rootRoute");
const app = express();

require("./src/config/dbConnections");

// Trust proxy (important if hosted on render/elastic beanstalk/nginx)
app.set("trust proxy", false);

// ⭐ GLOBAL RATE LIMIT (Example: 200 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 minutes
  max: 200,                     // Max 200 requests per IP
  message: {
    status: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ⭐ Apply rate limiter BEFORE all routes
app.use(limiter);

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "authorization"],
  credentials: true
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.use(logRequestMiddleware);

// API Routes
app.use("/api/v1", rootRoute);

// Error handler
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.json('API WORKING FINE');
});

const PORT = process.env.PORT || 4047;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
