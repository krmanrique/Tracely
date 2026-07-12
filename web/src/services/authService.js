const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const rolMap = { estudiante: 'student', docente: 'teacher', admin: 'admin' };

export const login = async (id, password) => {
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ID o contraseña incorrectos.');
  }

  const data = await res.json();
  return {
    id:     data.user.id_institucional,
    role:   rolMap[data.user.rol] ?? data.user.rol,
    nombre: data.user.nombre,
    correo: data.user.correo,   // ← incluir correo
    token:  data.token,
  };
};

export const logout = async () => true;
