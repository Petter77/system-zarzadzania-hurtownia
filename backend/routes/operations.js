import express from 'express';
import { performOperation, getOperations } from '../controllers/operationController.js';

const router = express.Router();

router.post('/operation', performOperation); 
router.get('/operations', getOperations);    

export default router;