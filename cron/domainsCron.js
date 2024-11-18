const {find, update} = require("../loaders/sqlite");
const whois = require("whois-json");

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
        let whoisData = await whois(domains[index].domain);

        await update("UPDATE domains SET expiry = ?, last_updated = ?, register_at = ?, cron_updated_at = ? WHERE id = ?", [whoisData.registrarRegistrationExpirationDate || null, new Date().toISOString(), whoisData.creationDate, new Date().toISOString(), domains[index].id]);
        domains[index].expiry = whoisData.registrarRegistrationExpirationDate || domains[index].expiry || null;
        domains[index].expire_in_days = Math.floor((new Date(whoisData.registrarRegistrationExpirationDate) - new Date()) / 86400000);
        domains[index].send_email = domains[index].expire_in_days < 30;

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
    let finalEmail = {};
    let domains = await find("SELECT * FROM domains");

    console.log("Cron job started => ", domains.length);
    await processDomainsRecursively(domains);

    console.log("Updated Domains => ", domains);

    for (let i = 0; i < domains.length; i++) {
        if (!finalEmail[domains[i].requested_by]) {
            finalEmail[domains[i].requested_by] = [];
        }
        if (domains[i].expire_in_days) {
            finalEmail[domains[i].requested_by].push(domains[i]);
        }
    }

    for (let key in finalEmail) {
        console.log("Final Email => ", key, finalEmail[key]);

        // Send email to the user
        let emailConfig = {
            from: "abc@adsparkx.com",
            to: finalEmail[key][0].email.split(","),
            subject: "[ALERT] [EXPIRY] Domain Expiry Notification",
            text: `The following domains are about to expire in 30 days: <br /> ${finalEmail[key].map(d => "" + d.domain + " => " + d.expire_in_days + " days ").join("<br />")}`
        }

        // Send email
        console.log("Email Config => ", emailConfig);
    }

    console.log("Final Email => ", finalEmail);
}

module.exports = {processDomains};