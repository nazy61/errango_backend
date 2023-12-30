const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cors = require("cors");
const { config } = require("dotenv");
const apiRoutes = require("./routes/routes");

config();
mongoose.set("strictQuery", true);
const port = process.env.PORT || 3000;
const dbConnectionString = process.env.DB_CONNECTION_STRING;
const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// all routes
app.use("/v1", apiRoutes.roleRoutes);
app.use("/v1", apiRoutes.faqRoutes);
app.use("/v1", apiRoutes.authRoutes);
app.use("/v1", apiRoutes.kycRoutes);
app.use("/v1", apiRoutes.errandRoutes);
app.use("/v1", apiRoutes.userRoutes);

// Middleware for handling non-existent routes
app.use((req, res, next) => {
  res.status(404).send({
    status: false,
    message: `API Endpoint ${req.path}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: false,
    message: "Internal Server Error",
  });
});

app.listen({ port }, async () => {
  console.log(`Errango listening on port ${port}`);
  mongoose.connect(dbConnectionString);
  console.log("Database connected!");
});
