var cli = require('../client.js');
// Your "fix" is to disable Node from rejecting self-signed certificates by allowing ANY unauthorised certificate. https://stackoverflow.com/questions/35633829/node-js-error-process-env-node-tls-reject-unauthorized-what-does-this-mean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function Login(req, res){
    try {
        const { username, password } = req.body;
        let response = await cli.login(username, password);
        if (response.status === 401){
            console.log("UNAUTHORIZED");
            res.status(401).send({"message": "UNAUTHORIZED"});
        }
        else if (response.status === 200){
            res.status(200).send({"message":"Successful Connection"});
        }
        else{
            res.status(405).send({"message": "Some error"});
        }
    } catch (error) {
        res.status(401).send({"message": "UNAUTHORIZED"});
    }
}
function Register(req, res){
    const { userName, password } = req.body;
    res.status(200).send({"message":"Successful Register"});

}
module.exports = {
    Login,
    Register,
};