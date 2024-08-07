var cli = require('../client.js');
// Your "fix" is to disable Node from rejecting self-signed certificates by allowing ANY unauthorised certificate. https://stackoverflow.com/questions/35633829/node-js-error-process-env-node-tls-reject-unauthorized-what-does-this-mean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function Login(req, res){
    try {
        const { username, password } = req.body;
        let response = await cli.login(username, password);
        if (response.status === 401){
            console.log("UNAUTHORIZED");
            res.status(response.status).send({"message": response.message});
        }
        else if (response.status === 200){
            res.status(response.status).send({"message": response.message});
        }
        else{
            res.status(response.status).send({"message": response.message});
        }
    } catch (error) {
        res.status(401).send({"message": "UNAUTHORIZED"});
    }
}
async function Register(req, res){
    const { username, password } = req.body;
    let response = await cli.signUp(username, password);
    if (response.status === 409){
        res.status(response.status).send({"message": response.message});
    }
    else {
        res.status(response.status).send({"message": response.message});
    }
}
async function DeleteAccount(req, res){
    let response = await cli.deleteAccount();
    if (response.status === 205){
        res.status(response.status).send({"message": response.message});
    }
    else {
        res.status(response.status).send({"message": response.message});
    }
}
async function Loggout(req, res){
    let response = await cli.logout()
    if (response.status === 205){
        res.status(205).send({"message":response.message})
    }
    else{
        res.status(401).send({"message":response.message})
    }
}
module.exports = {
    Login,
    Register,
    DeleteAccount,
    Loggout
};