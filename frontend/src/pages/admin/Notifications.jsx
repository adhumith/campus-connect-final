import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const DEPARTMENTS = ["All", "CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const BATCHES = ["All", "2021", "2022", "2023", "2024", "2025"];
const ROLES = ["All", "student", "staff"];

function SendNotificationModal({ onClose, onSent }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "general",
    target_department: "",
    target_class: "",
    target_batch: "",
    target_role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!form.title || !form.message) {
      setError("Title and message are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
      };
      if (form.target_department && form.target_department !== "All")
        payload.target_department = form.target_department;
      if (form.target_class)
        payload.target_class = form.target_class;
      if (form.target_batch && form.target_batch !== "All")
        payload.target_batch = form.target_batch;
      if (form.target_role && form.target_role !== "All")
        payload.target_role = form.target_role;

      await api.post("/api/notifications/", payload);
      onSent();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send notification");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-1">Send Notification</h3>
        <p className="text-gray-500 text-sm mb-4">
          Send to everyone or target specific students/staff
        </p>
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <div className="space-y-3">
          <input type="text" placeholder="Notification Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" />
          <select value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="general">📢 General</option>
            <option value="assignment">📝 Assignment</option>
            <option value="course">📚 Course</option>
            <option value="blog">✍️ Blog</option>
            <option value="urgent">🚨 Urgent</option>
          </select>

          {/* Target Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              🎯 Target (leave empty to send to everyone)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Department</label>
                <select value={form.target_department}
                  onChange={(e) => setForm({ ...form, target_department: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {DEPARTMENTS.map(d => <option key={d} value={d === "All" ? "" : d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Class</label>
                <input type="text" placeholder="e.g. A or B"
                  value={form.target_class}
                  onChange={(e) => setForm({ ...form, target_class: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Batch/Year</label>
                <select value={form.target_batch}
                  onChange={(e) => setForm({ ...form, target_batch: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {BATCHES.map(b => <option key={b} value={b === "All" ? "" : b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                <select value={form.target_role}
                  onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map(r => <option key={r} value={r === "All" ? "" : r}>{r}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Example: Select CSE + A + 2024 to notify only CSE-A 2024 batch students
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSend} disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotifications() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications/");
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await api.put(`/api/notifications/${n.id}/read`);
    }
    fetchNotifications();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment": return "📝";
      case "course": return "📚";
      case "blog": return "✍️";
      case "urgent": return "🚨";
      default: return "📢";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "assignment": return "bg-purple-100 text-purple-700";
      case "course": return "bg-blue-100 text-blue-700";
      case "blog": return "bg-green-100 text-green-700";
      case "urgent": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                ✅ Mark All Read
              </button>
            )}
            {(userProfile?.role === "admin" || userProfile?.role === "staff") && (
              <button onClick={() => setShowSend(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                📢 Send Notification
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-gray-500 text-lg">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div key={notification.id}
                className={`bg-white rounded-2xl shadow p-5 flex items-start gap-4 transition ${
                  !notification.is_read ? "border-l-4 border-blue-500" : "opacity-75"
                }`}>
                <div className="text-3xl">{getTypeIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{notification.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {!notification.is_read && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500 text-white">
                          New
                        </span>
                      )}
                      {/* Show target info */}
                      {notification.target && Object.keys(notification.target).length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          🎯 {Object.values(notification.target).join(" • ")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{notification.message}</p>
                </div>
                {!notification.is_read && (
                  <button onClick={() => handleMarkRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSend && (
        <SendNotificationModal
          onClose={() => setShowSend(false)}
          onSent={fetchNotifications}
        />
      )}
    </Layout>
  );
}