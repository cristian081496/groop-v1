import { Link } from "react-router-dom";
import { MainLayout, GuestLayout } from "../components/layout";
import SectionHeader from "../components/common/SectionHeader";
import PostsGrid from "../components/posts/PostsGrid";
import Alert from "../components/common/Alert";
import LoadMoreButton from "../components/common/LoadMoreButton";
import { usePosts } from "../hooks/usePosts";
import { toggleLikePost } from "../services/api";
import { Post } from "../types/post";

const Home = () => {
  const { user, loading: authLoading, posts, pinnedPosts, hasMore, loading, error, loadMorePosts } = usePosts();
  
  const handleLikeToggle = async (post: Post, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await toggleLikePost(post.id);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Guest view with login/register options
  if (!user && !authLoading) {
    return (
      <GuestLayout>
        <div className="text-center py-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to Groop
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            A community platform for sharing and discussing ideas
          </p>
          
          <div className="mt-10 flex justify-center">
            <Link
              to="/register"
              className="btn-primary px-8 py-3 rounded-md text-base font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <MainLayout>
      <SectionHeader 
        title="Latest Posts" 
        subtitle="Discover what's new in the community"
      />
      
      {loading && posts.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && <Alert type="error" message={error} />}
      
      {!loading && posts.length === 0 && pinnedPosts.length === 0 && !error && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Link to="/create-post" className="btn-primary px-4 py-2 rounded-md text-sm">
            Create the first post
          </Link>
        </div>
      )}
      
      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Pinned Posts</h3>
          <PostsGrid 
            posts={pinnedPosts} 
            userProfile={null}
            onLikeToggle={handleLikeToggle}
          />
        </div>
      )}
      
      {/* Regular Posts */}
      {posts.length > 0 && (
        <div>
          {pinnedPosts.length > 0 && <h3 className="text-lg font-medium mb-4">Recent Posts</h3>}
          <PostsGrid 
            posts={posts} 
            userProfile={null}
            onLikeToggle={handleLikeToggle}
            emptyMessage="No posts available"
          />
        </div>
      )}
      
      <div className="mt-8 flex justify-center">
        <LoadMoreButton 
          onClick={loadMorePosts}
          loading={loading}
          hasMore={hasMore}
          className="btn-secondary px-6 py-2 rounded-md"
        />
      </div>
    </MainLayout>
  );
};

export default Home;
