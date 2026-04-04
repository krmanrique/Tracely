const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Users = sequelize.define('users', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre no puede estar vacío' } },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'El email ya está registrado' },
    validate: { isEmail: { msg: 'Email inválido' } },
  },
  contrasena_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'profesor', 'estudiante'),
    allowNull: false,
    defaultValue: 'estudiante',
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }, 

  }, {
    tableName: 'users',
    // Excluir contraseña en consultas por defecto
    defaultScope: {
      attributes: { exclude: ['contrasena_hash'] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },

});

module.exports = Users;