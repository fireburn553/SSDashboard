const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get the auth header from the request
  const authHeader = req.headers['authorization'];
  
  // The header is in the format "Bearer TOKEN". We split the string and get the token part.
  const token = authHeader && authHeader.split(' ')[1];

  // If there's no token, the user is not authorized
  if (token == null) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If the token is invalid (e.g., expired), send a 403 Forbidden status
      return res.status(403).json({ message: "Token is not valid" });
    }
    // If the token is valid, attach the user payload to the request object
    req.user = user;
    next(); // Move on to the next middleware or the route handler
  });
};

module.exports = authenticateToken;
