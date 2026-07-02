const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Enrollments = sequelize.define('enrollments', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  estudiante_id: { type: DataTypes.INTEGER, allowNull: false },
  curso_id:      { type: DataTypes.INTEGER, allowNull: false },
  semestre_id:   { type: DataTypes.INTEGER, allowNull: false },
  estado:        {
    type: DataTypes.ENUM('activo', 'retirado', 'finalizado'),
    defaultValue: 'activo',
  },
}, {
  tableName: 'enrollments',
  indexes: [{ unique: true, fields: ['estudiante_id', 'curso_id', 'semestre_id'] }],
});

module.exports = Enrollments;
