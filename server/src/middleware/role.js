const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res
      .status(403)
      .json({ message: "Access denied. No role information found in token." });
  }

  // Make the check case-insensitive to be safe
  const userRole = req.user.role.toUpperCase();
  const isAllowed = roles.some(
    (allowedRole) => allowedRole.toUpperCase() === userRole
  );

  if (!isAllowed) {
    return res.status(403).json({
      message: `Access denied. Your role ('${req.user.role}') does not have the required permissions.`,
    });
  }

  next();
};

module.exports = roleMiddleware;
