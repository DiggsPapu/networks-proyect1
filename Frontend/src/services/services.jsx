import { Strophe, $pres, $msg, $iq } from "strophe.js"

export class xmppService {
  static PRESENCE_TYPES = {
    SUBSCRIBE: "subscribe",
    SUBSCRIBED: "subscribed",
    UNSUBSCRIBE: "unsubscribe",
    UNSUBSCRIBED: "unsubscribed",
    UNAVAILABLE: "unavailable",
  }

  constructor(url) {
    this.connection = new Strophe.Connection(url)

    this.domain = "alumchat.lol"
    this.roster = {} 
    this.subscriptionQueue = []
    this.jid = "" 
    this.status = "online"
    this.statusMessage = "Available"
    this.messagesReceived = []
    this.contactCurrentlyChatting = ""
    this.onRosterReceived = () => {}
    this.onSubscriptionReceived = () => {} 
    this.onMessageReceived = () => {}
  }

  connect(jid, password, connect) {
    this.connection.addHandler(this.handlePresence.bind(this), null, "presence")
    this.connection.addHandler(this.handleMessage.bind(this), null, "message", "chat")

    this.connection.connect(jid, password, (status) => {
      if (status === Strophe.Status.CONNECTED) {
        this.jid = jid
        this.connection.send(this.status === "offline"? $pres({ type: "unavailable" }): $pres().c("show").t(this.status).up().c("status").t(this.statusMessage).tree())
        connect()
      } else if (status === Strophe.Status.AUTHFAIL) {
        console.error("Authentication failed")
      }
    })
  }

  updateStatus(show, statusMessage) {
    this.connection.send(show === "offline"? $pres({ type: "unavailable" }): $pres().c("show").t(show).up().c("status").t(statusMessage).tree())
    this.status = show
    this.statusMessage = statusMessage
  }

  sendMessage(jid, msg) {
    const message = $msg({ to: jid, type: "chat" }).c("body").t(msg)
    this.connection.send(message.tree())
    console.log(this.contactCurrentlyChatting)
  }

  handleMessage(message) {
    console.log("Message stanza received:", message);
    
    const from = message.getAttribute("from");
    const body = message.getElementsByTagName("body")[0]?.textContent;
  
    if (body) {
      this.onMessageReceived({ from, body });
      
      const contactJid = `${from.split("@")[0]}@alumchat.lol`;
      this.messagesReceived.push({
        from: contactJid,
        body,
        messageId: this.messagesReceived.length.toString(),
        alreadyDisplayed: false,
      })
      console.log(this.messagesReceived)
    }
    return true;
  }
  

  setOnMessageReceived(callback) {
    this.onMessageReceived = callback
  }

  signUp(username, password, onSuccess, onError) {
    this.connection.connect("alo20172@alumchat.lol", "Manager123", (status) => {
      if (status === Strophe.Status.CONNECTED) {
        console.log("Connected to XMPP server")

        const registerIQ = $iq({ type: "set", to: this.domain })
          .c("query", { xmlns: "jabber:iq:register" })
          .c("username").t(username).up()
          .c("password").t(password).up()

        this.connection.sendIQ(registerIQ, (iq) => {
          console.log("Registration successful", iq)
          this.connection.disconnect()
          onSuccess()
        }, (error) => {
          console.error("Registration failed", error)
          this.connection.disconnect()
          onError(error)
        })
      } else if (status === Strophe.Status.CONNFAIL) {
        console.error("Connection to XMPP server failed")
        onError(new Error("Failed to connect to XMPP server"))
      }
    })
  }

  fetchRoster() {
    const rosterIQ = $iq({ type: "get" }).c("query", { xmlns: "jabber:iq:roster" })

    this.connection.sendIQ(rosterIQ, (iq) => {
      console.log("Roster received", iq)
      const contacts = {}
      const items = iq.getElementsByTagName("item")
      for (let i = 0; i < items.length; i++) {
        const jid = items[i].getAttribute("jid")
        if (items[i].getAttribute("subscription") === "both" || items[i].getAttribute("ask") === "subscription" ) {
          contacts[jid] = this.roster[jid] || { jid, status: "offline", statusMessage: "" }
          this.connection.send($pres({ type: "probe", to: jid }))
        }
      }
      this.roster = contacts
      this.onRosterReceived({ ...this.roster })
    })
  }

  handlePresence(presence) {
    console.log("Presence stanza received:", presence)

    const fullJid = presence.getAttribute("from")
    const from = Strophe.getBareJidFromJid(fullJid)
    const type = presence.getAttribute("type")

    if (this.jid !== from) {
      switch (type) {
        case xmppService.PRESENCE_TYPES.SUBSCRIBE:
          this.handleSubscriptionRequest(from)
          break
        case xmppService.PRESENCE_TYPES.SUBSCRIBED:
          console.log(`${from} accepted your subscription request`)
          break
        case xmppService.PRESENCE_TYPES.UNSUBSCRIBED:
          delete this.roster[from]
          break
        case xmppService.PRESENCE_TYPES.UNAVAILABLE:
          this.roster[from] = { jid: from, status: "offline", statusMessage: "" }
          break
        default:
          const status = presence.getElementsByTagName("show")[0]?.textContent || "online"
          const statusMessage = presence.getElementsByTagName("status")[0]?.textContent || "Available"
          this.roster[from] = { jid: from, status, statusMessage }
      }
      this.onRosterReceived({ ...this.roster })
    }

    return true
  }

  handleSubscriptionRequest(from) {
    if (!(from in this.roster)) {
      console.log(`Subscription request from ${from} received`)
      this.subscriptionQueue.push(from)
      this.onSubscriptionReceived([...this.subscriptionQueue])
    } else {
      console.log(`Subscription request from ${from} already accepted`)
      this.acceptSubscription(from)
    }
  }

  fetchSubscriptionRequests(onFetchSubscriptions) {
    onFetchSubscriptions([...this.subscriptionQueue])
  }

  sendPresenceProbe(jid) {
    const probe = $pres({ type: "probe", to: jid })
    this.connection.send(probe.tree())
  }
  
  cleanClientValues() {
    this.roster = {}
    this.subscriptionQueue = []
    this.onRosterReceived = () => {}
    this.onSubscriptionReceived = () => {}
    this.jid = ""
    this.status = "online"
    this.statusMessage = "Available"
  }

  logOut() {
    this.connection.send($pres({ type: "unavailable" }))
    this.connection.disconnect()
    this.cleanClientValues()
  }

  setOnRosterReceived(callback) {
    this.onRosterReceived = callback
  }

  setOnSubscriptionReceived(callback) {
    this.onSubscriptionReceived = callback
  }

  getProfile(jid, onProfileReceived) {
    const vCardIQ = $iq({ type: "get", to: jid }).c("vCard", { xmlns: "vcard-temp" })
    this.connection.sendIQ(vCardIQ, (iq) => {
      const vCard = iq.getElementsByTagName("vCard")[0]
      if (vCard) {
        console.log(iq)
        // process vCard here
      } else {
        console.log("vCard not found")
      }
    })
  }

  deleteAccount(onSuccess) {
    const deleteIQ = $iq({ type: "set", to: this.domain })
      .c("query", { xmlns: "jabber:iq:register" })
      .c("remove")

    this.connection.sendIQ(deleteIQ, (iq) => {
      console.log("Account deletion successful", iq)
      onSuccess()
    }, (error) => {
      console.error("Account deletion failed", error)
    })
  }

  sendSubscriptionRequest(jid) {
    const presenceSubscribe = $pres({ to: jid, type: "subscribe" })
    this.connection.send(presenceSubscribe.tree())
    console.log(`Subscription request sent to ${jid}`)
  }

  addContact(contact) {
    const addContactIQ = $iq({ type: "set" })
      .c("query", { xmlns: "jabber:iq:roster" })
      .c("item", { jid: contact })
  
    this.connection.sendIQ(addContactIQ, (iq) => {
      console.log(`Contact ${contact} added successfully`, iq)
    }, (error) => {
      console.error(`Failed to add contact ${contact}`, error)
    })
  }

  acceptSubscription(from) {
    console.log(`Accepting subscription request from ${from}`)
    const acceptPresence = $pres({ to: from, type: "subscribed" })
    this.connection.send(acceptPresence.tree())

    if (!(from in this.roster)) {
      console.log("Adding contact to roster")
      this.sendSubscriptionRequest(from)
    }

    this.subscriptionQueue = this.subscriptionQueue.filter(jid => jid !== from)
    this.onSubscriptionReceived([...this.subscriptionQueue])
  }

  rejectSubscription(from) {
    console.log(`Rejecting subscription request from ${from}`)
    const rejectPresence = $pres({ to: from, type: "unsubscribed" })
    this.connection.send(rejectPresence.tree())
    
    this.subscriptionQueue = this.subscriptionQueue.filter(jid => jid !== from)
    this.onSubscriptionReceived([...this.subscriptionQueue])
  }
}
