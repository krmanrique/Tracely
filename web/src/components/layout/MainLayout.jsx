import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { mockData } from "../../data/mockData";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  grades: "Notas y Calificaciones",
  attendance: "Control de Asistencia",
};

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const { semestre, setSemestre, page, setPage } = useAppContext();

  const role = user?.role ?? "student";

  // Datos del usuario según rol
  const userData =
    role === "student" ? mockData.student :
    role === "teacher" ? mockData.teacher :
    mockData.admin;

  // Notificaciones sin leer (solo estudiante)
  const semData = role === "student" ? mockData.student.bySemester[semestre] : null;
  const unread  = role === "student"
    ? (semData?.notifications ?? []).filter((n) => !n.read).length
    : 0;

  return (
    <div className="app">
      <Sidebar
        role={role}
        page={page}
        setPage={setPage}
        userData={userData}
        unread={unread}
        onLogout={logout}
      />
      <main className="main">
        <Topbar
          semestre={semestre}
          setSemestre={setSemestre}
          role={role}
          pageTitle={PAGE_TITLES[page] ?? "Dashboard"}
          userName={userData.name}
        />
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}
