const cron = require('node-cron');
const {processDomains} = require("./domainsCron");
const {processEmails} = require("./mailSend");

function initCron() {
    cron.schedule('30 7 * * *', processEmails);
    cron.schedule('30 18 * * *', processDomains);
}

module.exports = {initCron};