// services/authService.js
// Mock activo — cuando llegue el backend, solo reemplaza el contenido
// de estas funciones con fetch() al endpoint real. Las vistas no cambian.

export const login = async (id, password) => {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 300));

  if (!password) throw new Error("Ingresa tu contraseña.");

  // Credenciales demo
  if (id === "12345")  return { id, role: "student" };
  if (id === "99999")  return { id, role: "teacher" };
  if (id === "00001")  return { id, role: "admin" };

  throw new Error("ID o contraseña incorrectos.");

  // ── Producción (descomentar cuando el backend esté listo) ──
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ id, password }),
  // });
  // if (!res.ok) throw new Error("ID o contraseña incorrectos.");
  // return res.json(); // { id, role, token }
};

export const logout = async () => {
  // Producción: await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: "POST" });
  return true;
};
