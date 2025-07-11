import { UserProfile } from "../types/user";
import { getUserProfile } from "../services/api";

export interface UserContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

interface FetchUserProfileParams {
  user: { uid?: string } | null;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const fetchUserProfile = async ({
  user,
  setUserProfile,
  setLoading,
  setError,
}: FetchUserProfileParams): Promise<void> => {
  if (!user) {
    setUserProfile(null);
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const profile = await getUserProfile();
    setUserProfile(profile);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    setError(err instanceof Error ? err.message : "Failed to fetch user profile");
  } finally {
    setLoading(false);
  }
};

export const refreshProfile = async (params: FetchUserProfileParams): Promise<void> => {
  await fetchUserProfile(params);
};

export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return userProfile?.role === "admin";
};
