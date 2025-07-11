import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/authUtils";
import { useUser } from "../store/useUser";
import { MainLayout } from "../components/layout";
import { getPost, deletePost, toggleLikePost } from "../services/api";
import { Post } from "../types/post";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUser();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const fetchedPost = await getPost(id);
        setPost(fetchedPost);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!id || !post || likeLoading) return;
    
    setLikeLoading(true);
    
    try {
      const result = await toggleLikePost(id);
      setPost({
        ...post,
        likeCount: result.likeCount,
        likes: result.liked 
          ? [...(post.likes || []), user?.uid || ""] 
          : (post.likes || []).filter(uid => uid !== user?.uid)
      });
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(err instanceof Error ? err.message : "Failed to like post");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !post || deleteLoading) return;
    
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setDeleteLoading(true);
    
    try {
      await deletePost(id);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err instanceof Error ? err.message : "Failed to delete post");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading post...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error || "Post not found"}</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-secondary px-4 py-2 rounded-md text-sm"
        >
          Back to Dashboard
        </button>
      </MainLayout>
    );
  }

  const isAuthor = user?.uid === post.authorId;
  const canModify = isAuthor || isAdmin;
  const isLiked = post.likes?.includes(user?.uid || "") || false;

  return (
    <MainLayout>
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="text-primary hover:text-primary-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {post.imageURL && (
              <div className="w-full h-64 md:h-96 bg-gray-200">
                <img 
                  src={post.imageURL} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                
                {canModify && (
                  <div className="flex space-x-2">
                    {isAuthor && (
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>By {post.authorName}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.createdAt !== post.updatedAt && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Edited on {new Date(post.updatedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex items-center space-x-1 ${
                      isLiked ? 'text-primary' : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={isLiked ? "0" : "1.5"}
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{post.views} {post.views === 1 ? 'view' : 'views'}</span>
                  </div>
                </div>

                {post.pinned && (
                  <div className="text-xs font-medium text-primary bg-primary bg-opacity-10 px-2 py-1 rounded">
                    PINNED
                  </div>
                )}
              </div>
            </div>
          </div>
    </MainLayout>
  );
};

export default PostDetail;
