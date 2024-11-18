const cron = require('node-cron');
const {processDomains} = require("./domainsCron");

function initCron() {
    cron.schedule('0 0 * * *', processDomains);
}

module.exports = {initCron};