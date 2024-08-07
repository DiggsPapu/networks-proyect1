var cli = require('../client.js');
// Your "fix" is to disable Node from rejecting self-signed certificates by allowing ANY unauthorised certificate. https://stackoverflow.com/questions/35633829/node-js-error-process-env-node-tls-reject-unauthorized-what-does-this-mean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function getContacts(req, res){
    try {
        let response = await cli.getContacts();
        if (response.status === 200){
            res.status(response.status).send({"contacts":response.contacts});
        }
        else{
            res.status(response.status).send({"message":response.message});
        }
    } catch (error) {
        res.status(401).send({"message": "UNAUTHORIZED"});
    }
};

async function addContact(req, res){
    try {
        const { contact } = req.body;
        let response = await cli.addContact(contact);
        res.status(response.status).send({"message":response.message});
    } catch (error) {
        res.status(401).send({"message": "error"});
    }
};

async function getContactDetails(req, res){
    try {
        const { contact } = req.body;
        let response = await cli.getContactDetails(contact);
        res.status(response.status).send({"contact":response.contact});
    } catch (error) {
        res.status(401).send({"message": "error"});
    };
};
module.exports = {
    getContacts,
    addContact,
    getContactDetails,
};