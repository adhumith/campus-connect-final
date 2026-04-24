import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function StudentCourses() {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/api/courses/");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Course Materials</h1>
          <p className="text-gray-500 mt-1">
            {userProfile?.department} • Class {userProfile?.class_name} • Batch {userProfile?.batch}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-gray-500 text-lg">No materials available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 text-white">
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
                  <a href={`http://127.0.0.1:8000${course.file_url}`}
                    target="_blank" rel="noreferrer"
                    className="w-full block text-center px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100">
                    ⬇️ Download Material
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}