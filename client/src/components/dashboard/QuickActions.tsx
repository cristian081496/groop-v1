import { Link } from "react-router-dom";
import { MdGridView, MdSettings } from 'react-icons/md';
import { useUser } from "../../store/useUser";
import { FaEdit } from "react-icons/fa";

const QuickActions = () => {
  const { isAdmin } = useUser();
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    <Link to="/create-post" className="flex flex-col justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
          <FaEdit className="text-blue-600 text-xl" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Create Post</h3>
        <p className="text-sm text-gray-600">Share your thoughts with the community</p>
      </div>
      <div className="bg-blue-50 px-6 py-3 text-xs text-blue-700 font-medium flex justify-between items-center">
        <span>Start writing</span>
        <span>→</span>
      </div>
    </Link>

    <Link to="/manage-posts" className="flex flex-col justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
          <MdGridView className="text-purple-600 text-xl" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Manage Posts</h3>
        <p className="text-sm text-gray-600">Edit or delete your existing posts.
          {isAdmin && (
            <i>
              <br />
              <span>as an <b> ADMIN </b> you can manage all posts </span>
            </i>
          )}
        </p>
      </div>
      <div className="bg-purple-50 px-6 py-3 text-xs text-purple-700 font-medium flex justify-between items-center">
        <span>View your content</span>
        <span>→</span>
      </div>
    </Link>

    <Link to="/profile" className="flex flex-col justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
          <MdSettings className="text-green-600 text-xl" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Profile Settings</h3>
        <p className="text-sm text-gray-600">Update your profile information</p>
      </div>
      <div className="bg-green-50 px-6 py-3 text-xs text-green-700 font-medium flex justify-between items-center">
        <span>Edit profile</span>
        <span>→</span>
      </div>
    </Link>
  </div>;
};

export default QuickActions;
