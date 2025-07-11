export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  photoURL: string;
  createdAt: string;
  updatedAt?: string;
}
