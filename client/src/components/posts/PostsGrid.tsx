import { Post } from "../../types/post";
import { UserProfile } from "../../types/user";
import PostCard from "./PostCard";

interface PostsGridProps {
  posts: Post[];
  userProfile: UserProfile | null;
  onLikeToggle: (post: Post, e: React.MouseEvent) => void;
  emptyMessage?: string;
}

const PostsGrid = ({ posts, userProfile, onLikeToggle, emptyMessage = "No posts found" }: PostsGridProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        <div className="mt-6">
          <a href="/create-post" className="btn-primary px-4 py-2 rounded-md text-sm">
            Create a new post
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          userProfile={userProfile} 
          onLikeToggle={onLikeToggle} 
        />
      ))}
    </div>
  );
};

export default PostsGrid;
