const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tracely', 'postgres', 'Kevin.106499',  { // poner credenciales
  host: "localhost",
  dialect: 'postgres',
  port: 5432,
});

module.exports = sequelize;
