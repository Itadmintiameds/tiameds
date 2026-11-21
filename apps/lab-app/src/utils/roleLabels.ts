// Display names for backend role codes. The codes themselves (sent to / received
// from the backend) stay unchanged — only what the user sees is mapped here.
export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Admin/Manager',
  TECHNICIAN: 'Technician',
  DESKROLE: 'Receptionist/Desk Operator',
};

export const getRoleLabel = (role: string): string =>
  ROLE_LABELS[role?.toUpperCase()] ?? role;
