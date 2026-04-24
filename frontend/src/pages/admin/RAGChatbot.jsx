import { useState, useRef, useEffect } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function UploadDocModal({ onClose, onUploaded }) {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !subject) {
      setError("PDF file and Subject/Topic are required");
      return;
    }
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", subject);
      await api.post("/api/rag/upload", formData);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          📚 Upload College Data to AI
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Upload any college document — rules, schedules, syllabus, events etc.
          This will be available to all students and staff.
        </p>
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">📄</p>
            <p className="text-gray-600 text-sm mb-3">Select a PDF file to upload</p>
            <input type="file" accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm" />
            {file && (
              <p className="text-green-600 text-sm mt-2">✅ {file.name}</p>
            )}
          </div>
          <input
            type="text"
            placeholder="Topic / Subject (e.g. College Rules, Exam Schedule, Syllabus)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ℹ️ This data will be accessible to all students and staff via the AI chatbot.
        </p>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleUpload} disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Uploading..." : "Upload to AI Brain"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RAGChatbot() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your Campus AI Assistant. Ask me anything about college rules, schedules, syllabus or any uploaded college data!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await api.post("/api/rag/query", { question });
      const answer = res.data.answer;
      setMessages(prev => [...prev, {
        role: "assistant",
        text: answer === "Not Found"
          ? "❌ I couldn't find information about that in the college data. Please ask the admin to upload relevant documents."
          : answer
      }]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Something went wrong";
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "⚠️ Error: " + errorMsg
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset entire knowledge base? This cannot be undone.")) return;
    try {
      await api.delete("/api/rag/reset");
      setMessages([{
        role: "assistant",
        text: "🗑️ Knowledge base has been reset. Please upload new college data."
      }]);
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI Chatbot 🤖</h1>
            <p className="text-gray-500 text-sm mt-1">
              Powered by Gemini AI + College Knowledge Base
            </p>
          </div>
          <div className="flex gap-3">
            {userProfile?.role === "admin" && (
              <>
                <button onClick={() => setShowUpload(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  📚 Upload College Data
                </button>
                <button onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                  🗑️ Reset KB
                </button>
              </>
            )}
          </div>
        </div>

        {uploadSuccess && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
            ✅ College data uploaded to AI successfully!
          </div>
        )}

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-2xl shadow overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mr-2 mt-1 flex-shrink-0">
                    🤖
                  </div>
                )}
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm ml-2 mt-1 flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mr-2 mt-1">
                  🤖
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about college rules, schedule, syllabus... (Press Enter to send)"
              className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              rows={2}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium">
              Send ➤
            </button>
          </div>
        </div>
      </div>

      {showUpload && (
        <UploadDocModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
          }}
        />
      )}
    </Layout>
  );
}