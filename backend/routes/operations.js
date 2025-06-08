<<<<<<< HEAD

=======
>>>>>>> 9bedf9316420435ae0d19759be3edebef91cdac0
import express from 'express';
import { performOperation, getOperations } from '../controllers/operationController.js';

const router = express.Router();

router.post('/operation', performOperation); 
router.get('/operations', getOperations);    

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 9bedf9316420435ae0d19759be3edebef91cdac0
