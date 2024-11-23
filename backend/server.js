// backend/server.js
import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { router as chatRoutes } from './routes/chatRoutes.js';

const app = express();

app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/chat', chatRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Une erreur est survenue',
        details: err.message
    });
});

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});