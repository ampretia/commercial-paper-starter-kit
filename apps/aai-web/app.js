'use strict';
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved.
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *   Dale Avery
 *******************************************************************************/
// For logging
let TAG = 'app.js:';


let express = require('express');
let session = require('express-session');
let compression = require('compression');
let serve_static = require('serve-static');
let path = require('path');
let morgan = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let http = require('http');

let setup = require('./setup');
let cors = require('cors');

let ws = require('ws');
let wss = {};
let part2 = require('./utils/ws_part2');


// Create the Express app that will process incoming requests to our web server.
console.log(TAG, 'Configuring Express app');
let app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.engine('.html', require('pug').__express);
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/** Create a static folder to serve up the CSS and JS for the demo.  These images shouldn't change very often, so we
  can set longer cache limits for them.
  @param {Object} res response
  @param {String} path path
  */
function setCustomCC(res, path) {
    // 30 days cache
    if (serve_static.mime.lookup(path) === 'image/jpeg') {res.setHeader('Cache-Control', 'public, max-age=2592000');}
    else if (serve_static.mime.lookup(path) === 'image/png') {res.setHeader('Cache-Control', 'public, max-age=2592000');}
    else if (serve_static.mime.lookup(path) === 'image/x-icon') {res.setHeader('Cache-Control', 'public, max-age=2592000');}
}
app.use(serve_static(path.join(__dirname, 'public'), {maxAge: '1d', setHeaders: setCustomCC})); // 1 day cache


// Use a session to track how many requests we receive from a client (See below)
app.use(session({secret: 'Somethignsomething1234!test', resave: true, saveUninitialized: true}));

// Enable CORS preflight across the board so browser will let the app make REST requests
app.options('*', cors());
app.use(cors());

// Attach useful things to the request
app.use(function (req, res, next) {
    console.log('----------------------------------------- incoming request -----------------------------------------');
    // Create a bag for passing information back to the client
    req.bag = {};
    req.session.count = req.session.count + 1;
    req.bag.session = req.session;
    next();
});

// This router will serve up our pages and API calls.
let router = require('./routes/site_router');
app.use('/', router);

// If the request is not process by this point, their are 2 possibilities:
// 1. We don't have a route for handling the request
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// 2. Something else went wrong
app.use(function (err, req, res, next) {// = development error handler, print stack trace
    console.log(TAG, 'Error Handler -', req.url);
    let errorCode = err.status || 500;
    res.status(errorCode);
    req.bag.error = {msg: err.stack, status: errorCode};
    if (req.bag.error.status === 404) {req.bag.error.msg = 'Sorry, I cannot locate that file';}
    res.render('template/error', {bag: req.bag});
});



// Start the web server using our express app to handle requests
let host = setup.SERVER.HOST;
let port = setup.SERVER.PORT;
console.log(TAG, 'Staring http server on: ' + host + ':' + port);
let server = http.createServer(app).listen(port, function () {
    console.log(TAG, 'Server Up - ' + host + ':' + port);
});

// Some setting that we've found make our life easier
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
server.timeout = 240000;

/**
 * Start the websocket server
 */
function start_websocket_server() {

    console.log('------------------------------------------ Websocket Up ------------------------------------------');

    wss = new ws.Server({server: server});
    wss.on('connection', async function connection(ws) {
        ws.on('message', async function incoming(message) {
            console.log('received ws msg:', message);
            let data = JSON.parse(message);
            await part2.process_msg(ws, data);

        });
        ws.on('close', function () {
        });
    });

    // This makes it easier to contact our clients
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            try {
                data.v = '2';
                client.send(JSON.stringify(data));
            }
            catch (e) {
                console.log('error broadcast ws', e);
            }
        });
    };

}

start_websocket_server();