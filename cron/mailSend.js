const db = require('../loaders/sqlite');
const {sendEmail} = require("../utils/mail");

const EMAIL_EXPIRY = 12;

async function processEmails() {

    console.log("EMAIL SEND CRON JOB STARTED => ", new Date());

    let finalEmail = {};
    let domains = await db.find(`SELECT * FROM domains WHERE DATE(expiry) BETWEEN DATE('now') AND DATE('now', '+${EMAIL_EXPIRY} days')`);

    console.log("TOTAL DOMAINS ABOUT TO EXPIRE => ", domains.length);

    for (let i = 0; i < domains.length; i++) {
        domains[i].expire_in_days = (Math.floor((new Date(domains[i].expiry) - new Date()) / 86400000)) || 0;
        if (!finalEmail[domains[i].requested_by]) {
            finalEmail[domains[i].requested_by] = [];
        }

        finalEmail[domains[i].requested_by].push(domains[i]);
    }

    for (let key in finalEmail) {
        console.log("Final Email => ", key, finalEmail[key].length);

        if (finalEmail[key].length === 0) {
            continue;
        }

        // Send email to the user
        let emailConfig = {
            from: "no-reply@adunbox.com",
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

    console.log("Emails sent => ", new Date());
    console.log("EMAIL SEND CRON JOB COMPLETED => ", new Date());
}

module.exports = {processEmails};


let html = (List) => {
    return `
<!DOCTYPE html>
<html lang="en">
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
