export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'admin' | 'user';
  verified: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}