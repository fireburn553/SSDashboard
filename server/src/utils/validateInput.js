// middleware/validateInput.js
const { body, param, validationResult } = require("express-validator");

// Custom sanitizer to strip dangerous characters
const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/[<>$;]/g, ""); // removes HTML/SQL special chars
};

const validateClassInput = [
  body("class_start_date").isISO8601().withMessage("Invalid start date"),
  body("class_end_date").isISO8601().withMessage("Invalid end date"),
  body("class_final_evaluation_date")
    .isISO8601()
    .withMessage("Invalid final evaluation date"),
  body("class_number").isInt().withMessage("Class number must be an integer"),
  body("class_total_hours")
    .isInt()
    .withMessage("Total hours must be an integer"),
  body("class_total_days").isInt().withMessage("Total days must be an integer"),
  body("user_id").isUUID().withMessage("Invalid user_id format"),
  body("training_location_id")
    .isUUID()
    .withMessage("Invalid training_location_id format"),
  body("cso_id").isUUID().withMessage("Invalid cso_id format"),
  body("course_id").isUUID().withMessage("Invalid course_id format"),

  // Apply sanitizer to all string inputs
  body("*").customSanitizer(sanitizeString),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateIdParam = [
  param("id")
    .isInt({ min: 1 }) // minimum 1, so no zero or negatives
    .withMessage("ID must be a positive integer"),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateClassInput, validateIdParam };
