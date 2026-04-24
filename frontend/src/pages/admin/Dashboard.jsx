import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    assignments: 0,
    blogs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, blogs] = await Promise.all([
          api.get("/api/users/"),
          api.get("/api/blogs/")
        ]);
        setStats(prev => ({
          ...prev,
          users: users.data.length,
          blogs: blogs.data.length
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: "👥", color: "bg-blue-500" },
    { label: "Total Blogs", value: stats.blogs, icon: "✍️", color: "bg-green-500" },
    { label: "Courses", value: stats.courses, icon: "📚", color: "bg-purple-500" },
    { label: "Assignments", value: stats.assignments, icon: "📝", color: "bg-orange-500" },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {userProfile?.full_name}! 👋
        </h1>
        <p className="text-gray-500 mb-8">Here's what's happening on campus today.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
              <div className={`${card.color} text-white text-3xl w-14 h-14 rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{userProfile?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userProfile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium capitalize">{userProfile?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{userProfile?.department}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}