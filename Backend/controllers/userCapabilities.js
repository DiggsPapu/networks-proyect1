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
async function sendMessage(req, res){
    try {
        const { user, message } = req.body;
        let response = await cli.sendMessage(user, message);
        res.status(response.status).send({"message":response.message});
    }
    catch(err) {
        console.log(err);
        res.status(401).send({"message":"Couldn't send the message"});
    }
}
async function sendImage(req, res){
    try {
        const { user, image } = req.body;
        // Make a function to save image
        let response = await cli.sendImage(user, "./images/image.jpg");
        res.status(response.status).send({"message":response.message});
    }
    catch(err) {
        console.log(err);
        res.status(401).send({"message":"Couldn't send the image"});
    }
}
module.exports = {
    definePresenceMessage,
    sendMessage,
    sendImage
};