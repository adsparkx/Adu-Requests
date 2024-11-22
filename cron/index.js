const cron = require('node-cron');
const {processDomains} = require("./domainsCron");

function initCron() {
    cron.schedule('30 7 * * *', processDomains);
}

module.exports = {initCron};