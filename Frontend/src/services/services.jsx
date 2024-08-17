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
    this.connection.addHandler(this.handlePresence.bind(this), null, "presence")
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
    const from = message.getAttribute("from")
    const to = message.getAttribute("to")
    const forwarded = message.getElementsByTagName("forwarded")[0]
    const fileElement = message.getElementsByTagName("file")[0]
    const fileNameElement = message.getElementsByTagName("filename")[0]
    if (forwarded) {
      const forwardedMessage = forwarded.getElementsByTagName("message")[0]
      originalFrom = forwardedMessage.getAttribute("from")
      originalTo = forwardedMessage.getAttribute("to")
      body = forwardedMessage.getElementsByTagName("body")[0]?.textContent
  
      const delay = forwarded.getElementsByTagName("delay")[0]
      if (delay) {
        timestamp = new Date(delay.getAttribute("stamp"))
      }

    } else {
      originalFrom = from
      originalTo = to
      body = message.getElementsByTagName("body")[0]?.textContent
      timestamp = new Date()
    }

    if (fileElement && fileNameElement) {
      this.onFileReceived(ot, Strophe.getBareJidFromJid(f), fileNameElement.textContent, `data:application/octet-streambase64,${fileElement.textContent}`, ts)
      return true
    }
  
    if (body) {
      console.log(`Message received from ${Strophe.getBareJidFromJid(originalFrom)} at ${timestamp.toLocaleDateString()}: ${body}`)
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
        this.connection.sendIQ($iq({ type: "set", to: this.domain }).c("query", { xmlns: "jabber:iq:register" }).c("username").t(username).up().c("password").t(password).up(), (iq) => {
          this.connection.disconnect()
          onSuccess()
        }, (error) => {
          this.connection.disconnect()
          onError(error)
        })
      } else if (status === Strophe.Status.CONNFAIL) {
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
      this.rosterRecibido({ ...this.roster })
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
      this.rosterRecibido({ ...this.roster })
    }

    return true
  }

  handleSubscriptionRequest(from) {
    if (!(from in this.roster)) {
      console.log(`Subscription request from ${from} received`)
      this.subscriptionQueue.push(from)
      this.subscripcionRecibida([...this.subscriptionQueue])
    } else {
      console.log(`Subscription request from ${from} already accepted`)
      this.aceptarSubscripcion(from)
    }
  }

  fetchSubscriptionRequests(onFetchSubscriptions) {
    onFetchSubscriptions([...this.subscriptionQueue])
  }

  sendPresenceProbe(jid) {
    const probe = $pres({ type: "probe", to: jid })
    this.connection.send(probe.tree())
  }

  salir() {
    this.connection.send($pres({ type: "unavailable" }))
    this.connection.disconnect()
  }

  setrosterRecibido(callback) {
    this.rosterRecibido = callback
  }

  setsubscripcionRecibida(callback) {
    this.subscripcionRecibida = callback
  }

  borrarCuenta(onSuccess) {
    this.connection.sendIQ($iq({ type: "set", to: this.domain }).c("query", { xmlns: "jabber:iq:register" }).c("remove"), (iq) => {onSuccess()}, (error) => {})
  }

  enviarSubscripcion(jid) {
    const presenceSubscribe = $pres({ to: jid, type: "subscribe" })
    this.connection.send(presenceSubscribe.tree())
    console.log(`Subscription request sent to ${jid}`)
  }

  aniadirContacto(contact) {
    const aniadirContactoIQ = $iq({ type: "set" }).c("query", { xmlns: "jabber:iq:roster" }).c("item", { jid: contact })
  
    this.connection.sendIQ(aniadirContactoIQ, (iq) => {
      console.log(`Contact ${contact} added successfully`, iq)
    }, (error) => {
      console.error(`Failed to add contact ${contact}`, error)
    })
  }

  aceptarSubscripcion(from) {
    console.log(`Accepting subscription request from ${from}`)
    const acceptPresence = $pres({ to: from, type: "subscribed" })
    this.connection.send(acceptPresence.tree())

    if (!(from in this.roster)) {
      this.enviarSubscripcion(from)
    }

    this.subscriptionQueue = this.subscriptionQueue.filter(jid => jid !== from)
    this.subscripcionRecibida([...this.subscriptionQueue])
  }

  rechazarSubscripcion(from) {
    const rejectPresence = $pres({ to: from, type: "unsubscribed" })
    this.connection.send(rejectPresence.tree())
    
    this.subscriptionQueue = this.subscriptionQueue.filter(jid => jid !== from)
    this.subscripcionRecibida([...this.subscriptionQueue])
  }
}
