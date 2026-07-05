import Sidebar from '../layout/Sidebar';
import Topbar  from '../layout/Topbar';
import { useAuth }       from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  grades:     'Notas y Calificaciones',
  attendance: 'Control de Asistencia',
};

export default function MainLayout({ children }) {
  const { user, logout }                        = useAuth();
  const { semestre, setSemestre, page, setPage } = useAppContext();

  const role = user?.role ?? 'student';

  // userData usa los datos reales del usuario autenticado (vienen del login real)
  // user = { id, role, nombre } — guardado en localStorage por AuthContext
  const userData = {
    name:       user?.nombre ?? user?.id ?? 'Usuario',
    id:         user?.id ?? '',
    avatar:     null,   // se puede extender con foto de perfil
    // Campos extra por rol (valores por defecto hasta que lleguen del backend)
    program:    role === 'student' ? 'Tecnología en Desarrollo de Software' : undefined,
    department: role === 'teacher' ? 'Ingeniería' : undefined,
    role:       role,
  };

  return (
    <div className="app">
      <Sidebar
        role={role}
        page={page}
        setPage={setPage}
        userData={userData}
        unread={0}
        onLogout={logout}
      />
      <main className="main">
        <Topbar
          semestre={semestre}
          setSemestre={setSemestre}
          role={role}
          pageTitle={PAGE_TITLES[page] ?? 'Dashboard'}
          userName={userData.name}
        />
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}
