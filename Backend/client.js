const debug = require('@xmpp/debug');
const { client, xml } = require("@xmpp/client");
// Create xmpp connection
xmpp= null;
username= null;
password= null;
service= "xmpp://alumchat.lol:5222";
domain= "alumchat.lol";
solicitudesamistad= [];
userStatus= "online";

async function login(username, password) {
    username = username;
    password = password;
    console.log(username, password)
    xmpp = client({
        service: service,
        domain: domain,
        username: username,
        password: password,
    });


    await xmpp.on("error", (err) => {
        if (err.condition !== 'not-authorized') { 
            console.error("Not authorized", err);
            return {"error":"UNAUTHORIZED", "err":err};
        }
    });

    await xmpp.on("online", async () => {
        console.log("Successful Connection");
        let presence = await xmpp.send(xml("presence",{type: "online"}));
        console.log(presence);
        await xmpp.on("stanza", async (stanza) => {
            if (stanza.is("message")) {
                //console.log("Stanza recibida:", stanza.toString()); 
                const body = stanza.getChild("body");
                const from =  stanza.attrs.from;
                if (body) {
                    const messageText = body.children[0];
                    const sender = from.split('@')[0];
                    if(stanza.getChildText("filename")) {
                        const fileName = stanza.getChildText("filename");
                        const fileData = stanza.getChildText("filedata");
                        const saveDir = './imagesreceived';
                        const savePath = path.join(saveDir, fileName);
                        await saveBase64ToFile(fileData, savePath);
                        // console.log(`\nArchivo recibido de ${sender}:`, fileName);
                    } else {
                        // console.log(`\nMensaje recibido de ${sender}:`, messageText);
                    }
                    
                }
            } else if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
                const from = stanza.attrs.from;
                solicitudesamistad.push(from);
            } else if(stanza.is('message') && stanza.getChild('body')) {
                if (stanza.attrs.type === "groupchat") {
                    const from = stanza.attrs.from;
                    const body = stanza.getChildText("body");
                    if (from && body) {
                        console.log(`Mensaje de grupo: ${from}: ${body}`);
                    }
                }
            }
        });
    }); 

    try {
        await xmpp.start();
        return {"status":200, "message":"Welcome back!"};  
    } catch (err) {
        if (err.condition === 'not-authorized'){
            return {"status":401, "message":"UNAUTHORIZED"};  
        }
        return {"error":"some error", err:err};  
    }
}
async function logout() {
    if (xmpp!==null && xmpp.status === "online") {
        console.log("it is logged");
        try {
            await xmpp.stop();
            xmpp = null;
            console.log("Logging out");
            return {"status":205, "message": "Loggout Successful"}
        } catch (err) {
            console.error('Can\'t loggout', err.message);
            return {"status":401, "message": "Can't loggout"}
        }
    } else {
        console.log("There is no loggout");
        return {"status":205, "message": "There is nowhere to loggout"}
    }
}
module.exports = {
    login,
    logout,
}