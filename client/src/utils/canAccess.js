const canAccess = (userPermissions, action) => {
  const permission = userPermissions?.find((p) => p.action === action);
  return permission && permission.effect === "Allow";
};

export default canAccess;