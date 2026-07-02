// services/gradesService.js
const BASE_URL = import.meta.env.VITE_GRADES_API;

export const getGrades = async (studentId, semester) => {
  // Hoy:
  return mockData.student.bySemester[semester].courses;

  // Mañana (solo descomentas esto):
  // const res = await fetch(`${BASE_URL}/grades/${studentId}/${semester}`);
  // return res.json();
};