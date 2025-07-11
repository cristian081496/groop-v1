import { useNavigate } from "react-router-dom";
import UserTable from "../components/users/UserTable";
import Alert from "../components/common/Alert";
import LoadMoreButton from "../components/common/LoadMoreButton";
import SectionHeader from "../components/common/SectionHeader";
import { MainLayout } from "../components/layout";
import { useUsers } from "../hooks/useUsers";

const AdminUsers = () => {
  const navigate = useNavigate();
  const {
    users,
    loading,
    error,
    success,
    hasMore,
    processingUser,
    fetchUsers,
    handleRoleChange
  } = useUsers();

  return (
    <MainLayout>
      <main className="py-8">
        <div className="mx-auto max-w-[1280px] px-4">
          <SectionHeader
            title="Manage Users"
            action={
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-secondary px-4 py-2 rounded-md text-sm"
              >
                Back to Dashboard
              </button>
            }
          />

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <UserTable
            users={users}
            processingUser={processingUser}
            onRoleChange={handleRoleChange}
          />

          {loading && users.length === 0 ? (
            <div className="text-center py-4 bg-white rounded-lg shadow-sm">
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 bg-white rounded-lg shadow-sm">
              <p>No users found</p>
            </div>
          ) : null}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <LoadMoreButton
                onClick={() => fetchUsers()}
                loading={loading}
                hasMore={hasMore}
                text="Load More Users"
              />
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
};


export default AdminUsers;
