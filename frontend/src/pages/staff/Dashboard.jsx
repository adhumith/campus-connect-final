import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, blogRes] = await Promise.all([
          api.get("/api/notifications/"),
          api.get("/api/blogs/")
        ]);
        setNotifications(notifRes.data.slice(0, 5));
        setBlogs(blogRes.data.slice(0, 3));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-3xl font-bold mb-1">
            Welcome, {userProfile?.full_name}! 👋
          </h1>
          <p className="opacity-80">{userProfile?.department} • Staff</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Upload Material", icon: "📚", color: "bg-blue-500", path: "/staff/courses" },
            { label: "Create Assignment", icon: "📝", color: "bg-purple-500", path: "/staff/assignments" },
            { label: "Write Blog", icon: "✍️", color: "bg-green-500", path: "/staff/blogs" },
            { label: "Notifications", icon: "🔔", color: "bg-orange-500", path: "/staff/notifications" },
          ].map(card => (
            <div key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition">
              <div className={`${card.color} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <p className="font-medium text-gray-700 text-sm">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🔔 Notifications</h2>
              <button onClick={() => navigate("/staff/notifications")}
                className="text-blue-600 text-sm hover:underline">View All</button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-400 text-sm">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id}
                    className={`p-3 rounded-xl ${!n.is_read ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"}`}>
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                      {!n.is_read && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">New</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">✍️ Recent Blogs</h2>
              <button onClick={() => navigate("/staff/blogs")}
                className="text-blue-600 text-sm hover:underline">View All</button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : blogs.length === 0 ? (
              <p className="text-gray-400 text-sm">No blogs yet</p>
            ) : (
              <div className="space-y-3">
                {blogs.map(blog => (
                  <div key={blog.id} className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {blog.club}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-2 mb-1 text-sm">{blog.title}</h3>
                    <p className="text-xs text-gray-400">By {blog.author_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}