import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import AdminAssignments from "./pages/admin/Assignments";
import AdminBlogs from "./pages/admin/Blogs";
import AdminNotifications from "./pages/admin/Notifications";
import RAGChatbot from "./pages/admin/RAGChatbot";
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentAssignments from "./pages/student/Assignments";
import StaffDashboard from "./pages/staff/Dashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/assignments" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAssignments />
            </ProtectedRoute>
          } />
          <Route path="/admin/blogs" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBlogs />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          <Route path="/admin/rag" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RAGChatbot />
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/courses" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <AdminCourses />
            </ProtectedRoute>
          } />
          <Route path="/staff/assignments" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <AdminAssignments />
            </ProtectedRoute>
          } />
          <Route path="/staff/blogs" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <AdminBlogs />
            </ProtectedRoute>
          } />
          <Route path="/staff/notifications" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          <Route path="/staff/chatbot" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <RAGChatbot />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/courses" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentCourses />
            </ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAssignments />
            </ProtectedRoute>
          } />
          <Route path="/student/blogs" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AdminBlogs />
            </ProtectedRoute>
          } />
          <Route path="/student/notifications" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          <Route path="/student/chatbot" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RAGChatbot />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;