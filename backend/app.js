import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import operationRoutes from './routes/operations.js';
import inventoryRoutes from './routes/inventory.js';



dotenv.config();
const app = express();
app.use(express.json());

app.use('/api', operationRoutes);
app.use('/api/inventory', inventoryRoutes);


sequelize.sync({ alter: true }) // Synchronizuje modele z bazą danych
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Error synchronizing database:', err));

sequelize.authenticate().then(() => {
  console.log('Database connected');
  app.listen(3000, () => console.log('Server running on port 3000'));
}).catch(err => {
  console.error('Unable to connect to DB:', err);
});
