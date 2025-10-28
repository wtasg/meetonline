import express from 'express';
import { getHome, getEngineCheckLight } from '../controller/mainController.js';

const router = express.Router();

router.get('/', getHome);

router.get('/cel', getEngineCheckLight);

export default router;
