import { Strophe, $pres, $msg, $iq } from "strophe.js"

// This is a service to use a client context in the whole application
export class xmppService {
  // All the types that could be in the presence stanza
  static PRESENCE_TYPES = {SUBSCRIBE: "subscribe",SUBSCRIBED: "subscribed",UNSUBSCRIBE: "unsubscribe",UNSUBSCRIBED: "unsubscribed",UNAVAILABLE: "unavailable"}
  // A constructor to create a connection in the xmpp server
  constructor(url) {
    // Creates an strophe connection
    this.connection = new Strophe.Connection(url)
    // Sets a default domain
    this.domain = "alumchat.lol"
    // To set the roster
    this.roster = {} 
    // To get the subscriptions
    this.subscriptionQueue = []
    // To set the jid
    this.jid = "" 
    // To set a default status online bc it is created in the loggin page
    this.status = "online"
    // To set a default message when connected (Available)
    this.statusMessage = "Available"
    // To set empty messages because at first idk the messages until the listeners listens the messages
    this.messagesReceived = []
    // this is a function to set the received messages
    this.onMessageReceived = () => {}
    // This is a function to set the received subscription
    this.subscripcionRecibida = () => {} 
    // This is a function to set the received roaster
    this.rosterRecibido = () => {}
  }
  // The function to connect to the server it requires the params of the jid [username]@alumchat.lol && the password of the user
  connect(jid, password, connect) {
    // This is to create a listener to listen all possible presences if the users of the roaster change the status or status message, the function is the function trigger when it gets a new presence
    this.connection.addHandler(this.obtuvoPresencia.bind(this), null, "presence")
    // This is the listener to listen to al the messages that are send to the user, the function is the function trigger when it gets a new message
    this.connection.addHandler(this.obtuvoMensaje.bind(this), null, "message", "chat")
    // This is to connect using strophe and connect making a default send status via xmpp and using a xml builder by Strophe
    this.connection.connect(jid, password, (status) => {
      if (status === Strophe.Status.CONNECTED) {
        this.jid = jid
        this.connection.send($pres().c("show").t(this.status).up().c("status").t(this.statusMessage).tree())
        connect()
      } else if (status === Strophe.Status.AUTHFAIL) {
        console.error("Authentication failed")
      }
    })
  }
  // To update the status, it gets the new status and the new message status
  actualizarEstado(nuevoEstado, nuevoMensajeDeEstado) {
    // Constructed to send the xmpp using all, in case it's offline it will trigger a type of unavailable bc it's offline, in any other case it will set the other status and status message
    this.connection.send(nuevoEstado === "offline"? $pres({ type: "unavailable" }): $pres().c("show").t(nuevoEstado).up().c("status").t(nuevoMensajeDeEstado).tree())
    // This is a handler of the new Status
    this.status = nuevoEstado
    // This is a handler of a new status message
    this.statusMessage = nuevoMensajeDeEstado
  }
  // Send message, in this case it takes the [username]@alumchat.lol of the person you want to send the message and the message that you want to send
  enviarMensaje(jid, msg) {
    // It sends the xmpp via strophe and constructs it
    this.connection.send($msg({ to: jid, type: "chat" }).c("body").t(msg).tree())
  }

  // This is in case it receives a message in the listener
  obtuvoMensaje(message) {
    // this is to set variables to store the messages and handle them
    let body, originalFrom, originalTo, timestamp
    // Get the 'from' attribute of the message (sender's JID)
    const from = message.getAttribute("from")
    // Get the 'to' attribute of the message (recipient's JID)
    const to = message.getAttribute("to")
    // Check if the message is forwarded (part of a message archive or history)
    const forwarded = message.getElementsByTagName("forwarded")[0]
    // Check if the message contains a file (for file transfers)
    const fileElement = message.getElementsByTagName("file")[0]
    // Check if the message contains a filename (for file transfers)
    const fileNameElement = message.getElementsByTagName("filename")[0]
    if (forwarded) {
      // Handle forwarded messages (message archives)
      const forwardedMessage = forwarded.getElementsByTagName("message")[0]
      originalFrom = forwardedMessage.getAttribute("from")
      originalTo = forwardedMessage.getAttribute("to")
      body = forwardedMessage.getElementsByTagName("body")[0]?.textContent
  
      const delay = forwarded.getElementsByTagName("delay")[0]
      if (delay) {
        // Extract the timestamp from the forwarded message
        timestamp = new Date(delay.getAttribute("stamp"))
      }
    } else {
      // Handle regular messages
      originalFrom = from
      originalTo = to
      body = message.getElementsByTagName("body")[0]?.textContent
      timestamp = new Date()
    }

    if (fileElement && fileNameElement) {
      // Handle received files (e.g., file transfers)
      this.onFileReceived(ot, Strophe.getBareJidFromJid(f), fileNameElement.textContent, `data:application/octet-streambase64,${fileElement.textContent}`, ts)
      return true
    }
  
    if (body) { 
      // Log the received message and store it in the messagesReceived array
      this.messagesReceived.push({userId:0, from:Strophe.getBareJidFromJid(originalFrom), to:this.jid, message:body, time:timestamp })
      this.onMessageReceived(originalTo, Strophe.getBareJidFromJid(originalFrom), body, timestamp) 
    }
    return true
  }  
  // This is to use a useState in the application, so sending a callBackFunction and then using it
  setMensajeRecibido(callback) {
    this.onMessageReceived = callback
  }
  // this is the function to sign up, just needs the username, the password, a function in case it successfully signs in and in case it is not successfull (it's not necessary to pass this)
  signUp(username, password, onSuccess, onError) {
    // It's necessary to use an already created account to create any other accounts, probably a mistake in the server or something
    this.connection.connect("alo20172@alumchat.lol", "Manager123", (status) => {
      if (status === Strophe.Status.CONNECTED) {
          // the sending query to sign up via using another client of default like alo20172@alumchat.lol to create other users, it handles the type via strophe.js
          this.connection.sendIQ($iq({ type: "set", to: this.domain }).c("query", { xmlns: "jabber:iq:register" }).c("username").t(username).up().c("password").t(password).up(), (iq) => {
          // Disconnects because the client it's just to create a new client and then not using it
          this.connection.disconnect()
          // it's to use the function passed in the context in the react page
          onSuccess()
        }, (error) => {
          // In case there is an error it just disconnects
          this.connection.disconnect()
          onError(error)
        })
        // In case it can't connect the client to create other clients it sets a failed error
      } else if (status === Strophe.Status.CONNFAIL) {
        onError(new Error("Failed to connect to XMPP server"))
      }
    })
  }
  // To get the roaster
  fetchRoster() {
    // To send the query to get the roaster in the xmpp protocol via strophe js.
    this.connection.sendIQ($iq({ type: "get" }).c("query", { xmlns: "jabber:iq:roster" }), (iq) => {
      // A contacts empty to push the contacts 1 by 1
      const contacts = {}
      // Get the items of the iq and push and handle each of the contact
      const items = iq.getElementsByTagName("item")
      for (let i = 0; i < items.length; i++) {
        // Get the jid
        const jid = items[i].getAttribute("jid")
        // Get if the contact has the capability of getting my presence and all or if they are asking for a subscription (they want to know me)
        if (items[i].getAttribute("subscription") === "both" || items[i].getAttribute("ask") === "subscription" ) {
          // set default contacts format
          contacts[jid] = this.roster[jid] || { jid, status: "offline", statusMessage: "" }
          // Send a probe 
          this.connection.send($pres({ type: "probe", to: jid }))
        }
      }
      // set the roster
      this.roster = contacts
      this.rosterRecibido({ ...this.roster })
    })
  }
  // when getting a new presence it handles it and it receives the new presence
  obtuvoPresencia(presence) {
    // Get the 'from' attribute (JID of the sender)
    const fullJid = presence.getAttribute("from")
    // Obtain the from from the JID sender
    const from = Strophe.getBareJidFromJid(fullJid)
    // Get the type from the presence
    const type = presence.getAttribute("type")
    // Check that is not the same
    if (this.jid !== from) {
      // Depending on the type it will be the handling
      switch (type) {
        // In case its a subscribe presence
        case xmppService.PRESENCE_TYPES.SUBSCRIBE:
          this.handleSubscriptionRequest(from)
          break
          // In case it is already subscribed
        case xmppService.PRESENCE_TYPES.SUBSCRIBED:
          break
        // In case it is unsubscription request
        case xmppService.PRESENCE_TYPES.UNSUBSCRIBED:
          delete this.roster[from]
          break
        // In case it is offline
        case xmppService.PRESENCE_TYPES.UNAVAILABLE:
          this.roster[from] = { jid: from, status: "offline", statusMessage: "" }
          break
        default:
          // Default case 
          const status = presence.getElementsByTagName("show")[0]?.textContent || "online"
          const statusMessage = presence.getElementsByTagName("status")[0]?.textContent || "Available"
          this.roster[from] = { jid: from, status, statusMessage }
      }
      this.rosterRecibido({ ...this.roster })
    }
    return true
  }
  // Handle the subscription request, it gets the from jid
  handleSubscriptionRequest(from) {
    // Checking if the jid is in the roster it sets the subscription and it handles in the function
    if (!(from in this.roster)) {
      this.subscriptionQueue.push(from)
      this.subscripcionRecibida([...this.subscriptionQueue])
    } else {
      // In case, it just accepts the subscription
      this.aceptarSubscripcion(from)
    }
  }
  // Getting the requests of the subscription
  fetchSubscriptionRequests(onFetchSubscriptions) {
    onFetchSubscriptions([...this.subscriptionQueue])
  }
  // Sending a presence probe gets jid to set the probe
  sendPresenceProbe(jid) {
    this.connection.send($pres({ type: "probe", to: jid }).tree())
  }
  // Handle to logout
  salir() {
    // Sending stanza to loggot setting presence unavailable
    this.connection.send($pres({ type: "unavailable" }))
    this.connection.disconnect()
  }
  // Callback handling where the roster it's received
  setrosterRecibido(callback) {
    this.rosterRecibido = callback
  }
  // Callback handling where a change in subscription is received
  setsubscripcionRecibida(callback) {
    this.subscripcionRecibida = callback
  }
  // Deleting the account just gets the function to do in the success when it's successfully deleted
  borrarCuenta(onSuccess) {
    // Sending the stanza to delete account
    this.connection.sendIQ($iq({ type: "set", to: this.domain }).c("query", { xmlns: "jabber:iq:register" }).c("remove"), (iq) => {onSuccess()}, (error) => {})
  }
  // Sending a subscription, it gets the jid to subscribe
  enviarSubscripcion(jid) {
    // Sending the subscription stanza to the jid
    this.connection.send($pres({ to: jid, type: "subscribe" }).tree())
  }
  // Add a contact
  aniadirContacto(contact) {
    // Sending the add request to roster
    this.connection.sendIQ($iq({ type: "set" }).c("query", { xmlns: "jabber:iq:roster" }).c("item", { jid: contact }), (iq) => {}, (error) => {})
  }

  aceptarSubscripcion(from) {
    // Accepting the subscription sending the stanza
    this.connection.send($pres({ to: from, type: "subscribed" }).tree())
    // sending subscription for each guy in the roster
    if (!(from in this.roster)) {this.enviarSubscripcion(from)}
    // Filtering accepted subscriptions
    this.subscriptionQueue = this.subscriptionQueue.filter(jid => jid !== from)
    this.subscripcionRecibida([...this.subscriptionQueue])
  }
// Reject subscription, getting the jid
  rechazarSubscripcion(from) {
    // Sending the xmpp to unsubscribe and reject the subscription
    this.connection.send($pres({ to: from, type: "unsubscribed" }).tree())
    // Filtering the subscriptions
    this.subscriptionQueue = this.subscriptionQueue.filter(jid => jid !== from)
    // Handling the subscriptions and filtering the subscriptions from this
    this.subscripcionRecibida([...this.subscriptionQueue])
  }
}
