require('dotenv').config();
const express = require('express');
const { requestManager } = require('./utils/axios');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.send('OK');
});

app.post('/request', async (req, res) => {
    return res.send(await requestManager(req.body));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}).on('uncaughtException', err => {
    console.error('Uncaught Exception thrown', err);
}).on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
    process.exit(0);
});