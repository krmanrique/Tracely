import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { mockData } from "../data/mockData";
import MainLayout from "../components/layout/MainLayout";

import LoginPage from "../views/auth/LoginView";
import ForgotPasswordPage from "../views/auth/ForgotPasswordPage";
import StudentDashboard from "../views/student/DashboardPage";
import GradesPage from "../views/student/GradesPages";
import AttendancePage from "../views/student/AttendancePage";
import TeacherDashboard from "../views/teacher/DashboardPage";
import AdminDashboard from "../views/admin/AdminDashboard";
import NotFoundPage from "../views/shared/NotFoundPage";

// ── Rutas protegidas ─────────────────────────────────────────
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

// ── Layout estudiante ─────────────────────────────────────────
function StudentLayout({ View }) {
  const { semestre, setPage } = useAppContext();
  const semData = mockData.student.bySemester[semestre];
  return (
    <MainLayout>
      <View
        semData={semData}
        onNavigate={(p) => setPage(p)}
        onNotifClick={() => setPage("grades")}
      />
    </MainLayout>
  );
}

// ── Layout docente ────────────────────────────────────────────
function TeacherLayout({ View }) {
  const { semestre } = useAppContext();
  const semData = mockData.teacher.bySemester[semestre];
  return (
    <MainLayout>
      <View semData={semData} />
    </MainLayout>
  );
}

// ── Layout admin ──────────────────────────────────────────────
function AdminLayout({ View }) {
  return (
    <MainLayout>
      <View />
    </MainLayout>
  );
}

// ── Redirección inteligente por rol ───────────────────────────
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === "admin")   return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Redirección raíz */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Estudiante */}
        <Route path="/student/dashboard" element={
          <PrivateRoute allowedRoles={["student"]}><StudentLayout View={StudentDashboard} /></PrivateRoute>
        } />
        <Route path="/student/grades" element={
          <PrivateRoute allowedRoles={["student"]}><StudentLayout View={GradesPage} /></PrivateRoute>
        } />
        <Route path="/student/attendance" element={
          <PrivateRoute allowedRoles={["student"]}><StudentLayout View={AttendancePage} /></PrivateRoute>
        } />

        {/* Docente */}
        <Route path="/teacher/dashboard" element={
          <PrivateRoute allowedRoles={["teacher"]}><TeacherLayout View={TeacherDashboard} /></PrivateRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute allowedRoles={["admin"]}><AdminLayout View={AdminDashboard} /></PrivateRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
