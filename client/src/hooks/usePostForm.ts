import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, updatePost, getUserProfile } from "../services/api";

interface UsePostFormOptions {
  mode: 'create' | 'edit';
  postId?: string;
  initialValues?: {
    title: string;
    content: string;
  };
}

export const usePostForm = ({ mode, postId }: UsePostFormOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async ({ 
    title, 
    content, 
    selectedImage 
  }: { 
    title: string; 
    content: string; 
    selectedImage: File | null;
  }) => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'create') {
        // First check if user profile exists
        try {
          await getUserProfile();
        } catch (error) {
          // If profile doesn't exist, show helpful message
          console.error("User profile not found:", error);
          setError("Your user profile is incomplete. Please visit the Profile page to set up your account.");
          setLoading(false);
          return;
        }
        
        const newPost = await createPost(title, content, selectedImage || undefined);
        navigate(`/posts/${newPost.id}`);
      } else if (mode === 'edit' && postId) {
        await updatePost(postId, title, content);
        setSuccess("Post updated successfully");
        
        // Navigate back to post detail after a short delay
        setTimeout(() => {
          navigate(`/posts/${postId}`);
        }, 1500);
      }
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} post:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${mode === 'create' ? 'create' : 'update'} post`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && postId) {
      navigate(`/posts/${postId}`);
    } else {
      navigate("/dashboard");
    }
  };

  return {
    loading,
    error,
    success,
    handleSubmit,
    handleCancel,
    setError,
    setSuccess
  };
};
