const db = require('../../loaders/sqlite');

async function domainVerification(req, res) {
    let {domains, emails, uniqueId} = req.body;

    if (!domains?.length || !emails?.length || !uniqueId) {
        return res.status(400).send({error: 'Bad Request'});
    }

    try {
        const placeholders = domains.map(() => '?').join(', ');

        let findDomains = await db.find(`SELECT * FROM domains WHERE domain IN (${placeholders})`, domains);

        let finalInsertDomains = [];

        for (let domain of domains) {
            let found = findDomains.find(d => d.domain === domain);
            if (!found) {
                finalInsertDomains.push({domain: domain, email: emails.join(','), requested_by: uniqueId, created_at: new Date().toISOString(), updated_at: new Date().toISOString()});
            }
        }

        if (finalInsertDomains.length > 0) {
            let insertDomains = await db.insertMany('domains', finalInsertDomains);
            console.log("=>(domainVerification.js:26) insertDomains", insertDomains);
        }
        return res.send({message: "Domain verification is successful."});
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: 'Internal Server Error!'});
    }
}

module.exports = {domainVerification};