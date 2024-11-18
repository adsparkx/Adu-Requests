async function authenticationMiddleware(req, res, next) {

    if (req?.headers?.['x-api-key'] !== "b932593c690f113f5a58b411a205d") {
        return res.status(401).send({error: "Unauthorized"});
    }
    next();
}

module.exports = {authenticationMiddleware};