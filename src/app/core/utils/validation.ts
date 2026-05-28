import { format } from 'date-fns';

export const getRolePermissions = (
  role: { permissions?: unknown[] } | null | undefined,
): unknown[] => {
  if (!role) return [];
  return role.permissions ? role.permissions : [];
};

export const isPageInRange = (page: number, totalPages: number): boolean => {
  if (page < 0) return false;
  if (page >= totalPages) return false;
  return true;
};

export const formatDateRange = (
  name: string,
  from: Date,
  to?: Date | null,
): Record<string, string> => {
  const result: Record<string, string> = {};
  result[`${name}_start`] = format(from, 'yyyy-MM-dd');

  const endDate = to ?? from;
  result[`${name}_end`] = format(endDate, 'yyyy-MM-dd');

  return result;
};
