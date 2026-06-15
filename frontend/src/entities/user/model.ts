export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string | null;
  is_active: boolean;
}
