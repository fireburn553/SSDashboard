const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default to a 500 server error
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  res.json({
    success: false,
    message: err.message,
    // Include stack trace in development mode for easier debugging
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
