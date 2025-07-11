import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/api";
import { AuthLayout } from "../components/layout";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // preven duplicate submissions using both state and ref
    if (loading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      await signupUser(email, password, displayName);

      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Failed to register";

      if (err instanceof Error) {
        errorMessage = err.message;

        // Check for common error messages and provide clearer feedback
        if (errorMessage.includes("email") && errorMessage.includes("use")) {
          errorMessage = "This email address is already in use. Please use a different email or login instead.";
        } else if (errorMessage.includes("password") && (errorMessage.includes("weak") || errorMessage.includes("strong"))) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else if (errorMessage.includes("invalid") && errorMessage.includes("email")) {
          errorMessage = "Invalid email format. Please check your email address.";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="display-name" className="sr-only">Full Name</label>
            <input
              id="display-name"
              name="displayName"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-busy={loading}
            onClick={(e) => {
              if (loading) {
                e.preventDefault();
              }
            }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary text-blue-500 underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
