const Users = require('./usersModel');
const jwt = require('jsonwebtoken');
const bcrypt =  require('bcrypt');

const userController = {

  registerUser: async(req, res) => {
    try {
      const { nombre, email, password } = req.body;
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUSer = await Users.create({
        nombre,
        email,
        contrasena_hash: hashedPassword
      });

      res.status(201).json({
        message: 'Usuario registrado con éxito',
        user: { id: newUSer.id, nombre: newUSer.nombre, email: newUSer.email }
      });
    } catch (e) {
      console.log('error completo', e);
      if (e.name === 'SequelizeUniqueConstrainError') {
        return res.status(400).json({ error: e.errors[0].message});
      }
      res.status(500).json({ error: 'Error al registrar el usuario' })
    }
  },

  loginUser: async(req, res) => {
    try {
      const { id, password } = req.body;
      
      const user = await Users.scope('withPassword').findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const validPassword = await bcrypt.compare(password, user.contrasena_hash);
      if(!validPassword) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error en el login' });
    }
  },

  getAllUsers: async(req, res) => {
    try {
      const data = await Users.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener datos' });
    }
  },

  getOneUser: async(req, res) => {
    try {
      const { id } = req.params;
      const data = await Users.findByPk(id);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el dato' });
    }
  },

  updateUser: async(req, res) => {
    try {
      const { id } = req.params;
      const { nombre, email } = req.body;

      const user = await Users.findByPk(id);
      if (!user) 
        return res.status(404).json({ error: 'Usuario no encontrado' });

      await user.update({ nombre, email });
      return res.status(200).json({ message: 'Usuario actualizado', user });

    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar' });
    }
  },
  
  deleteUser: async(req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Users.destroy({ where: { id } });

      if (!deleted)
        return res.status(400).json({ error: 'Usuario no encontrado' });

      res.status(200).json({ message: 'Usuario eliminado' });

    } catch (error) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

};

module.exports = userController;