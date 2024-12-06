require('dotenv').config();
const express = require('express');
const {requestManager} = require('./utils/axios');
const {domainVerification} = require("./controllers/domains/domainVerification");
const {connect} = require("./loaders/sqlite");
const {initCron} = require("./cron");
const {authenticationMiddleware} = require("./middleware/authentication");
const {domainsList} = require("./controllers/domains/domainsList");
const {domainDelete} = require("./controllers/domains/domainDelete");
const {processDomains} = require("./cron/domainsCron");
const {processEmails} = require("./cron/mailSend");

const app = express();

(async () => {
    if (process.env.DOMAIN_CRON === "true") {
        console.log("Connecting to SQLite Database => ", new Date());
        await connect();
    }
})();

app.use(express.json());

app.get('/health', (req, res) => {
    res.send('OK_' + process?.env?.pm_id || "");
});

app.post('/request', authenticationMiddleware, async (req, res) => {
    return res.send(await requestManager(req.body));
});

app.get('/domains', authenticationMiddleware, domainsList);
app.post('/domains', authenticationMiddleware, domainVerification);
app.get('/domains/cron', authenticationMiddleware, async (req, res) => {
    let response = "OK";
    let {type} = req.query;
    if (type === "email") {
        await processEmails();
    } else if (type === "expiry") {
        await processDomains();
    } else {
        response = "Invalid type";
    }
    return res.send(response);
});
app.delete('/domains/:domain_id', authenticationMiddleware, domainDelete);
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

if (process.env.pm_id === "0" || process.env.CRON === "true") {
    console.log("CRON Job Initiated ===> ", new Date());
    initCron();
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}).on('uncaughtException', err => {
    console.error('Uncaught Exception thrown', err);
}).on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
    process.exit(0);
});