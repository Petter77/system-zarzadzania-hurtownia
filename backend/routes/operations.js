import express from 'express';
import { performOperation } from '../controllers/operationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/operation', authenticate, performOperation);

export default router;
