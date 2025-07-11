import { auth } from "../firebase";
import { UserProfile } from "../types/user";
import { Post } from "../types/post";

const API_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000") + "/api";

// Helper to get the current user's token
const getToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.getIdToken();
};

// Auth API
export const signupUser = async (email: string, password: string, displayName: string) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, displayName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign up");
  }

  return response.json();
};

// User API
export const getUserProfile = async (): Promise<UserProfile> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }

  return response.json();
};

export const updateUserProfile = async (displayName: string): Promise<{ message: string }> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
};

export const uploadProfileImage = async (image: File): Promise<{ photoURL: string }> => {
  const token = await getToken();
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_URL}/users/profile/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload image");
  }

  return response.json();
};

// Posts API
export const getPosts = async (
  limit = 10,
  lastId?: string,
  pinned?: boolean,
  userId?: string
): Promise<{ posts: Post[]; lastId: string | null; hasMore: boolean }> => {
  const token = await getToken();

  let url = `${API_URL}/posts?limit=${limit}`;
  if (lastId) url += `&lastId=${lastId}`;
  if (pinned !== undefined) url += `&pinned=${pinned}`;
  if (userId) url += `&userId=${userId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch posts");
  }

  return response.json();
};

export const getPost = async (id: string): Promise<Post> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/posts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch post");
  }

  return response.json();
};

export const createPost = async (title: string, content: string, image?: File): Promise<Post> => {
  const token = await getToken();

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (image) formData.append("image", image);

  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }

  return response.json();
};

export const updatePost = async (
  id: string,
  title: string,
  content: string
): Promise<{ message: string }> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update post");
  }

  return response.json();
};

export const deletePost = async (id: string): Promise<{ message: string }> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete post");
  }

  return response.json();
};

export const togglePinPost = async (id: string, pinned: boolean): Promise<{ message: string }> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/posts/${id}/pin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pinned }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update pin status");
  }

  return response.json();
};

export const toggleLikePost = async (
  id: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/posts/${id}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle like");
  }

  return response.json();
};

// Admin API
export const getUsers = async (
  limit = 20,
  lastId?: string
): Promise<{ users: UserProfile[]; lastId: string | null; hasMore: boolean }> => {
  const token = await getToken();

  let url = `${API_URL}/admin/users?limit=${limit}`;
  if (lastId) url += `&lastId=${lastId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch users");
  }

  return response.json();
};

export const updateUserRole = async (
  userId: string,
  role: "user" | "admin"
): Promise<{ message: string }> => {
  const token = await getToken();

  const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user role");
  }

  return response.json();
};
