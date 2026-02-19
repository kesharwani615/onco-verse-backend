const checkPermission = (permissionName, type = "view") => {
    return (req, res, next) => {
      const user = req.user;
  
      if (user.role === "admin") {
        return next();
      }
  
      const permission = user.permissions.find(
        (p) => p.name === permissionName
      );
  
      if (!permission || !permission[type]) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
  
      next();
    };
  };

module.exports = checkPermission;