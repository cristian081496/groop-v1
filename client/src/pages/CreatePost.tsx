import { MainLayout } from "../components/layout";
import PostForm from "../components/posts/PostForm";
import SectionHeader from "../components/common/SectionHeader";
import { usePostForm } from "../hooks/usePostForm";

const CreatePost = () => {
  const { loading, error, handleSubmit, handleCancel } = usePostForm({
    mode: 'create'
  });

  return (
    <MainLayout>
          <SectionHeader 
            title="Create New Post" 
            subtitle="Share something with the community"
          />

          <PostForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            buttonText="Create Post"
            loadingText="Creating..."
            onCancel={handleCancel}
          />
    </MainLayout>
  );
};

export default CreatePost;
