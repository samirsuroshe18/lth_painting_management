import ApiError from "../utils/ApiError.js";

const checkAccess = (...actions) => {
  return (req, res, next) => {
    try {
      const permissions = req.user.permissions;

      if (!permissions || permissions.length === 0) {
        throw new ApiError(403, "Access denied");
      }

      const hasAccess = actions.every(action =>
        permissions.some(p => p.action === action && p.effect === 'Allow')
      );

      if (!hasAccess) {
        throw new ApiError(403, "Access denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { checkAccess };
