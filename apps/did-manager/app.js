#!/usr/bin/env node

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');

const api = require('./api');

const app = express();
const server = http.createServer(app);

const dist = path.join(__dirname, 'dist/did-manager');
if (!fs.existsSync(dist)) {
    console.error('no dist directory - try running "npm run build" first');
    process.exit(1);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(dist));
app.use('/api', api);

app.get('*', (req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
});

server.listen(6002, function () {
    console.log('server starting on 6002');
});