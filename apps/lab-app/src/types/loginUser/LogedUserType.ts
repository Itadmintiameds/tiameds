export type UserLogedType = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[]; // e.g., ["TECHNICIAN", "ADMIN"]
  modules:  null; // or a specific type instead of `any` if module structure is known
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  enabled: boolean;
  is_verified: boolean;
};
