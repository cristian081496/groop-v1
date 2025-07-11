import { createContext } from "react";
import { UserContextType } from './userUtils.ts';

export const UserContext = createContext<UserContextType>({
  userProfile: null,
  loading: false,
  error: null,
  refreshProfile: async () => {},
  isAdmin: false,
});
