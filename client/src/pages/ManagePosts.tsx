import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { deletePost, togglePinPost, getPosts } from "../services/api";
import { Post } from "../types/post";
import { useUser } from "../store/useUser";
import SectionHeader from "../components/common/SectionHeader";
import Alert from "../components/common/Alert";
import LoadMoreButton from "../components/common/LoadMoreButton";
import AdminPostCard from "../components/posts/AdminPostCard";

const ManagePosts = () => {
  const navigate = useNavigate();
  const { userProfile, isAdmin } = useUser();
  const [success, setSuccess] = useState<string | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'own'>('all');
  
  // Posts state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Use effect to redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);
  
  // Function to fetch posts
  const fetchPosts = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const lastPostId = reset ? undefined : lastId || undefined;
      const userId = activeTab === 'own' ? userProfile?.uid : undefined;
      const response = await getPosts(9, lastPostId, undefined, userId);
      
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
  
  // Load posts when tab changes
  useEffect(() => {
    fetchPosts(true);
  }, [activeTab, userProfile?.uid]);

  const handlePinToggle = async (post: Post) => {
    setProcessingPostId(post.id);
    try {
      await togglePinPost(post.id, !post.pinned);
      // Update the post in the list
      setSuccess(`Post ${post.title} has been ${post.pinned ? 'unpinned' : 'pinned'}`);
      // Reload posts to reflect the changes
      fetchPosts(true);
    } catch (err) {
      console.error("Error toggling pin status:", err);
    } finally {
      setProcessingPostId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deletePost(postId);
      setSuccess(`Post has been deleted`);
      // Reload posts to reflect the changes
      fetchPosts(true);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <MainLayout>
          <SectionHeader 
            title="Manage Posts" 
            action={
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/create-post")}
                  className="btn-primary px-4 py-2 rounded-md text-sm"
                >
                  Create New Post
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-secondary px-4 py-2 rounded-md text-sm"
                >
                  Back to Dashboard
                </button>
              </div>
            }
          />

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('all')}
            >
              All Posts
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'own' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('own')}
            >
              My Posts
            </button>
          </div>
          
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          {loading && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading posts...</p>
            </div>
          )}

          {!loading && posts.length === 0 && pinnedPosts.length === 0 && !error && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">No posts found</p>
              <Link to="/create-post" className="btn-primary px-4 py-2 rounded-md text-sm">
                Create a post
              </Link>
            </div>
          )}

          {!loading && (posts.length > 0 || pinnedPosts.length > 0) && (
            <div className="space-y-6">
              {/* Pinned Posts Section */}
              {pinnedPosts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Pinned Posts</h3>
                  <div className="space-y-4">
                    {pinnedPosts.map(post => (
                      <AdminPostCard
                        key={post.id}
                        post={post}
                        userProfile={userProfile}
                        isAdmin={isAdmin}
                        processingPostId={processingPostId}
                        onPinToggle={handlePinToggle}
                        onDelete={handleDeletePost}
                        isPinned={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Regular Posts Section */}
              {posts.length > 0 && (
                <div>
                  {pinnedPosts.length > 0 && (
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Regular Posts</h3>
                  )}
                  <div className="space-y-4">
                    {posts.map(post => (
                      <AdminPostCard
                        key={post.id}
                        post={post}
                        userProfile={userProfile}
                        isAdmin={isAdmin}
                        processingPostId={processingPostId}
                        onPinToggle={handlePinToggle}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {hasMore && (
            <div className="px-6 py-4 border-t border-gray-200">
              <LoadMoreButton 
                onClick={() => fetchPosts(false)}
                loading={loading}
                hasMore={hasMore}
                text="Load More Posts"
                loadingText="Loading..."
                className="btn-secondary px-6 py-2 rounded-md flex items-center"
              />
            </div>
          )}
    </MainLayout>
  );
};

export default ManagePosts;
