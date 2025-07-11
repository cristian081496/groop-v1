import { useState, useEffect } from "react";
import { UserProfile } from '../types/user';
import { useAuth } from './authUtils';
import { fetchUserProfile, isAdmin, refreshProfile } from './userUtils.ts';
import { UserContext } from './UserContextValue';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    fetchUserProfile({ user, setUserProfile, setLoading, setError });
  }, [user]);
  
  const admin = isAdmin(userProfile);
  
  return (
    <UserContext.Provider
      value={{
        userProfile,
        loading,
        error,
        refreshProfile: () => refreshProfile({ user, setUserProfile, setLoading, setError }),
        isAdmin: admin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
