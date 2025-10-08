const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    // Verify the token and attach the entire decoded payload to req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded; // Attach the payload directly
    next();
  } catch (err) {
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};