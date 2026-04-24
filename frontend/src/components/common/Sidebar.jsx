import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { label: "Users", path: "/admin/users", icon: "👥" },
    { label: "Courses", path: "/admin/courses", icon: "📚" },
    { label: "Assignments", path: "/admin/assignments", icon: "📝" },
    { label: "Blogs", path: "/admin/blogs", icon: "✍️" },
    { label: "Notifications", path: "/admin/notifications", icon: "🔔" },
    { label: "RAG Chatbot", path: "/admin/rag", icon: "🤖" },
  ],
  staff: [
    { label: "Dashboard", path: "/staff/dashboard", icon: "🏠" },
    { label: "Courses", path: "/staff/courses", icon: "📚" },
    { label: "Assignments", path: "/staff/assignments", icon: "📝" },
    { label: "Blogs", path: "/staff/blogs", icon: "✍️" },
    { label: "Notifications", path: "/staff/notifications", icon: "🔔" },
    { label: "Chatbot", path: "/staff/chatbot", icon: "🤖" },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: "🏠" },
    { label: "Courses", path: "/student/courses", icon: "📚" },
    { label: "Assignments", path: "/student/assignments", icon: "📝" },
    { label: "Blogs", path: "/student/blogs", icon: "✍️" },
    { label: "Notifications", path: "/student/notifications", icon: "🔔" },
    { label: "Chatbot", path: "/student/chatbot", icon: "🤖" },
  ],
};

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = userProfile?.role || "admin";
  const items = menuItems[role] || menuItems.admin;

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Campus Platform</h1>
        <p className="text-sm text-gray-400 mt-1">
          {userProfile?.full_name || "Loading..."}
        </p>
        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-600 capitalize">
          {userProfile?.role || "..."}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 text-left flex items-center gap-3"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}