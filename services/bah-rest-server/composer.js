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

const request = require('request-promise-any');
let jar = request.jar();

/**
 * A class that handles all of the interactions with a business network for
 * a currently executing Cucumber scenario and steps.
 */
class Composer {

    /**
     * Clear the cookie jar.
     */
    static clearCookieJar() {
        jar = request.jar();
    }

    /**
     * Do an HTTP request to REST server
     * @param {String} method - HTTP method
     * @param {String} path - path
     * @param {*} data - request body
     * @param {Object} [inputOptions] - options for request
     * @return {Promise} - Promise that will be resolved or rejected with an error
     */
    async request(method, path, data, inputOptions = {}) {
        const options = Object.assign({}, {
            method,
            uri: `${path}`,
            resolveWithFullResponse: true,
            simple: false,
            followAllRedirects: true,
            jar
        });
        if (data) {
            options.body = data;
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            };
        }
        const finalOptions = Object.assign({}, options, inputOptions);
        const response = await request(finalOptions);
        this.lastResp = { code: response.statusCode, response: response.body || response.error };
        return this.lastResp;
    }

    /**
     * Check the HTTP response status
     * @param {Number} code expected HTTP response code.
     * @return {Promise} - Promise that will be resolved or rejected with an error
     */
    checkResponseCode(code) {
        return new Promise( (resolve, reject) => {
            if (!this.lastResp) {
                reject('a response was expected, but no response messages have been generated');
            } else if (this.lastResp.code.toString() === code.toString()) {
                resolve();
            } else {
                reject('received HTTP status: ' + this.lastResp.code + ', ' + this.lastResp.error);
            }
        });
    }

}

module.exports = Composer;
