import profile from "../assets/profile.png"
export const semestres = ["2024-1", "2024-2", "2025-1", "2025-2"];

export const mockData = {
  student: {
    name: "Michael Sanchez",
    id: "2021-0342",
    program: "Ingeniería de Sistemas",
    avatar: profile,
    avatarColor: "#7C3AED",
    bySemester: {
      "2024-1": {
        semester: "IV Semestre", gpa: 3.8, attendanceRate: 82, riskLevel: "medium",
        courses: [
          {
            id: 1, name: "Estructuras de Datos", code: "IS-301", teacher: "Dr. Ramírez", attendance: 85, credits: 4, status: "active", color: "#7C3AED",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Taller Listas", tipo: "Taller", value: 3.8 }, { id: "a2", label: "Quiz 1", tipo: "Quiz", value: 3.5 }, { id: "a3", label: "Parcial C1", tipo: "Parcial", value: 3.9 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Taller Árboles", tipo: "Taller", value: 3.6 }, { id: "b2", label: "Quiz 2", tipo: "Quiz", value: 4.0 }, { id: "b3", label: "Parcial C2", tipo: "Parcial", value: 3.8 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Proyecto Final", tipo: "Proyecto", value: 3.9 }, { id: "c2", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
          {
            id: 2, name: "Cálculo II", code: "MAT-201", teacher: "Dra. Ospina", attendance: 78, credits: 3, status: "alert", color: "#DB2777",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Taller Integrales", tipo: "Taller", value: 3.2 }, { id: "a2", label: "Quiz", tipo: "Quiz", value: 3.0 }, { id: "a3", label: "Parcial C1", tipo: "Parcial", value: 3.1 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Taller Series", tipo: "Taller", value: 3.5 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 3.3 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
        ],
        notifications: [
          { id: 1, type: "warning", courseId: 2, message: "Asistencia baja en Cálculo II (78%)", time: "Hace 1h", read: false },
          { id: 2, type: "info", courseId: 1, message: "Parcial C2 publicado en Estructuras", time: "Ayer", read: true },
        ],
        attendanceHistory: [{ month: "Feb", rate: 88 }, { month: "Mar", rate: 85 }, { month: "Abr", rate: 80 }, { month: "May", rate: 82 }],
      },
      "2024-2": {
        semester: "V Semestre", gpa: 3.9, attendanceRate: 85, riskLevel: "low",
        courses: [
          {
            id: 1, name: "Algoritmos", code: "IS-351", teacher: "Mg. Vargas", attendance: 90, credits: 4, status: "active", color: "#059669",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Quiz Complejidad", tipo: "Quiz", value: 4.0 }, { id: "a2", label: "Parcial C1", tipo: "Parcial", value: 4.1 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Proyecto Sorting", tipo: "Proyecto", value: 3.8 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 3.9 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
          {
            id: 2, name: "POO Avanzada", code: "IS-360", teacher: "Dr. Cárdenas", attendance: 80, credits: 3, status: "active", color: "#D97706",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Taller Patrones", tipo: "Taller", value: 3.7 }, { id: "a2", label: "Parcial C1", tipo: "Parcial", value: 3.8 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Proyecto POO", tipo: "Proyecto", value: 4.0 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 3.9 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
        ],
        notifications: [
          { id: 1, type: "success", courseId: null, message: "Promedio 3.9 — ¡Buen semestre!", time: "Hace 3h", read: false },
        ],
        attendanceHistory: [{ month: "Ago", rate: 92 }, { month: "Sep", rate: 90 }, { month: "Oct", rate: 85 }, { month: "Nov", rate: 85 }],
      },
      "2025-1": {
        semester: "VI Semestre", gpa: 4.1, attendanceRate: 87, riskLevel: "low",
        courses: [
          {
            id: 1, name: "Bases de Datos II", code: "IS-401", teacher: "Dr. Ramírez", attendance: 92, credits: 4, status: "active", color: "#4F46E5",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Taller ER", tipo: "Taller", value: 4.5 }, { id: "a2", label: "Quiz 1", tipo: "Quiz", value: 3.8 }, { id: "a3", label: "Parcial C1", tipo: "Parcial", value: 4.2 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Taller SQL", tipo: "Taller", value: 4.0 }, { id: "b2", label: "Quiz 2", tipo: "Quiz", value: 4.3 }, { id: "b3", label: "Parcial C2", tipo: "Parcial", value: 4.1 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Proyecto Final", tipo: "Proyecto", value: 4.5 }, { id: "c2", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
          {
            id: 2, name: "Redes de Computadores", code: "IS-410", teacher: "Ing. Morales", attendance: 78, credits: 3, status: "active", color: "#7C3AED",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Lab Packet Tracer", tipo: "Laboratorio", value: 3.5 }, { id: "a2", label: "Quiz OSI", tipo: "Quiz", value: 3.2 }, { id: "a3", label: "Parcial C1", tipo: "Parcial", value: 3.7 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Taller Enrutamiento", tipo: "Taller", value: 4.0 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 4.0 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Proyecto de Red", tipo: "Proyecto", value: null }, { id: "c2", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
          {
            id: 3, name: "Ingeniería de Software", code: "IS-420", teacher: "Dra. Ospina", attendance: 95, credits: 4, status: "active", color: "#059669",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Casos de Uso", tipo: "Taller", value: 4.8 }, { id: "a2", label: "Quiz UML", tipo: "Quiz", value: 5.0 }, { id: "a3", label: "Parcial C1", tipo: "Parcial", value: 4.6 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Sprint 1", tipo: "Proyecto", value: 4.3 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 4.2 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Sprint Final", tipo: "Proyecto", value: null }, { id: "c2", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
          {
            id: 4, name: "Sistemas Operativos", code: "IS-405", teacher: "Mg. Vargas", attendance: 72, credits: 3, status: "alert", color: "#DC2626",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Taller Procesos", tipo: "Taller", value: 3.0 }, { id: "a2", label: "Quiz Memoria", tipo: "Quiz", value: 2.8 }, { id: "a3", label: "Parcial C1", tipo: "Parcial", value: 3.1 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Lab Shell", tipo: "Laboratorio", value: 3.5 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 3.6 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Proyecto SO", tipo: "Proyecto", value: null }, { id: "c2", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
          {
            id: 5, name: "Estadística Aplicada", code: "MAT-311", teacher: "Dr. Cárdenas", attendance: 88, credits: 3, status: "active", color: "#DB2777",
            cortes: [
              { id: 1, label: "Corte 1", weight: 30, actividades: [{ id: "a1", label: "Taller Probabilidad", tipo: "Taller", value: 4.2 }, { id: "a2", label: "Parcial C1", tipo: "Parcial", value: 4.3 }] },
              { id: 2, label: "Corte 2", weight: 30, actividades: [{ id: "b1", label: "Taller Regresión", tipo: "Taller", value: 3.9 }, { id: "b2", label: "Parcial C2", tipo: "Parcial", value: 4.0 }] },
              { id: 3, label: "Corte 3", weight: 40, actividades: [{ id: "c1", label: "Proyecto Estadístico", tipo: "Proyecto", value: null }, { id: "c2", label: "Examen Final", tipo: "Examen", value: null }] },
            ]
          },
        ],
        notifications: [
          { id: 1, type: "alert", courseId: 4, message: "Asistencia crítica en Sistemas Operativos (72%)", time: "Hace 2h", read: false },
          { id: 2, type: "info", courseId: 2, message: "Nota Parcial C2 publicada en Redes", time: "Hace 5h", read: false },
          { id: 3, type: "success", courseId: null, message: "Promedio semestral mejoró a 4.1", time: "Ayer", read: true },
          { id: 4, type: "warning", courseId: 3, message: "Entrega Sprint Final IS-420 en 3 días", time: "Ayer", read: true },
        ],
        attendanceHistory: [{ month: "Ago", rate: 95 }, { month: "Sep", rate: 91 }, { month: "Oct", rate: 88 }, { month: "Nov", rate: 82 }, { month: "Dic", rate: 87 }],
      },
      "2025-2": {
        semester: "VII Semestre", gpa: null, attendanceRate: null, riskLevel: "low",
        courses: [],
        notifications: [{ id: 1, type: "info", courseId: null, message: "Matrícula disponible a partir del 20 de julio", time: "Hace 1d", read: false }],
        attendanceHistory: [],
      },
    },
  },

  teacher: {
    name: "Dr. Carlos Ramírez",
    id: "DOC-0112",
    department: "Ingeniería de Sistemas",
    avatar: "CR",
    avatarColor: "#1A5FA5",
    bySemester: {
      "2024-1": {
        courses: [{ id: 1, name: "Bases de Datos I", code: "IS-301", group: "G1", enrolled: 30, color: "#4F46E5", cortes: [{ id: 1, label: "Corte 1", weight: 30 }, { id: 2, label: "Corte 2", weight: 30 }, { id: 3, label: "Corte 3", weight: 40 }], students: [], grades: {}, todayAttendance: [] }],
        schedule: [{ day: "Lunes", time: "08:00-10:00", course: "IS-301 G1", room: "Aula 202" }, { day: "Jueves", time: "08:00-10:00", course: "IS-301 G1", room: "Aula 202" }],
      },
      "2024-2": {
        courses: [{ id: 1, name: "Bases de Datos I", code: "IS-301", group: "G2", enrolled: 28, color: "#4F46E5", cortes: [{ id: 1, label: "Corte 1", weight: 30 }, { id: 2, label: "Corte 2", weight: 30 }, { id: 3, label: "Corte 3", weight: 40 }], students: [], grades: {}, todayAttendance: [] }],
        schedule: [{ day: "Martes", time: "10:00-12:00", course: "IS-301 G2", room: "Aula 301" }, { day: "Viernes", time: "10:00-12:00", course: "IS-301 G2", room: "Aula 301" }],
      },
      "2025-1": {
        courses: [
          {
            id: 1, name: "Bases de Datos II", code: "IS-401", group: "G1", enrolled: 28, color: "#4F46E5",
            cortes: [{ id: 1, label: "Corte 1", weight: 30 }, { id: 2, label: "Corte 2", weight: 30 }, { id: 3, label: "Corte 3", weight: 40 }],
            students: [
              { id: 1, name: "Valentina Torres", attendance: 92, status: "active", absences: 2 },
              { id: 2, name: "Andrés Mejía", attendance: 65, status: "risk", absences: 8 },
              { id: 3, name: "Sara Quintero", attendance: 88, status: "active", absences: 3 },
              { id: 4, name: "Miguel Ángel Ríos", attendance: 45, status: "critical", absences: 12 },
              { id: 5, name: "Laura Fernández", attendance: 97, status: "active", absences: 1 },
              { id: 6, name: "Juan Prado", attendance: 78, status: "warning", absences: 5 },
            ],
            grades: {
              1: { 1: [{ id: "g1", label: "Taller ER", tipo: "Taller", value: 4.5 }, { id: "g2", label: "Quiz 1", tipo: "Quiz", value: 3.8 }], 2: [], 3: [] },
              2: { 1: [{ id: "g1", label: "Taller ER", tipo: "Taller", value: 2.5 }, { id: "g2", label: "Quiz 1", tipo: "Quiz", value: 2.8 }], 2: [], 3: [] },
              3: { 1: [{ id: "g1", label: "Taller ER", tipo: "Taller", value: 4.0 }, { id: "g2", label: "Quiz 1", tipo: "Quiz", value: 4.2 }], 2: [], 3: [] },
              4: { 1: [], 2: [], 3: [] }, 5: { 1: [], 2: [], 3: [] }, 6: { 1: [], 2: [], 3: [] },
            },
            todayAttendance: [{ studentId: 1, present: true }, { studentId: 2, present: false }, { studentId: 3, present: true }, { studentId: 4, present: false }, { studentId: 5, present: true }, { studentId: 6, present: true }],
          },
          {
            id: 2, name: "Bases de Datos I", code: "IS-301", group: "G2", enrolled: 32, color: "#059669",
            cortes: [{ id: 1, label: "Corte 1", weight: 30 }, { id: 2, label: "Corte 2", weight: 30 }, { id: 3, label: "Corte 3", weight: 40 }],
            students: [], grades: {}, todayAttendance: []
          },
        ],
        schedule: [
          { day: "Lunes", time: "08:00-10:00", course: "IS-301 G2", room: "Aula 301" },
          { day: "Martes", time: "10:00-12:00", course: "IS-401 G1", room: "Lab 204" },
          { day: "Miércoles", time: "08:00-10:00", course: "IS-301 G2", room: "Aula 301" },
          { day: "Jueves", time: "10:00-12:00", course: "IS-401 G1", room: "Lab 204" },
        ],
      },
      "2025-2": {
        courses: [],
        schedule: [],
      },
    },
  },
};
