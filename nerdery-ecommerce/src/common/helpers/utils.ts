export const validateStringUUID = (uuid: string): boolean => {
  const uuidRegex = new RegExp(
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  );
  return uuidRegex.test(uuid);
};

export const checkAnyRequiredRoles = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some((requiredRole) => userRoles.includes(requiredRole));
};
