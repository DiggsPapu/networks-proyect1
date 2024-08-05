const { client, xml } = require("@xmpp/client");
const debug = require('@xmpp/debug');
const readline = require("readline");
const net = require('net');
const fs = require("fs");
const path = require('path');
var cli = require('../client.js');
// Your "fix" is to disable Node from rejecting self-signed certificates by allowing ANY unauthorised certificate. https://stackoverflow.com/questions/35633829/node-js-error-process-env-node-tls-reject-unauthorized-what-does-this-mean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function Login(req, res){
    const { userName, password } = req.body;
    xmpp = client({
        service: cli.service,
        domain: cli.domain,
        username: userName,
        password: password
    });
    xmpp.on("error", (err)=>{
        if (err.condition!="not-authorized"){
            console.error("Failed Connection", err);
        };
    });
    xmpp.on("online", async ()=>{
        console.log("Successful Connection");
        // set presence online
        await xmpp.send(xml("presence",{type:"online"}));
    })
    // assign xmpp
    cli.xmpp = xmpp;
}
export async function Register(req, res){
    const { userName, password } = req.body;
    
}