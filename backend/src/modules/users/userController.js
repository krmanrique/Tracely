const Users   = require('./userModel');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcrypt');

// Mapea los roles de BD a los roles del frontend
const rolMap = { admin: 'admin', profesor: 'teacher', estudiante: 'student' };

const userController = {

  // POST /api/users/register
  registerUser: async (req, res) => {
    try {
      const { nombre, email, password, rol, carrera_id } = req.body;

      const salt           = await bcrypt.genSalt(10);
      const contrasena_hash = await bcrypt.hash(password, salt);

      const newUser = await Users.create({ nombre, email, contrasena_hash, rol: rol || 'estudiante', carrera_id });

      res.status(201).json({
        message: 'Usuario registrado con éxito',
        user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol },
      });
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError')
        return res.status(400).json({ error: 'El email ya está registrado' });
      console.error(e);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  },

  // POST /api/users/login
  // Acepta { id, password } — id puede ser el id numérico o el email
  loginUser: async (req, res) => {
    try {
      const { id, password } = req.body;

      // Busca por id numérico o por email
      const whereClause = isNaN(id) ? { email: id } : { id: parseInt(id) };
      const user = await Users.scope('withPassword').findOne({ where: whereClause });

      if (!user)
        return res.status(404).json({ error: 'Usuario no encontrado' });

      const valid = await bcrypt.compare(password, user.contrasena_hash);
      if (!valid)
        return res.status(401).json({ error: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.json({
        token,
        user: {
          id:     user.id,
          nombre: user.nombre,
          email:  user.email,
          rol:    user.rol,
          // El frontend usa "role" con estos valores: student | teacher | admin
          role:   rolMap[user.rol] ?? user.rol,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el login' });
    }
  },

  // GET /api/users/me  — perfil del usuario autenticado
  getMe: async (req, res) => {
    try {
      const user = await Users.findByPk(req.user.id, {
        include: [{ association: 'carrera', attributes: ['nombre'] }],
      });
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ ...user.dataValues, role: rolMap[user.rol] ?? user.rol });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const { rol } = req.query;
      const where = rol ? { rol } : {};
      const data = await Users.findAll({ where });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  getOneUser: async (req, res) => {
    try {
      const data = await Users.findByPk(req.params.id);
      if (!data) return res.status(404).json({ error: 'No encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const user = await Users.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'No encontrado' });
      const { nombre, email } = req.body;
      await user.update({ nombre, email });
      res.json({ message: 'Usuario actualizado', user });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const deleted = await Users.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: 'No encontrado' });
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error interno' });
    }
  },
};

module.exports = userController;
