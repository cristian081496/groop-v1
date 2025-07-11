import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { deletePost, togglePinPost } from "../services/api";
import { Post } from "../types/post";
import { useUser } from "../store/useUser";
import { FaThumbsUp, FaEye, FaEdit, FaTrash, FaThumbtack } from 'react-icons/fa';
import { usePosts } from "../hooks/usePosts";
import SectionHeader from "../components/common/SectionHeader";
import Alert from "../components/common/Alert";
import LoadMoreButton from "../components/common/LoadMoreButton";

const ManagePosts = () => {
  const navigate = useNavigate();
  const { userProfile, isAdmin } = useUser();
  const [success, setSuccess] = useState<string | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  
  // Use effect to redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);
  
  const { 
    posts, 
    loading, 
    error, 
    hasMore, 
    fetchPosts 
  } = usePosts();

  const handlePinToggle = async (post: Post) => {
    setProcessingPostId(post.id);
    try {
      await togglePinPost(post.id, !post.pinned);
      // Update the post in the list
      setSuccess(`Post ${post.title} has been ${post.pinned ? 'unpinned' : 'pinned'}`);
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

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          {!loading && posts.length === 0 && !error && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">No posts found</p>
              <Link to="/create-post" className="btn-primary px-4 py-2 rounded-md text-sm">
                Create a post
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {posts.map(post => {
              const isAuthor = post.authorId === userProfile?.uid;
              const canModify = isAuthor || isAdmin;
              
              return (
                <div key={post.id} className={`bg-white shadow rounded-lg overflow-hidden ${processingPostId === post.id ? 'opacity-70' : ''}`}>
                  <div className="flex flex-col md:flex-row">
                    {post.imageURL && (
                      <div className="md:w-1/4 h-48 md:h-auto">
                        <img 
                          src={post.imageURL} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-6 flex-1 ${!post.imageURL ? 'w-full' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">
                            <Link to={`/posts/${post.id}`} className="hover:text-primary">
                              {post.title}
                            </Link>
                          </h2>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        {post.pinned && (
                          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Pinned
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>
                          <span>By {post.authorName || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <FaThumbsUp className="mr-1.5 text-blue-500" /> {post.likeCount || 0}
                          </span>
                          <span className="flex items-center">
                            <FaEye className="mr-1.5 text-gray-500" /> {post.views || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        {isAuthor && (
                          <Link
                            to={`/edit-post/${post.id}`}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </Link>
                        )}
                        {canModify && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="flex items-center text-sm text-red-600 hover:text-red-800"
                            disabled={processingPostId === post.id}
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handlePinToggle(post)}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                            disabled={processingPostId === post.id}
                          >
                            {post.pinned ? (
                              <>
                                <FaThumbtack className="mr-1" /> Unpin
                              </>
                            ) : (
                              <>
                                <FaThumbtack className="mr-1" /> Pin
                              </>
                            )}
                          </button>
                        )}
                        <Link
                          to={`/posts/${post.id}`}
                          className="ml-auto text-sm text-gray-600 hover:text-gray-800"
                        >
                          View Post →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
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
