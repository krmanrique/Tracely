const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Courses = sequelize.define('courses', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo:      { type: DataTypes.STRING(20), allowNull: false },   // ej: "IS-401"
  nombre:      { type: DataTypes.STRING, allowNull: false },
  grupo:       { type: DataTypes.STRING(5), defaultValue: 'G1' },  // ej: "G1"
  creditos:    { type: DataTypes.INTEGER, defaultValue: 3 },
  color:       { type: DataTypes.STRING(7), defaultValue: '#4F46E5' },
  profesor_id: { type: DataTypes.INTEGER, allowNull: true },
  carrera_id:  { type: DataTypes.INTEGER, allowNull: true },
  semestre_id: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'courses' });

module.exports = Courses;
