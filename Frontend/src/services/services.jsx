// Define `global` before anything else is imported
(function() {
    if (typeof global === 'undefined') {
        window.global = window;
    }
})();
  
import { client, xml } from "@xmpp/client";

// Your existing code...

// Define the xmpp connection and other variables
let xmpp = null;
let username = null;
let password = null;
const service = "ws://alumchat.lol:7070/ws";
const domain = "alumchat.lol";
let friendrequest = [];
let contacts_ = [];
let userStatus = "online";

export async function getFriendRequests(){
    await xmpp.on("stanza", async (stanza) => {
        if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
            console.log("subscribe: ")
            const from = stanza.attrs.from;
            console.log(from)
            friendrequest.push(from);
        }
    })
    localStorage.setItem("requests", friendrequest);
    return 200
}
export async function login(username, password) {
    let messages = [];
    console.log(username, password);
    xmpp = client({
        service: service,
        domain: domain,
        username: username,
        password: password,
    });

    await new Promise((resolve, reject) => {
        xmpp.on("error", (err) => {
            if (err.condition !== 'not-authorized') { 
                console.error("Not authorized", err);
                reject({"error":"UNAUTHORIZED", "err":err});
            }
        });

        xmpp.on("online", async () => {
            console.log("Successful Connection");
            await xmpp.send(xml("presence", {type: "online"}));
            const contacts = {};
            let waitingForPresences = new Set();
            await xmpp.send(
                xml(
                    "iq",
                    { type: "get", id: "roster" },
                    xml("query", { xmlns: "jabber:iq:roster" })
                )
            );
            xmpp.on("stanza", async (stanza) => {
                console.log(stanza)
                if (stanza.is('message') && stanza.getChild('body')) {
                    // Group chat
                    if (stanza.attrs.type === "groupchat") {
                        const from = stanza.attrs.from;
                        console.log("");
                        console.log(from);
                        const body = stanza.getChildText("body");
                        if (from && body) {
                            console.log(`Mensaje de grupo: ${from}: ${body}`);
                            messages.push({from, body});
                        }
                    }
                    // chat
                    else {
                        const from = stanza.attrs.from;
                        const id = stanza.attrs.id;
                        const body = stanza.getChildText("body");
                        if (from && body) {
                            console.log(`private chat: ${from}: ${body}`);
                            messages.push({from, body, id});
                            localStorage.setItem("messages",JSON.stringify(messages))
                        }
                    }
                } else if (stanza.is("iq") && stanza.attrs.id === "roster") {
                    const query = stanza.getChild('query');
                    if (query) {
                        query.getChildren("item").forEach((item) => {
                            
                            const jid = item.attrs.jid;
                            const name = item.attrs.name || jid.split("@")[0];
                            const subscription = item.attrs.subscription;
                            console.log(`name: ${name} subscription: ${subscription}`)
                            if (subscription === "from"||subscription === "none"){
                                console.log("from|none")
                                friendrequest.push(jid);
                                localStorage.setItem("requests", JSON.stringify(friendrequest))
                            } else if (subscription === "to"){
                                console.log("to")
                                // Indicates that you have subscribed to this contact's presence, but they haven't subscribed to yours. contact
                                contacts_.push({ name, jid, presence: "offline", subscription: subscription || "none" });
                                contacts[jid] = { name, jid, presence: "offline", subscription: subscription || "none" };
                            } else if (subscription === "both"){
                                console.log("both")
                                // Mutual subscription (not shown in this snippet, but would indicate both parties can see each other's presence). contact
                                contacts_.push({ name, jid, presence: "offline", subscription: subscription || "none" });
                                contacts[jid] = { name, jid, presence: "offline", subscription: subscription || "none" };
                            }
                            localStorage.setItem("contacts", JSON.stringify(contacts_));
                            localStorage.setItem("requests", JSON.stringify(friendrequest));
                            waitingForPresences.add(jid);
                        });
                    }
                }
            });

            resolve();
        });

        xmpp.start().catch(err => reject(err));
    });

    localStorage.setItem("requests", JSON.stringify(friendrequest));
    localStorage.setItem("messages", JSON.stringify(messages));
    return 200;
}

export async function deleteAccount(){
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
export async function signUp(username, password) {
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
        await xmpp.stop();
        return 409
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
        return 200
    }
}

export async function logout() {
    if (xmpp!==null && xmpp.status === "online") {
        console.log("it is logged");
        try {
            await xmpp.stop();
            xmpp = null;
            console.log("Logging out");
            return 205
        } catch (err) {
            console.error('Can\'t loggout', err.message);
            return 401
        }
    } else {
        console.log("There is no loggout");
        return 205
    }
}
export async function getContacts() {
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
                    console.log(`contact: ${jid}    subscription: ${subscription}`)
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
    localStorage.setItem("contacts", contacts);
    return 200;
}
export async function addContact(contact) {
    if (xmpp) {
        try {
            // Enviar solicitud de suscripción
            const presenceSubscription = xml('presence', {
                to: `${contact}@${domain}`,
                type: 'subscribe'
            });
            await xmpp.send(presenceSubscription);
            console.log(`Subscription request sent to ${contact}`);

            // Enviar solicitud para agregar al roster
            const rosterAdd = xml('iq', {
                type: 'set',
                to: `${domain}`,
                id: 'roster_add'
            }, xml('query', { xmlns: 'jabber:iq:roster' },
                xml('item', { jid: `${contact}@${domain}`, subscription: 'both' })
            ));
            
            await xmpp.send(rosterAdd);
            console.log(`Contact ${contact} added to roster.`);
            return 201;
        } catch (error) {
            console.error("Error adding contact:", error);
            return 500;
        }
    }
    console.error("UNAUTHORIZED, must be logged in");
    return 401;
}

export async function acceptFriendRequest(contact) {
    if (xmpp){
        // Subscribe to the user's presence
        const subscribe = xml('presence', {
            to: contact,
            type: 'subscribe'
        });

        // Optionally, send a "subscribed" presence to finalize the mutual subscription
        const subscribed = xml('presence', {
            to: contact,
            type: 'subscribed'
        });
        console.log("contact:",contact)
        await xmpp.send(subscribe);
        await xmpp.send(subscribed);
        console.log(`Friend request from ${contact.split('@')[0]} accepted`);
        contacts_.push({ name: contact.split('@')[0], contact: contact, presence: "offline", subscription: "none" });
        getContactDetails(contact.split('@')[0])
        localStorage.setItem("contacts", JSON.stringify(contacts_));
        return 200;
    }
    console.error("UNAUTHORIZED, must be logged in")
    return 401;
}
export async function getContactDetails(contactName){
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
    };
}
export async function definePresenceMessage(status, presenceMessage){
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
export async function sendMessage(receptor, message, type){
    console.log("sending message")
    if (!xmpp){
        return {status:401, "message": "UNAUTHORIZED, must be logged in"};
    }
    if (type === "user"){
        xmpp.send(
            xml(
                'message',
                { to: `${receptor}@${domain}`, type: 'chat' },
                xml('body', {}, message)
            )
        );
        return {status:200, "message": `Message sent to user: ${receptor}`};
    } else if (type === "groupchat"){
        xmpp.send(
            xml(
                'message',
                { to: `${receptor}@conference.${domain}`, type: 'groupchat' },
                xml('body', {}, message)
            )
        );
        return {status:200, "message": `Message sent to group: ${receptor}`};
    }
    return {status:400, "message": `Message couldn't be sent to ${type}: ${receptor}`};
}
export async function openFile(filePath) {
    const buffer = await fs.promises.readFile(filePath);
    return buffer.toString('base64');
}
export async function sendImage(user, image){
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
export async function createGroupChat(groupName) {
    if (!xmpp){
        return {status:401, "message": "UNAUTHORIZED, must be logged in"};
    }
    await xmpp.send(xml(
        'presence',
        { to: `${groupName}@conference.${domain}/${username}` }
    ));
    console.log(`Created group: ${groupName}`);
    return {status:200, "message": `Created group ${groupName}`};
}
export async function getAllMessages(){
    if(!xmpp){
        throw new Error("Not logged in");
    }

    // Create the IQ stanza to fetch offline messages
    const iq = xml(
        'iq',
        { type: 'get', id: 'fetch1' },
        xml('offline', { xmlns: 'http://jabber.org/protocol/offline' },
            xml('fetch')
        )
    );

    // Send the IQ stanza
    try {
        await xmpp.send(iq);
        console.log("Fetch request for offline messages sent successfully.");
    } catch (error) {
        console.error("Error fetching offline messages:", error.message);
    }
    let messages = []
    // Handle incoming stanzas (this should be set up in the main XMPP stanza handling section)
    xmpp.on('stanza', async (stanza) => {
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
                    messages.push({from:messageText})
                    console.log(`\nMensaje gotten from ${sender}:`, messageText);
                }
            }
        } 
    });
    return {"status":200, "messages":messages}
}

export async function getMessagesFromUser(userJid) {
    if (!xmpp) {
        throw new Error("Not logged in");
    }

    // Construct the MAM query stanza
    const mamRequest = xml(
        'iq',
        { type: 'set', id: 'mam_request' },
        xml('query', { xmlns: 'urn:xmpp:mam:2' },
            xml('x', { xmlns: 'jabber:x:data', type: 'submit' },
                xml('field', { var: 'FORM_TYPE', type: 'hidden' },
                    xml('value', {}, 'urn:xmpp:mam:2')
                ),
                xml('field', { var: 'with' },
                    xml('value', {}, userJid)
                )
            )
        )
    );

    // Send the request
    await xmpp.send(mamRequest);
    let values = []
    await new Promise((resolve, reject) => {
        const handleStanza = (stanza) => {
            console.log("name: ",stanza.name)
            values.push(stanza.name);
            if (stanza.is('message') && stanza.getChild('body')) {
                console.log("body:", stanza)
                // Process received messages
                const from = stanza.attrs.from;
                const body = stanza.getChildText('body');
                console.log(`Message from ${from}: ${body}`);
            } else if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.attrs.id === 'mam_request') {
                // Handle the MAM response
                const query = stanza.getChild('query');
                if (query) {
                    query.getChildren('fin').forEach((fin) => {
                        console.log(`MAM result: ${fin.toString()}`);
                    });
                }
                xmpp.removeListener('stanza', handleStanza);
                resolve({ status: 200, message: 'Messages retrieved' });
            }
        };

        xmpp.on('stanza', handleStanza);
    });
    console.log("values: ",values)
    return values;
}