const debug = require('@xmpp/debug');
const fs = require("fs");
const { client, xml  } = require("@xmpp/client");
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
        // Send that I am online
        await xmpp.send(xml("presence",{type: "online"}));
        // Sync new messages, new friend requests, etc
        await xmpp.on("stanza", async (stanza) => {
            console.log(stanza)
            if (stanza.is("message")) {
                const body = stanza.getChild("body");
                const from =  stanza.attrs.from;
                if (body) {
                    console.log(body)
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
                console.log("subscribe: ")
                const from = stanza.attrs.from;
                console.log(from)
                solicitudesamistad.push(from);
            } else if(stanza.is('message') && stanza.getChild('body')) {
                if (stanza.attrs.type === "groupchat") {
                    const from = stanza.attrs.from;
                    console.log("")
                    console.log(from);
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
async function deleteAccount(){
    if (!xmpp) {
        console.log('is not logged in');
        return {status:401, "message": "Not logged in"};
    }
    const deleteStanza = xml(
        'iq',
        { type: 'set', id: 'delete_account' },
        xml('query', { xmlns: 'jabber:iq:register' },
            xml('remove')
        )
    );  
    xmpp.send(deleteStanza).catch((err) => {
        xmpp.removeListener('error', errorHandler);
        console.error('Error while deleting account:', err.message);
        return {stauts:403, "message": err.message};
    });
    xmpp = null;
    return {status:205, "message": `Account ${username}, successfully deleted`};
}
// Register User
async function signUp(username, password) {
    username = username;
    password = password;
    console.log(username, password)
    xmpp = client({
        service: service,
        domain: domain,
        username: username,
        password: password,
    });
    // User already exists
    try {
        await xmpp.start();
        console.error(`User ${username} already exists`);
        await xmpp.stop();
        return {"status":409, "message": `${username} already exists`};
    }
    // User doesn't exists 
    catch (error) {
        const registerStanza = xml(
            'iq',
            { type: 'set', id: 'register' },
            xml('query', { xmlns: 'jabber:iq:register' },
                xml('username', {}, username),
                xml('password', {}, password),
            )
        );

        xmpp.send(registerStanza).then(() => {
            resolve(); 
        }).catch((err) => {
            console.log(err)
        });
        return {"status":200, "message": `${username} successfully registered`}; 
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
async function getContacts() {
    if (!xmpp) {
        throw new Error("Not Logged In");
    }
    const contacts = {};
    let waitingForPresences = new Set();

    await xmpp.on("stanza", (stanza) => {
        if (stanza.is("iq") && stanza.attrs.id === "roster") {
            const query = stanza.getChild('query');
            if (query) {
                query.getChildren("item").forEach((item) => {
                    const jid = item.attrs.jid;
                    const name = item.attrs.name || jid.split("@")[0];
                    const subscription = item.attrs.subscription;

                    contacts[jid] = { name, jid, presence: "offline", subscription: subscription || "none" };
                    waitingForPresences.add(jid);
                });
            }
        } else if (stanza.is("presence")) {
            const from = stanza.attrs.from;
            if (from in contacts) {
                contacts[from].presence = stanza.attrs.type || "online";
                waitingForPresences.delete(from);
            }
        } else if (stanza.is("presence") && stanza.attrs.type === "subscribe") {
            const from = stanza.attrs.from;
            if (from in contacts) {
                contacts[from].subscription = "pending";
            }
        }
    });
    await xmpp.send(
        xml(
            "iq",
            { type: "get", id: "roster" },
            xml("query", { xmlns: "jabber:iq:roster" })
        )
    );
    // Await for roster
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {"status":200, "contacts":Object.values(contacts)};    
}
async function addContact(contact) {
    if (xmpp){
        await xmpp.send(xml('presence', { to: `${contact}@${domain}`, type: 'subscribe' }));
        let message = `Request sent to ${contact}.`;
        console.log(message);
        return {status:201, "message": message};
    }
    return {status:401, "message": "UNAUTHORIZED, must be logged in"};
}
async function getContactDetails(contactName){
    let response = await getContacts();
    let contacts = response.contacts;
    if (response.status === 200){
        for (let k = 0; k < contacts.length; k++){
            let contact = contacts[k];
            if (contactName === contacts[k].name){
                return {status:200, contact};
            };
        };
    }
    else {
        return response;
    }
}
async function definePresenceMessage(status, presenceMessage){
    let presenceAttributes = {};
    let presenceChildren = [];
    if (status === 'offline') {
        presenceAttributes.type = 'unavailable';
    } else if (status !== 'online') {
        presenceChildren.push(xml('show', {}, status));
    }
    presenceChildren.push(xml('status', {}, presenceMessage));
    const presenceStanza = xml('presence', presenceAttributes, ...presenceChildren);
    await xmpp.send(presenceStanza);
    console.log(`New status: "${status}"    Presence message: "${presenceMessage}"`);
    return {status:205};
}
async function sendMessage(user, message){
    if (!xmpp){
        return {status:401, "message": "UNAUTHORIZED, must be logged in"};
    }
    xmpp.send(
        xml(
            'message',
            { to: `${user}@${domain}`, type: 'chat' },
            xml('body', {}, message)
        )
    );
    return {status:200, "message": `Message sent to ${user}`};
}
async function openFile(filePath) {
    const buffer = await fs.promises.readFile(filePath);
    return buffer.toString('base64');
}
async function sendImage(user, image){
    if (!xmpp){
        return {status:401, "message": "UNAUTHORIZED, must be logged in"};
    }
    openFile(image).then(base64Data => {
        xmpp.send(xml(
                'message',
                { to: `${user}@${domain}`, type: 'chat' },
                xml('filename', {}, 'chems.png'),
                xml('filedata', {}, base64Data)
            )
        );
        console.log(`Image sent to ${user}.`);
    }).catch(err => {
        console.error('Error sending image:', err.message);
        return {status:400, "message": `Couldn't send image to ${user}`};
    });
    return {status:200, "message": `Image sent to ${user}`};
}
module.exports = {
    // auth
    login,
    signUp,
    deleteAccount,
    logout,
    // handle contacts
    getContacts,
    addContact,
    getContactDetails,
    // user capabilities
    definePresenceMessage,
    sendMessage,
    sendImage,
}