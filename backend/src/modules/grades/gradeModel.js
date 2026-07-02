const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Grades = sequelize.define('grades', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  inscripcion_id: { type: DataTypes.INTEGER, allowNull: false },
  estudiante_id:  { type: DataTypes.INTEGER, allowNull: false },
  curso_id:       { type: DataTypes.INTEGER, allowNull: false },
  corte:          { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 3 } },
  actividad:      { type: DataTypes.STRING, allowNull: false },   // ej: "Parcial C1"
  tipo:           { type: DataTypes.STRING, defaultValue: 'Taller' }, // Taller, Quiz, Parcial…
  valor:          {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: { min: 0, max: 5 },
  },
  peso:           { type: DataTypes.INTEGER, defaultValue: 100 }, // peso del corte (30, 30, 40)
}, { tableName: 'grades' });

module.exports = Grades;
