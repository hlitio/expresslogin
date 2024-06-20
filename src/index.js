// src/index.js

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const { swaggerUi, swaggerDocs } = require('../swagger/swaggerConfig');
const sequelize = require('./models/index');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/users', userRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  });
});

