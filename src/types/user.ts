export interface User {
  id: number;
  name: string;
  email: string;
  color?: any;
  role: string;
}

export interface UserSelectorProps {
  users: User[];
  currentUser: User;
  onUserChange: (user: User) => void;
}