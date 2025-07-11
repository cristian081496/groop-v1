import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import { Post } from "../types/post";
import { useAuth } from "../store/authUtils";

export const usePosts = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Function to fetch posts with reset option
  const fetchPosts = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const lastPostId = reset ? undefined : lastId || undefined;
      const response = await getPosts(9, lastPostId);
      
      // Separate pinned posts from regular posts
      const pinned = response.posts.filter((post) => post.pinned);
      const regular = response.posts.filter((post) => !post.pinned);
      
      if (reset) {
        setPinnedPosts(pinned);
        setPosts(regular);
      } else {
        // Only append regular posts, replace pinned posts
        setPinnedPosts(pinned);
        setPosts(prev => [...prev, ...regular]);
      }
      
      setLastId(response.lastId);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load more posts (convenience wrapper)
  const loadMorePosts = () => fetchPosts(false);
  
  // Initial fetch
  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts(true);
    }
    // We can't include fetchPosts in the dependency array as it would cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  return {
    user,
    loading,
    error,
    posts,
    pinnedPosts,
    lastId,
    hasMore,
    fetchPosts,
    loadMorePosts,
    authLoading
  };
};
