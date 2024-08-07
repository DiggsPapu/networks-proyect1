var cli = require('../client.js');
// Your "fix" is to disable Node from rejecting self-signed certificates by allowing ANY unauthorised certificate. https://stackoverflow.com/questions/35633829/node-js-error-process-env-node-tls-reject-unauthorized-what-does-this-mean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function definePresenceMessage(req, res){
    try {
        const { status, presenceMessage } = req.body;
        let response = await cli.definePresenceMessage(status, presenceMessage);
        res.status(response.status).send({"message":"Successfully set new status & presence message"});
    }
    catch(err) {
        res.status(401).send({"message":"Couldn't change the presence message and status"});
    }
}
module.exports = {
    definePresenceMessage
};