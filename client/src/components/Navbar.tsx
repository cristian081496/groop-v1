import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../store/authUtils";
import { useUser } from "../store/useUser";
import { FiHome, FiUser, FiPlusCircle, FiUsers, FiLogOut, FiMenu, FiX } from "react-icons/fi";

// Add animation to tailwind classes
import "../assets/styles/navbar-animations.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { userProfile, isAdmin } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/95 shadow py-3">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight">Groop</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors flex items-center gap-1.5`}>
                  <FiHome className="text-lg" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/profile" className={`${location.pathname === '/profile' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors flex items-center gap-1.5`}>
                  <FiUser className="text-lg" />
                  <span>Profile</span>
                </Link>
                <Link to="/create-post" className={`${location.pathname === '/create-post' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors flex items-center gap-1.5`}>
                  <FiPlusCircle className="text-lg" />
                  <span>New Post</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin/users" className={`${location.pathname === '/admin/users' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors flex items-center gap-1.5`}>
                    <FiUsers className="text-lg" />
                    <span>Manage Users</span>
                  </Link>
                )}
                <div className="ml-6 flex items-center space-x-3 pl-6 border-l border-gray-200">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || 'User'}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-primary/20"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-green-500 border-1 border-green-500  shadow-sm">
                      {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {userProfile?.displayName || user.email?.split('@')[0]}
                    </span>
                    {userProfile?.displayName && user.email && (
                      <span className="text-xs text-gray-500">{user.email}</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary px-4 py-2 rounded-md text-sm flex items-center gap-1.5 ml-2"
                    aria-label="Logout"
                  >
                    <FiLogOut className="text-lg" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary transition-colors py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-5 py-2 rounded-md text-sm shadow-sm hover:shadow transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary focus:outline-none p-1.5 rounded-md transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-3 shadow-lg absolute w-full left-0 top-full animate-fadeIn">
          <div className="mx-auto max-w-[1280px] px-4 space-y-1.5">
            {user ? (
              <>
                <div className="py-3 border-b border-gray-200 flex items-center space-x-3">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || 'User'}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-offset-1 ring-primary/20"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-lg font-medium">
                      {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {userProfile?.displayName || user.email?.split('@')[0]}
                    </span>
                    {userProfile?.displayName && user.email && (
                      <span className="text-xs text-gray-500">{user.email}</span>
                    )}
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 py-3 px-2 ${location.pathname === '/dashboard' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors rounded-md`}
                >
                  <FiHome className="text-lg" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 py-3 px-2 ${location.pathname === '/profile' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors rounded-md`}
                >
                  <FiUser className="text-lg" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/create-post"
                  className={`flex items-center gap-2 py-3 px-2 ${location.pathname === '/create-post' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors rounded-md`}
                >
                  <FiPlusCircle className="text-lg" />
                  <span>New Post</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-2 py-3 px-2 ${location.pathname === '/admin/users' ? 'text-primary font-medium' : 'text-gray-700'} hover:text-primary transition-colors rounded-md`}
                  >
                    <FiUsers className="text-lg" />
                    <span>Manage Users</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 py-3 px-2 text-left text-gray-700 hover:text-primary transition-colors rounded-md mt-2"
                >
                  <FiLogOut className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-3">
                <Link
                  to="/login"
                  className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-md text-gray-700 hover:text-primary hover:border-primary/30 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex justify-center items-center py-2.5 px-4 btn-primary rounded-md shadow-sm hover:shadow transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
