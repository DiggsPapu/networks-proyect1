const { client, xml } = require("@xmpp/client");
const readline = require("readline");
const net = require('net');
const fs = require("fs");
const path = require('path');

// Your "fix" is to disable Node from rejecting self-signed certificates by allowing ANY unauthorised certificate. https://stackoverflow.com/questions/35633829/node-js-error-process-env-node-tls-reject-unauthorized-what-does-this-mean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Create xmpp connection
let xmpp = null;
let username = null;
let password = null;
const service = "xmpp://alumchat.lol:5222";
const domain = "alumchat.lol";
let solicitudesamistad = [];
let userPresenceStatus = "online";

async function login(userName, password){
    xmpp = client({
        service:service,
        domain:domain,
        username:userName,
        password:password
    });
    xmpp.on("error", (err) =>{
        if (err.condition)
    })
}