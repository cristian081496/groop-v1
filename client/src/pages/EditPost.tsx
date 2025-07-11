import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout";
import SectionHeader from "../components/common/SectionHeader";
import PostForm from "../components/posts/PostForm";
import Alert from "../components/common/Alert";
import { usePostForm } from "../hooks/usePostForm";
import { getPost } from "../services/api";
import { useUser } from "../store/useUser";

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({ title: "", content: "", imageURL: "" });
  
  const { loading, error, success, handleSubmit, handleCancel } = usePostForm({
    mode: 'edit',
    postId: id
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const post = await getPost(id);
        
        // Check if user is authorized to edit this post
        if (userProfile?.uid !== post.authorId) {
          navigate("/dashboard");
          return;
        }
        
        setInitialValues({
          title: post.title,
          content: post.content,
          imageURL: post.imageURL || ""
        });
        setFetchLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setFetchLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, userProfile]);

  if (fetchLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
          <SectionHeader 
            title="Edit Post" 
            subtitle="Update your post content"
          />

          {success && <Alert type="success" message={success} />}

          <PostForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            buttonText="Update Post"
            loadingText="Updating..."
            onCancel={handleCancel}
            cancelText="Back to Post"
          />
    </MainLayout>
  );
};

export default EditPost;
