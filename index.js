require('dotenv').config();
process.env.pm_id = "0";
const express = require('express');
const {requestManager} = require('./utils/axios');
const {domainVerification} = require("./controllers/domains/domainVerification");
const {connect} = require("./loaders/sqlite");
const {initCron} = require("./cron");
const {processDomains} = require("./cron/domainsCron");
const {authenticationMiddleware} = require("./middleware/authentication");

const app = express();

// (async () => {
//     await connect();
// })();

app.use(express.json());

app.get('/health', (req, res) => {
    res.send('OK');
});

app.post('/request', authenticationMiddleware, async (req, res) => {
    return res.send(await requestManager(req.body));
});

app.post('/domains/check', authenticationMiddleware, domainVerification);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

if (process.env.pm_id === "0" || process.env.CRON === "true") {
    console.log("Starting cron jobs");
    // processDomains();
    // initCron();
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}).on('uncaughtException', err => {
    console.error('Uncaught Exception thrown', err);
}).on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
    process.exit(0);
});