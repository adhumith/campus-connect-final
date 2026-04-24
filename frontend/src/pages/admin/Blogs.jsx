import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function CreateBlogModal({ clubs, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", club: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.club) {
      setError("Title, Description and Club are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("club", form.club);
      if (image) formData.append("image", image);
      await api.post("/api/blogs/", formData);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create blog");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Create Blog Post</h3>
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <div className="space-y-3">
          <input type="text" placeholder="Blog Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Write your blog content here..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32" />
          <select value={form.club}
            onChange={(e) => setForm({ ...form, club: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Club</option>
            {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Cover Image (optional)</label>
            <input type="file" accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border rounded-lg px-4 py-2 text-sm" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">⚠️ Blog content will be checked by AI for appropriate language</p>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Posting..." : "Post Blog"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddClubModal({ onClose, onAdded }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    try {
      await api.post("/api/blogs/clubs", { name });
      onAdded();
      onClose();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Club</h3>
        <input type="text" placeholder="Club Name" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleAdd} disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Adding..." : "Add Club"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogs() {
  const { userProfile } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddClub, setShowAddClub] = useState(false);
  const [selectedClub, setSelectedClub] = useState("");

  const fetchClubs = async () => {
    try {
      const res = await api.get("/api/blogs/clubs");
      setClubs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBlogs = async (club = "") => {
    setLoading(true);
    try {
      const url = club ? `/api/blogs/?club=${club}` : "/api/blogs/";
      const res = await api.get(url);
      setBlogs(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchClubs();
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/api/blogs/${id}`);
      fetchBlogs(selectedClub);
    } catch (err) { console.error(err); }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Delete this club?")) return;
    try {
      await api.delete(`/api/blogs/clubs/${id}`);
      fetchClubs();
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Blogs</h1>
          <div className="flex gap-3">
            {userProfile?.role === "admin" && (
              <button onClick={() => setShowAddClub(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
                + Add Club
              </button>
            )}
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Write Blog
            </button>
          </div>
        </div>

        {/* Clubs Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => { setSelectedClub(""); fetchBlogs(""); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedClub === "" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}>
            All Clubs
          </button>
          {clubs.map(club => (
            <div key={club.id} className="flex items-center gap-1">
              <button
                onClick={() => { setSelectedClub(club.name); fetchBlogs(club.name); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedClub === club.name ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}>
                {club.name}
              </button>
              {userProfile?.role === "admin" && (
                <button onClick={() => handleDeleteClub(club.id)}
                  className="text-red-400 hover:text-red-600 text-xs">✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Blog Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-gray-500 text-lg">No blogs yet</p>
            <p className="text-gray-400 text-sm mt-2">Be the first to write a blog!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
                {blog.image_url && (
                  <img src={`http://127.0.0.1:8000${blog.image_url}`} alt={blog.title}
                    className="w-full h-40 object-cover" />
                )}
                {!blog.image_url && (
                  <div className="w-full h-40 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-5xl">
                    ✍️
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {blog.club}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{blog.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-3">{blog.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">By {blog.author_name}</p>
                    {(userProfile?.role === "admin" || blog.created_by === userProfile?.uid) && (
                      <button onClick={() => handleDelete(blog.id)}
                        className="text-red-400 hover:text-red-600 text-sm">
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateBlogModal
          clubs={clubs}
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchBlogs(selectedClub)}
        />
      )}
      {showAddClub && (
        <AddClubModal
          onClose={() => setShowAddClub(false)}
          onAdded={fetchClubs}
        />
      )}
    </Layout>
  );
}