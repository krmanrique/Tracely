const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Attendance = sequelize.define('attendance', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  estudiante_id: { type: DataTypes.INTEGER, allowNull: false },
  curso_id:      { type: DataTypes.INTEGER, allowNull: false },
  fecha:         { type: DataTypes.DATEONLY, allowNull: false },
  presente:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  registrado_por:{ type: DataTypes.INTEGER, allowNull: true }, // id del profesor
}, {
  tableName: 'attendance',
  indexes: [{ unique: true, fields: ['estudiante_id', 'curso_id', 'fecha'] }],
});

module.exports = Attendance;
