'use strict';
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved.
 *
 * Handles the site routing and also handles the calls for user registration
 * and logging in.
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *   Dale Avery
 *******************************************************************************/
let express = require('express');
let router = express.Router();
let setup = require('../setup.js');

// Load our modules.
let userManager;
let chaincode_ops;

// Use tags to make logs easier to find
let TAG = 'router:';

// ============================================================================================================================
// Home
// ============================================================================================================================
router.get('/', isAuthenticated, function (req, res) {
    res.render('part2', {title: 'Commercial Paper Demo', bag: {setup: setup, e: process.error, session: req.session}});
});

router.get('/home', isAuthenticated, function (req, res) {
    res.redirect('/trade');
});
router.get('/create', isAuthenticated, function (req, res) {
    res.render('part2', {title: 'Commercial Paper Demo', bag: {setup: setup, e: process.error, session: req.session}});
});
router.get('/trade', isAuthenticated, function (req, res) {
    res.render('part2', {title: 'Commercial Paper Demo', bag: {setup: setup, e: process.error, session: req.session}});
});
router.get('/audit', isAuthenticated, function (req, res) {
    res.render('part2', {title: 'Commercial Paper Demo', bag: {setup: setup, e: process.error, session: req.session}});
});
router.get('/holding', isAuthenticated, function (req, res) {
    res.render('part2', {title: 'Commercial Paper Demo', bag: {setup: setup, e: process.error, session: req.session}});
});
router.get('/login', function (req, res) {
    res.render('login', {title: 'Enroll/Register', bag: {setup: setup, e: process.error, session: req.session}});
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});

router.post('/:page', function (req, res) {
    if (req.body.password) {
        login(req, res);
    } else {
        register(req, res);
    }
});

module.exports = router;

module.exports.setup_helpers = function(configured_chaincode_ops, user_manager) {
    if(!configured_chaincode_ops)
    {throw new Error('Router needs a chaincode helper in order to function');}
    chaincode_ops = configured_chaincode_ops;
    userManager = user_manager;
};

function isAuthenticated(req, res, next) {
    if (!req.session.username || req.session.username === '') {
        console.log(TAG, '! not logged in, redirecting to login');
        return res.redirect('/login');
    }

    console.log(TAG, 'user is logged in');
    next();
}

/**
 * Handles form posts for registering new users.
 * @param req The request containing the registration form data.
 * @param res The response.
 */
function register(req, res) {
    console.log('site_router.js register() - fired');
    req.session.reg_error_msg = 'Registration failed';
    req.session.error_msg = null;

    // Determine the user's role from the username, for now
    console.log(TAG, 'Validating username and assigning role for:', req.body.username);
    let role = 1;
    if (req.body.username.toLowerCase().indexOf('auditor') > -1) {
        role = 3;
    }

    userManager.registerUser(req.body.username, function (err, creds) {
        //console.log('! do i make it here?');
        if (err) {
            req.session.reg_error_msg = 'Failed to register user:' + err.message;
            req.session.registration = null;
            console.error(TAG, req.session.reg_error_msg);
        } else {
            console.log(TAG, 'Registered user:', JSON.stringify(creds));
            req.session.registration = 'Enroll ID: ' + creds.id + '  Secret: ' + creds.secret;
            req.session.reg_error_msg = null;
        }
        res.redirect('/login');
    });
}

/**
 * Handles form posts for enrollment requests.
 * @param req The request containing the enroll form data.
 * @param res The response.
 */
function login(req, res) {
    console.log('site_router.js login() - fired');
    req.session.error_msg = 'Invalid username or password';
    req.session.reg_error_msg = null;

    // Registering the user against a peer can serve as a login checker, for now
    console.log(TAG, 'attempting login for:', req.body.username);
    req.session.username = req.body.username;
    req.session.name = req.body.username;
    req.session.error_msg = null;
    req.session.role = 'user';
    res.redirect('/trade');

}