import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, assignRes, blogRes] = await Promise.all([
          api.get("/api/notifications/"),
          api.get("/api/assignments/"),
          api.get("/api/blogs/")
        ]);
        setNotifications(notifRes.data.slice(0, 5));
        setAssignments(assignRes.data.slice(0, 3));
        setBlogs(blogRes.data.slice(0, 3));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = due - now;
    if (diff < 0) return { text: "Expired", color: "text-red-600" };
    const days = Math.floor(diff / 86400000);
    if (days === 0) return { text: "Due today!", color: "text-orange-600" };
    return { text: `${days} days left`, color: "text-green-600" };
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div>
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-3xl font-bold mb-1">
            Welcome, {userProfile?.full_name}! 👋
          </h1>
          <p className="opacity-80">
            {userProfile?.department} • Class {userProfile?.class_name} • Batch {userProfile?.batch} • Roll No: {userProfile?.rollno}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Notifications", value: unreadCount, icon: "🔔", color: "bg-blue-500", path: "/student/notifications" },
            { label: "Assignments", value: assignments.length, icon: "📝", color: "bg-purple-500", path: "/student/assignments" },
            { label: "Blogs", value: blogs.length, icon: "✍️", color: "bg-orange-500", path: "/student/blogs" },
            { label: "Course Materials", value: "View", icon: "📚", color: "bg-green-500", path: "/student/courses" },
          ].map(card => (
            <div key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition">
              <div className={`${card.color} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-gray-500 text-xs">{card.label}</p>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📝 Assignments</h2>
              <button onClick={() => navigate("/student/assignments")}
                className="text-blue-600 text-sm hover:underline">View All</button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : assignments.length === 0 ? (
              <p className="text-gray-400 text-sm">No assignments yet</p>
            ) : (
              <div className="space-y-3">
                {assignments.map(a => {
                  const status = getDeadlineStatus(a.deadline);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.department} • {a.class_name}</p>
                      </div>
                      <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🔔 Notifications</h2>
              <button onClick={() => navigate("/student/notifications")}
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

          <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">✍️ Recent Blogs</h2>
              <button onClick={() => navigate("/student/blogs")}
                className="text-blue-600 text-sm hover:underline">View All</button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : blogs.length === 0 ? (
              <p className="text-gray-400 text-sm">No blogs yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {blogs.map(blog => (
                  <div key={blog.id} className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {blog.club}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-2 mb-1 text-sm">{blog.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{blog.description}</p>
                    <p className="text-xs text-gray-400 mt-2">By {blog.author_name}</p>
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