const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies.token; // read cookie instead of headers

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use environment variable
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};
