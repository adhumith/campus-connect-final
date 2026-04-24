import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function SubmitModal({ assignment, onClose, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!file) { setError("Please select a file"); return; }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/api/assignments/${assignment.id}/submit`, formData);
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Submission failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Submit Assignment
        </h3>
        <p className="text-gray-500 text-sm mb-4">{assignment.title}</p>
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
          <p className="text-4xl mb-2">📎</p>
          <p className="text-gray-600 text-sm mb-3">Select your assignment file</p>
          <input type="file" onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm" />
          {file && (
            <p className="text-green-600 text-sm mt-2">✅ {file.name}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentAssignments() {
  const { userProfile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitted, setSubmitted] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/assignments/");
      setAssignments(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = due - now;
    if (diff < 0) return { text: "Expired", color: "text-red-600 bg-red-50", expired: true };
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return { text: `${hours}h left`, color: "text-orange-600 bg-orange-50", expired: false };
    const days = Math.floor(diff / 86400000);
    return { text: `${days}d left`, color: "text-green-600 bg-green-50", expired: false };
  };

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Assignments</h1>
          <p className="text-gray-500 mt-1">
            {userProfile?.department} • Class {userProfile?.class_name} • Batch {userProfile?.batch}
          </p>
        </div>

        {successMsg && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ {successMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500 text-lg">No assignments yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Your teacher hasn't assigned anything yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map(assignment => {
              const status = getDeadlineStatus(assignment.deadline);
              const isSubmitted = submitted[assignment.id];
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
                    {isSubmitted ? (
                      <div className="w-full text-center px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                        ✅ Submitted Successfully!
                      </div>
                    ) : status.expired ? (
                      <div className="w-full text-center px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                        ❌ Deadline Passed
                      </div>
                    ) : (
                      <button
                        onClick={() => setSubmitModal(assignment)}
                        className="w-full text-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 font-medium">
                        📤 Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {submitModal && (
        <SubmitModal
          assignment={submitModal}
          onClose={() => setSubmitModal(null)}
          onSubmitted={() => {
            setSubmitted(prev => ({ ...prev, [submitModal.id]: true }));
            setSuccessMsg(`"${submitModal.title}" submitted successfully!`);
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
        />
      )}
    </Layout>
  );
}