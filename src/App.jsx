import { useState } from "react";
import { mockData } from "./data/mockData";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StudentDashboard from "./views/student/StudentDashboard";
import GradesView from "./views/student/GradesView";
import AttendanceView from "./views/student/AttendanceView";
import TeacherDashboard from "./views/teacher/TeacherDashboard";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  grades: "Notas y Calificaciones",
  attendance: "Control de Asistencia",
};

export default function App() {
  const [role, setRole] = useState("student");
  const [page, setPage] = useState("dashboard");
  const [semestre, setSemestre] = useState("2025-1");
  const [gradesInitCourse, setGradesInitCourse] = useState(null);

  const userData = role === "student" ? mockData.student : mockData.teacher;
  const semData = userData.bySemester[semestre];
  const unread = role === "student"
    ? (semData?.notifications ?? []).filter((n) => !n.read).length
    : 0;

  const handleNotifClick = (courseId) => {
    setGradesInitCourse(courseId);
    setPage("grades");
  };

  const handleNavigate = (p, cid = null) => {
    setGradesInitCourse(cid);
    setPage(p);
  };

  return (
    <div className="app">
      <Sidebar
        role={role}
        setRole={setRole}
        page={page}
        setPage={setPage}
        userData={userData}
        unread={unread}
      />

      <main className="main">
        <Topbar
          semestre={semestre}
          setSemestre={setSemestre}
          role={role}
          pageTitle={PAGE_TITLES[page]}
          userName={role === "student" ? mockData.student.name : mockData.teacher.name}
        />
        <div className="content">
          {role === "student" && page === "dashboard" && (
            <StudentDashboard
              semData={semData}
              onNavigate={handleNavigate}
              onNotifClick={handleNotifClick}
            />
          )}
          {role === "student" && page === "grades" && (
            <GradesView
              semData={semData}
              initialCourseId={gradesInitCourse}
              key={`${semestre}-${gradesInitCourse}`}
            />
          )}
          {role === "student" && page === "attendance" && (
            <AttendanceView semData={semData} />
          )}
          {role === "teacher" && page === "dashboard" && (
            <TeacherDashboard semData={semData} />
          )}
        </div>
      </main>
    </div>
  );
}
