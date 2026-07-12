import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth }       from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';

import LoginPage          from '../views/auth/LoginView';
import ForgotPasswordPage from '../views/auth/ForgotPasswordPage';
import StudentDashboard   from '../views/student/DashboardPage';
import GradesPage         from '../views/student/GradesPages';
import AttendancePage     from '../views/student/AttendancePage';
import TeacherDashboard   from '../views/teacher/DashboardPage';
import AdminDashboard     from '../views/admin/AdminDashboard';
import NotFoundPage       from '../views/shared/NotFoundPage';

// ── Bloquea el botón atrás cuando el usuario está autenticado ──
function BlockBackButton() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    // Bloquear navegación hacia atrás siempre
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => {
      if (!user) {
        // Si no hay sesión, ir al login
        navigate('/login', { replace: true });
      } else {
        // Si hay sesión, mantener en la página actual
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [user, location, navigate]);

  return null;
}

// ── Rutas protegidas ──────────────────────────────────────────
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function StudentLayout({ View }) {
  const { user }              = useAuth();
  const { semestre, setPage } = useAppContext();
  return (
    <MainLayout>
      <View estudianteId={user?.id} semestre={semestre} onNavigate={(p) => setPage(p)} onNotifClick={() => setPage('grades')} />
    </MainLayout>
  );
}

function TeacherLayout({ View }) {
  const { user }    = useAuth();
  const { semestre } = useAppContext();
  return <MainLayout><View docenteId={user?.id} semestre={semestre} /></MainLayout>;
}

function AdminLayout({ View }) {
  return <MainLayout><View /></MainLayout>;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <BlockBackButton />
      <Routes>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/"                element={<RoleRedirect />} />

        <Route path="/student/dashboard" element={<PrivateRoute allowedRoles={['student']}><StudentLayout View={StudentDashboard} /></PrivateRoute>} />
        <Route path="/student/grades"    element={<PrivateRoute allowedRoles={['student']}><StudentLayout View={GradesPage} /></PrivateRoute>} />
        <Route path="/student/attendance"element={<PrivateRoute allowedRoles={['student']}><StudentLayout View={AttendancePage} /></PrivateRoute>} />
        <Route path="/teacher/dashboard" element={<PrivateRoute allowedRoles={['teacher']}><TeacherLayout View={TeacherDashboard} /></PrivateRoute>} />
        <Route path="/admin/dashboard"   element={<PrivateRoute allowedRoles={['admin']}><AdminLayout View={AdminDashboard} /></PrivateRoute>} />
        <Route path="*"                  element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
