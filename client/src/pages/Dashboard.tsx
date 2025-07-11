import { useAuth } from "../store/authUtils";
import { useUser } from "../store/useUser";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { toggleLikePost } from "../services/api";
import { Post } from "../types/post";
import QuickActions from "../components/dashboard/QuickActions";
import { usePosts } from "../hooks/usePosts";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PostsGrid from "../components/posts/PostsGrid";
import SectionHeader from "../components/common/SectionHeader";
import LoadMoreButton from "../components/common/LoadMoreButton";
import Alert from "../components/common/Alert";

const Dashboard = () => {
  const { loading: authLoading } = useAuth();
  const { userProfile } = useUser();

  const { posts, pinnedPosts, hasMore, loading, error, loadMorePosts } = usePosts();

  const handleLikeToggle = async (post: Post, event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await toggleLikePost(post.id);
      // The post update will be handled by refetching posts if needed
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Quick Actions */}
      <QuickActions />

      {/* Posts Section */}
      <div className="mb-10">
        <SectionHeader 
          title="Posts" 
          subtitle="Discover the latest content from your community" 
        />

        {loading && posts.length === 0 && pinnedPosts.length === 0 && (
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
              userProfile={userProfile} 
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
              userProfile={userProfile} 
              onLikeToggle={handleLikeToggle} 
              emptyMessage="No posts yet. Get started by creating a new post."
            />
          </div>
        )}

        {/* Load More Button */}
        <div className="mt-8 flex justify-center">
          <LoadMoreButton 
            onClick={loadMorePosts} 
            loading={loading} 
            hasMore={hasMore}
            className="btn-secondary px-6 py-2 rounded-md"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
