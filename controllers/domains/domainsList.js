const db = require('../../loaders/sqlite');

async function domainsList(req, res) {
    let {client_id} = req.query;

    if (!client_id) {
        return res.status(400).send({error: 'Bad Request'});
    }

    try {
        let domains = await db.find('SELECT * FROM domains WHERE requested_by = ?', [client_id]);
        return res.send(domains.map(e => this.e = {...e, email: e.email.split(",")}));
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: 'Internal Server Error!'});
    }
}

module.exports = {domainsList};