import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.endsWith("@srec.ac.in")) {
      setError("Only @srec.ac.in email addresses are allowed.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const res = await axios.get("http://127.0.0.1:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const role = res.data.role;
      if (role === "student") navigate("/student/dashboard");
      else if (role === "staff") navigate("/staff/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Account not found. Please contact your administrator.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="text-2xl font-bold">Campus Platform</h1>
          <p className="text-blue-200 text-sm mt-1">SREC College Communication System</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome Back!</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in with your college email</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="yourname@srec.ac.in"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg mt-2">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              🔒 Only <strong>@srec.ac.in</strong> email addresses are allowed
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Contact your administrator if you need access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}