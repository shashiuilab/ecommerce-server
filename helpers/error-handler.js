function errorHandler(err, req, res, next) {
    console.log(err, 1231424);
    if(err?.code === 'credentials_required') {
       return res.status(401).send("User is not authorised");
    } else if(err?.code === 'invalid_token') {
        return res.status(401).send("Invalid Token");
    } else if(err?.code === 'revoked_token') {
        return res.status(503).send("Unauthorized Operation");
    }
    return res.status(500).send("Error in Server");
}

module.exports = errorHandler;