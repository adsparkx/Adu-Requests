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
        domains[index].expiry = whoisData.expirationDate || domains[index].expiry || null;
        domains[index].expire_in_days = (Math.floor((new Date(whoisData.expirationDate) - new Date()) / 86400000)) || 0;
        domains[index].send_email = domains[index].expire_in_days < 12;

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
        if (domains[i]?.send_email) {
            finalEmail[domains[i].requested_by].push(domains[i]);
        }
    }

    for (let key in finalEmail) {
        console.log("Final Email => ", key, finalEmail[key].length);

        if (finalEmail[key].length === 0) {
            continue;
        }

        // Send email to the user
        let emailConfig = {
            from: "dilip.kumar@adsparkx.com",
            to: finalEmail[key][0].email.split(","),
            subject: "[ALERT] [EXPIRY] Domain Expiry Notification",
            text: html(finalEmail[key]),
        }


        await sendEmail({
            from: emailConfig.from,
            to: emailConfig.to,
            subject: emailConfig.subject,
            text: emailConfig.text,
        });
    }

}

let html = (List) =>
{
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .email-container {
            margin: 20px auto;
            max-width: 600px;
        }
        h2 {
            color: #4CAF50;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 10px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
    <title>ALERT EXPIRE DOMAIN</title>
</head>
<body>
    <div class="email-container">
        <h2>Domain Expiration Reminder</h2>
        <p>Hi Team,</p>
        <p>This is a reminder about the upcoming expiration dates for the following domains. Please review the details below and take necessary action to renew them if required:</p>
        <table>
            <thead>
                <tr>
                    <th>Domain Name</th>
                    <th>Days to Expire</th>
                </tr>
            </thead>
            <tbody>
                ${List.map(e => {
        return `
                    <tr>
                        <td>${e.domain}</td>
                        <td>${e.expiry} (${e.expire_in_days} days left)</td>
                    </tr>`;
    }).join('')}
            </tbody>
        </table>
        <p>Please ensure to renew your domains before they expire to avoid any disruptions. If you have already renewed them, please ignore this reminder.</p>
    </div>
</body>
</html>`;

};

module.exports = {processDomains};