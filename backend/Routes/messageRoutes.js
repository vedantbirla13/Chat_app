import express from 'express'
import { verifyToken } from '../middlerware/authMiddleware.js';
import { getAllMessages, sendMessage } from '../Controllers/messageControllers.js';

const router = express.Router();

router.route("/").post(verifyToken, sendMessage)

router.route("/:chatId").get(verifyToken, getAllMessages);

export default router