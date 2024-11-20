const db = require('../../loaders/sqlite');

async function domainDelete(req, res) {
    let {domain_id} = req.params;
    let {client_id} = req.query;

    if (!client_id || !domain_id) {
        return res.status(400).send({error: 'Bad Request'});
    }
    try {
        let domain = await db.find('SELECT * FROM domains WHERE requested_by = ? AND id = ?', [client_id, domain_id]);
        if (!domain) {
            return res.status(404).send({error: 'Domain not found'});
        }
        await db.deleteBy('DELETE FROM domains WHERE id = ?', [domain_id]);
        return res.send({message: 'Domain deleted successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: 'Internal Server Error!'});
    }
}

module.exports = {domainDelete};