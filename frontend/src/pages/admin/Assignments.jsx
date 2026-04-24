import { useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const BATCHES = ["2021", "2022", "2023", "2024", "2025"];

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", department: "CSE",
    class_name: "", batch: "2024", deadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.title || !form.class_name || !form.deadline) {
      setError("Title, Class and Deadline are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/assignments/", {
        ...form,
        deadline: new Date(form.deadline).toISOString()
      });
      onCreated(form.department, form.class_name, form.batch);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create assignment");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Create Assignment</h3>
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <div className="space-y-3">
          <input type="text" placeholder="Assignment Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Description / Instructions" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" />
          <div className="grid grid-cols-3 gap-3">
            <select value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" placeholder="Class (A/B)" value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Deadline</label>
            <input type="datetime-local" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmissionsModal({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    const fetchSubs = async () => {
      try {
        const res = await api.get(`/api/assignments/${assignment.id}/submissions`);
        setSubmissions(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchSubs();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Submissions — {assignment.title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">No submissions yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm text-gray-500">Roll No</th>
                <th className="text-left px-4 py-3 text-sm text-gray-500">File</th>
                <th className="text-left px-4 py-3 text-sm text-gray-500">Submitted At</th>
                <th className="text-left px-4 py-3 text-sm text-gray-500">Download</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{sub.rollno}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{sub.file_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(sub.submitted_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`http://127.0.0.1:8000${sub.file_url}`}
                      target="_blank" rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm">
                      ⬇️ Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [filter, setFilter] = useState({
    department: "CSE", class_name: "", batch: "2024"
  });

  const fetchAssignments = async (dept, cls, bat) => {
    const d = dept || filter.department;
    const c = cls !== undefined ? cls : filter.class_name;
    const b = bat || filter.batch;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (d) params.append("department", d);
      if (c) params.append("class_name", c);
      if (b) params.append("batch", b);
      const res = await api.get(`/api/assignments/?${params.toString()}`);
      setAssignments(res.data);
      if (dept) setFilter({ department: d, class_name: c, batch: b });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/api/assignments/${id}`);
      fetchAssignments();
    } catch (err) { console.error(err); }
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = due - now;
    if (diff < 0) return { text: "Expired", color: "text-red-600 bg-red-50" };
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return { text: `${hours}h left`, color: "text-orange-600 bg-orange-50" };
    const days = Math.floor(diff / 86400000);
    return { text: `${days}d left`, color: "text-green-600 bg-green-50" };
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Create Assignment
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
          <button onClick={() => fetchAssignments()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            🔍 Search
          </button>
        </div>

        {/* Assignment Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500 text-lg">No assignments found</p>
            <p className="text-gray-400 text-sm mt-2">
              Enter a class name and click Search, or create an assignment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map(assignment => {
              const status = getDeadlineStatus(assignment.deadline);
              return (
                <div key={assignment.id}
                  className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
                    <p className="text-xs opacity-75">
                      {assignment.department} • {assignment.class_name} • {assignment.batch}
                    </p>
                    <h3 className="text-lg font-bold mt-1">{assignment.title}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500">
                        📅 {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        ⏰ {status.text}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setViewSubmissions(assignment)}
                        className="flex-1 text-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100">
                        👁️ Submissions
                      </button>
                      <button onClick={() => handleDelete(assignment.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(dept, cls, bat) => fetchAssignments(dept, cls, bat)}
        />
      )}
      {viewSubmissions && (
        <SubmissionsModal
          assignment={viewSubmissions}
          onClose={() => setViewSubmissions(null)}
        />
      )}
    </Layout>
  );
}