import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const ROLES = ["student", "staff", "admin"];
const BATCHES = ["2021", "2022", "2023", "2024", "2025"];

// ── Confirmation Modal ──────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Action</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create User Modal ───────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "student",
    department: "CSE",
    class_name: "",
    batch: "2024",
    rollno: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/api/users/", form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Create New User</h3>
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email (@srec.ac.in)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Class (e.g. A, B)"
              value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          {form.role === "student" && (
            <input
              type="text"
              placeholder="Roll Number (required for students)"
              value={form.rollno}
              onChange={(e) => setForm({ ...form, rollno: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Default password: <strong>Welcome@1234</strong>
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Users Page ─────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterRole, setFilterRole] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (uid) => {
    try {
      await api.delete(`/api/users/${uid}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setConfirmDelete(null);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await api.post("/api/users/bulk-upload", formData);
      setBulkResult(res.data);
      fetchUsers();
    } catch (err) {
      setBulkResult({ error: err.response?.data?.detail || "Upload failed" });
    }
    setBulkLoading(false);
  };

  const filtered = filterRole
    ? users.filter(u => u.role === filterRole)
    : users;

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create User
          </button>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Bulk Upload Users</h2>
          <p className="text-sm text-gray-500 mb-3">
            Upload an Excel/CSV file with columns: email, full_name, role, department, class_name, batch, rollno
          </p>
          <div className="flex gap-3 items-center">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="border rounded-lg px-4 py-2 text-sm"
            />
            <button
              onClick={handleBulkUpload}
              disabled={!bulkFile || bulkLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {bulkLoading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {bulkResult && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              {bulkResult.error ? (
                <p className="text-red-600">{bulkResult.error}</p>
              ) : (
                <p className="text-green-600">
                  ✅ Success: {bulkResult.success} | ❌ Failed: {bulkResult.failed}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-4">
          {["", "student", "staff", "admin"].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterRole === role
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {role === "" ? "All" : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Department</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Batch</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Roll No</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">No users found</td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.uid} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{user.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" :
                        user.role === "staff" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.department}</td>
                    <td className="px-6 py-4 text-gray-600">{user.batch}</td>
                    <td className="px-6 py-4 text-gray-600">{user.rollno || "-"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmDelete(user)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchUsers}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${confirmDelete.full_name}?`}
          onConfirm={() => handleDelete(confirmDelete.uid)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Layout>
  );
}