// backend/routes/chatRoutes.js
import express from 'express';
import { ChatService } from '../services/chatService.js';
import { config } from '../config/config.js';

export const router = express.Router();
const chatService = new ChatService(config.anthropicApiKey, config.systemPrompt);

// Route principale pour /api/chat
router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;
        const response = await chatService.sendMessage(message, history);
        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: 'Une erreur est survenue',
            details: error.message
        });
    }
});

// Route alternative pour /api/chat/message (garde la compatibilité)
router.post('/message', async (req, res) => {
    try {
        const { message, history } = req.body;
        const response = await chatService.sendMessage(message, history);
        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: 'Une erreur est survenue',
            details: error.message
        });
    }
});

// Route GET pour tester la connexion
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Chat API is running'
    });
});