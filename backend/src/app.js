const express = require('express');
const sequelize = require('./config/database');
const routesUsers = require('./modules/users/userRouter');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('conexión exitosa');
  })
  .catch(err => {
    console.error('Sin conexión', err);
  });

sequelize.sync({ force: false })
  .then(() => {
    console.log('Tablas sincronizadas');
  })
  .catch(error => {
    console.error('Error al sincronizar:', error);
  });

app.use('/users', routesUsers);

// app.get("/status", function(req, res) {
//   res.json('hola2') //Probar Api
// });

app.listen(PORT, () => {
  console.log("Servidor escuchando en PUERTO:", PORT);
});