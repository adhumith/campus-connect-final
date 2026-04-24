import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const BATCHES = ["2021", "2022", "2023", "2024", "2025"];

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Action</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUploaded }) {
  const [form, setForm] = useState({
    title: "", description: "", department: "CSE", class_name: "", batch: "2024"
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) { setError("Please select a file"); return; }
    if (!form.title) { setError("Please enter a title"); return; }
    if (!form.class_name) { setError("Please enter a class name"); return; }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("department", form.department);
      formData.append("class_name", form.class_name);
      formData.append("batch", form.batch);
      formData.append("file", file);
      await api.post("/api/courses/", formData);
      onUploaded(form.department, form.class_name, form.batch);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Course Material</h3>
        {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <div className="space-y-3">
          <input type="text" placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" />
          <div className="grid grid-cols-3 gap-3">
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" placeholder="Class (A/B)" value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <input type="file" onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded-lg px-4 py-2 text-sm" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleUpload} disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState({ department: "CSE", class_name: "", batch: "2024" });

  const fetchCourses = async (dept, cls, bat) => {
    const d = dept || filter.department;
    const c = cls !== undefined ? cls : filter.class_name;
    const b = bat || filter.batch;
    if (!c) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/courses/filter?department=${d}&class_name=${c}&batch=${b}`);
      setCourses(res.data);
      if (dept) setFilter({ department: d, class_name: c, batch: b });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/courses/${id}`);
      fetchCourses();
    } catch (err) { console.error(err); }
    setConfirmDelete(null);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['ppt', 'pptx'].includes(ext)) return '📊';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['mp4', 'avi'].includes(ext)) return '🎥';
    return '📁';
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Course Materials</h1>
          <button onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Upload Material
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 flex gap-3 items-center flex-wrap">
          <select value={filter.department}
            onChange={(e) => setFilter({ ...filter, department: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="text" placeholder="Class (e.g. A or B)"
            value={filter.class_name}
            onChange={(e) => setFilter({ ...filter, class_name: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
          <select value={filter.batch}
            onChange={(e) => setFilter({ ...filter, batch: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={() => fetchCourses()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            🔍 Search
          </button>
        </div>

        {/* Course Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-gray-500 text-lg">No materials found</p>
            <p className="text-gray-400 text-sm mt-2">Enter a class name and click Search, or upload a material</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs opacity-75">{course.department} • {course.class_name} • {course.batch}</p>
                      <h3 className="text-lg font-bold mt-1">{course.title}</h3>
                    </div>
                    <span className="text-3xl">{getFileIcon(course.file_name)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  <p className="text-xs text-gray-400 mb-4">📎 {course.file_name}</p>
                  <div className="flex gap-2">
                    <a href={`http://127.0.0.1:8000${course.file_url}`}
                      target="_blank" rel="noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100">
                      ⬇️ Download
                    </a>
                    <button onClick={() => setConfirmDelete(course)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(dept, cls, bat) => fetchCourses(dept, cls, bat)}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message={`Delete "${confirmDelete.title}"?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Layout>
  );
}