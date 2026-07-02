const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Semesters = sequelize.define('semesters', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: {
    type: DataTypes.STRING(10),   // ej: "2025-1"
    allowNull: false,
    unique: true,
  },
  nombre: { type: DataTypes.STRING, allowNull: false },  // ej: "Primer Semestre 2025"
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin:    { type: DataTypes.DATEONLY, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'semesters' });

module.exports = Semesters;
