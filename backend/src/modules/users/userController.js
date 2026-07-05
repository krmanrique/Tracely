const { Usuario } = require('../../models');
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const rolMap = { admin: 'admin', docente: 'teacher', estudiante: 'student' };

const userController = {

  registerUser: async (req, res) => {
    try {
      const { id_institucional, nombre, correo, password, rol } = req.body;
      const contrasena_hash = await bcrypt.hash(password, 10);
      const newUser = await Usuario.create({ id_institucional, nombre, correo, contrasena_hash, rol: rol || 'estudiante' });
      res.status(201).json({ message: 'Usuario registrado', user: { id_institucional: newUser.id_institucional, nombre: newUser.nombre, correo: newUser.correo, rol: newUser.rol } });
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError')
        return res.status(400).json({ error: 'El correo o ID ya está registrado' });
      console.error(e);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { id, password } = req.body;
      if (!id || !password) return res.status(400).json({ error: 'ID y contraseña son requeridos' });

      const user = await Usuario.scope('withPassword').findOne({ where: { id_institucional: id } });
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const valid = await bcrypt.compare(password, user.contrasena_hash);
      if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: user.id_institucional, rol: user.rol },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.json({
        token,
        user: {
          id_institucional: user.id_institucional,
          nombre:           user.nombre,
          correo:           user.correo,
          rol:              user.rol,
          role:             rolMap[user.rol] ?? user.rol,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el login' });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await Usuario.findOne({ where: { id_institucional: req.user.id } });
      if (!user) return res.status(404).json({ error: 'No encontrado' });
      res.json({ id_institucional: user.id_institucional, nombre: user.nombre, correo: user.correo, rol: user.rol, role: rolMap[user.rol] ?? user.rol });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const { rol } = req.query;
      const data = await Usuario.findAll(rol ? { where: { rol } } : {});
      res.json(data);
    } catch (error) { res.status(500).json({ error: 'Error al obtener usuarios' }); }
  },

  getOneUser: async (req, res) => {
    try {
      const data = await Usuario.findOne({ where: { id_institucional: req.params.id } });
      if (!data) return res.status(404).json({ error: 'No encontrado' });
      res.json(data);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  },

  updateUser: async (req, res) => {
    try {
      const user = await Usuario.findOne({ where: { id_institucional: req.params.id } });
      if (!user) return res.status(404).json({ error: 'No encontrado' });
      await user.update({ nombre: req.body.nombre, correo: req.body.correo });
      res.json({ message: 'Actualizado', user });
    } catch (error) { res.status(500).json({ error: 'Error al actualizar' }); }
  },

  deleteUser: async (req, res) => {
    try {
      const deleted = await Usuario.destroy({ where: { id_institucional: req.params.id } });
      if (!deleted) return res.status(404).json({ error: 'No encontrado' });
      res.json({ message: 'Eliminado' });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
  },
};

module.exports = userController;