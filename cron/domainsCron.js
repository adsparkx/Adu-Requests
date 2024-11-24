const {find, update} = require("../loaders/sqlite");
const whois = require("whois-parsed");
const {sendEmail} = require("../utils/mail");

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processDomainsRecursively(domains, index = 0) {
    // Base case: If index is equal to the length of the domains array, stop the recursion
    if (index >= domains.length) {
        console.log("All Whois calls completed => ", new Date());
        return;
    }

    try {
        // Make the Whois call
        let whoisData = await whois.lookup(domains[index].domain);

        await update("UPDATE domains SET expiry = ?, last_updated = ?, register_at = ?, cron_updated_at = ?, updated_at = ? WHERE id = ?", [whoisData.expirationDate || null, whoisData.updatedDate, whoisData.creationDate, new Date().toISOString(), new Date().toISOString(), domains[index].id]);

        // Delay for 5 seconds before the next call
        await delay(2000);

        // Recursive call for the next domain
        await processDomainsRecursively(domains, index + 1);
    } catch (error) {
        console.error(`Error fetching Whois data for ${domains[index].domain}:`, error);

        // Continue with the next domain even if there is an error
        await delay(2000); // Add a delay before continuing
        await processDomainsRecursively(domains, index + 1);
    }
}

async function processDomains() {
    let domains = await find("SELECT * FROM domains");

    console.log("Cron job started => ", domains.length);
    await processDomainsRecursively(domains);
    console.log("UPDATE EXPIRY DATE Cron job completed => ", new Date());
}


module.exports = {processDomains};