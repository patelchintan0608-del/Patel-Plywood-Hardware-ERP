export const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in first.",
      });
    }

    // Admins have unrestricted access
    if (req.user.role === "admin" || (req.user.permissions && req.user.permissions.includes("*"))) {
      return next();
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has ANY of the required permissions
    const hasAccess = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (hasAccess) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: 403 Forbidden. Requires permission: [${requiredPermissions.join(", ")}]`,
    });
  };
};

export const checkPermission = authorize;
