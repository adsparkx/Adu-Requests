const whois = require("whois-parsed");
const qs = require("qs");
const axios = require("axios");

async function getDomainDetails(domain) {
    let returnObject = {
        domain: domain,
        expiry: null,
        last_updated: null,
        register_at: null,
        cron_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_valid: false,
    }
    try {
        let whoisData = await whois.lookup(domain);
        if (whoisData) {
            returnObject.expiry = whoisData.expirationDate;
            returnObject.last_updated = whoisData.updatedDate;
            returnObject.register_at = whoisData.creationDate;
            returnObject.is_valid = true;
        }
    } catch (error) {
        console.error(`Error fetching Whois data for ${domain}:`, error);

        try {
            const config = {
                method: "GET",
                url: `https://api.ip2whois.com/v2?key=906AB015E54D1CB25CEEC4B695ED9065&domain=${domain}`
            }

            let response = await axios(config);
            if (response.status === 200 && response?.data?.expire_date) {
                returnObject.expiry = new Date(response?.data?.expire_date);
                returnObject.last_updated = new Date(response?.data?.update_date || new Date());
                returnObject.register_at = new Date(Number(response?.data?.create_date));
                returnObject.is_valid = true;
            }

        } catch (error) {
            console.error(`Error fetching Whois data for ${domain}:`, error.message);
        }
    }

    return returnObject;
}

module.exports = {getDomainDetails};