export interface User {
  name: string;
  email: string;
  document: string;
  phone: string;
  photo?: string;
  gender: string;
  birth_date: string;
  password?: string;
  conf_password?: string;
  role: string;
}
