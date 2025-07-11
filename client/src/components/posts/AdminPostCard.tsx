import { Link } from "react-router-dom";
import { Post } from "../../types/post";
import { UserProfile } from "../../types/user";
import { FaThumbsUp, FaEye, FaEdit, FaTrash, FaThumbtack } from 'react-icons/fa';

interface AdminPostCardProps {
  post: Post;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  processingPostId: string | null;
  onPinToggle: (post: Post) => void;
  onDelete: (postId: string) => void;
  isPinned?: boolean;
}

const AdminPostCard = ({ 
  post, 
  userProfile, 
  isAdmin, 
  processingPostId, 
  onPinToggle, 
  onDelete,
  isPinned = false
}: AdminPostCardProps) => {
  const isAuthor = post.authorId === userProfile?.uid;
  const canModify = isAuthor || isAdmin;
  
  return (
    <div 
      key={post.id} 
      className={`bg-white shadow rounded-lg overflow-hidden ${processingPostId === post.id ? 'opacity-70' : ''} ${isPinned ? 'border-l-4 border-blue-500' : ''}`}
    >
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
                <Link to={`/posts/${post.id}`} className="hover:text-blue-600 transition-colors">
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
                onClick={() => onDelete(post.id)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
                disabled={processingPostId === post.id}
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onPinToggle(post)}
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
};

export default AdminPostCard;
