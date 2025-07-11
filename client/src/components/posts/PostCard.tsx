import { Link } from "react-router-dom";
import { Post } from "../../types/post";
import { FaThumbsUp, FaRegThumbsUp, FaEye } from 'react-icons/fa';
import { UserProfile } from "../../types/user";

interface PostCardProps {
  post: Post;
  userProfile: UserProfile | null;
  onLikeToggle: (post: Post, e: React.MouseEvent) => void;
}

const PostCard = ({ post, userProfile, onLikeToggle }: PostCardProps) => {
  const contentSnippet = post.content.length > 150
    ? `${post.content.substring(0, 150)}...`
    : post.content;

  // Check if current user has liked this post
  const isLiked = userProfile && post.likes && post.likes.includes(userProfile.uid);

  return (
    <Link key={post.id} to={`/posts/${post.id}`} className="block">
      <div
        className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ${post.pinned ? 'ring-2 ring-blue-400' : 'border border-gray-100'} flex flex-col h-full`}
      >
        {post.imageURL && (
          <div className="h-48 overflow-hidden">
            <img
              src={post.imageURL}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        <div className="p-5 flex-grow">
          {post.pinned && (
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium mb-3">
              <span className="mr-1">📌</span> PINNED
            </div>
          )}
          <h2 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors">{post.title}</h2>
          <p className="text-gray-600 line-clamp-3 mb-4 text-sm">{contentSnippet}</p>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 flex justify-between items-center text-sm bg-gray-50">
          <span className="text-gray-500 font-medium">By {post.authorName || 'Unknown'}</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => onLikeToggle(post, e)}
              className="flex items-center hover:text-primary transition-colors group"
            >
              {isLiked ? (
                <FaThumbsUp className="mr-1.5 text-blue-500 group-hover:scale-110 transition-transform" />
              ) : (
                <FaRegThumbsUp className="mr-1.5 group-hover:scale-110 transition-transform" />
              )}
              <span className={isLiked ? 'text-blue-500' : ''}>{post.likeCount}</span>
            </button>
            <span className="flex items-center text-gray-500">
              <FaEye className="mr-1.5" /> {post.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
