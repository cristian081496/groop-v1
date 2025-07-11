import { useAuth } from "../../store/authUtils";
import { useUser } from "../../store/useUser";

const DashboardHeader = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  return <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, <span className="font-medium text-primary">{userProfile?.displayName || user?.displayName || "User"}</span>!</p>
      </div>
      <div className="hidden md:block">
        <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm">
          <span className="font-medium">Last login:</span> Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  </div>;
};

export default DashboardHeader;
