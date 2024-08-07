// API to handle the request from frontend

// Exports
const express = require('express');
const cors = require('cors');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var authRoutes = require('./routes/auth');
var handleContactsRoutes = require('./routes/handleContacts');
// Create server
const app = express();

// Security options
let corsOptions = {
    origin : 'http://localhost:3030',
}
app.use(cors(corsOptions))
const port = process.env.PORT || 6363;

app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.listen(port, ()=>
    console.log("App listening on port "+port)
    );
app.use(authRoutes);
app.use(handleContactsRoutes);
module.exports = app;