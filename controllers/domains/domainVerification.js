const db = require('../../loaders/sqlite');

async function domainVerification(req, res) {
    let {domains, emails} = req.body;
    let {client_id} = req.query;

    if (!domains?.length || !emails?.length || !client_id) {
        return res.status(400).send({error: 'Bad Request'});
    }

    try {
        const placeholders = domains.map(() => '?').join(', ');

        let findDomains = await db.find(`SELECT * FROM domains WHERE domain IN (${placeholders})`, domains);

        let finalInsertDomains = [];

        for (let domain of domains) {
            let found = findDomains.find(d => d.domain === domain);
            if (!found) {
                finalInsertDomains.push({
                    domain: domain,
                    email: emails.join(','),
                    requested_by: client_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            } else {
                await db.update('UPDATE domains SET email = ?, updated_at = ?, requested_by = ? WHERE domain = ?', [emails.join(','), new Date().toISOString(), client_id, domain]);
            }
        }

        if (finalInsertDomains.length > 0) {
            await db.insertMany('domains', finalInsertDomains);
        }
        return res.send({message: "Domain verification is successful."});
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: 'Internal Server Error!'});
    }
}

module.exports = {domainVerification};