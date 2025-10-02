// src/swagger.js
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const authDoc = YAML.load("./docs/auth.yaml");
const classesDoc = YAML.load("./docs/classes.yaml");
const gradesDoc = YAML.load("./docs/grades.yaml");
const reportsDoc = YAML.load("./docs/reports.yaml");
const participantsDoc = YAML.load("./docs/participants.yaml");
const adminDoc = YAML.load("./docs/admin.yaml");

const swaggerSpec = {
  openapi: "3.0.0",
  info: { title: "SSDashboard API", version: "1.0.0" },
  paths: {
    ...adminDoc.paths,
    ...authDoc.paths,
    ...classesDoc.paths,
    ...gradesDoc.paths,
    ...reportsDoc.paths,
    ...participantsDoc.paths,
  },
};

// Export a function that accepts the app instance
module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
