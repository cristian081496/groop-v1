import { useState, useEffect } from "react";
import { getUsers, updateUserRole } from "../services/api";
import { UserProfile } from "../types/user";
import { useNavigate } from "react-router-dom";
import { useUser } from "../store/useUser";

export const useUsers = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const fetchUsers = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const lastUserId = reset ? undefined : lastId || undefined;
      const response = await getUsers(20, lastUserId);
      
      setUsers(prev => reset ? response.users : [...prev, ...response.users]);
      setLastId(response.lastId);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not admin
    if (isAdmin === false) {
      navigate("/dashboard");
      return;
    }
    
    fetchUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, navigate]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setProcessingUser(userId);
    setError(null);
    setSuccess(null);
    
    try {
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { ...user, role: newRole } : user
        )
      );
      
      setSuccess(`User role updated to ${newRole}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError(err instanceof Error ? err.message : "Failed to update user role");
    } finally {
      setProcessingUser(null);
    }
  };

  return {
    users,
    loading,
    error,
    success,
    hasMore,
    processingUser,
    fetchUsers,
    handleRoleChange,
    setError,
    setSuccess
  };
};
