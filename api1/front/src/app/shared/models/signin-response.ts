export interface SigninResponse {
  auth: boolean;
  jwt: string;
  id: string;
  email: string;
  name: string;
  photo: string;
  phone: string;
  role: string;
}
