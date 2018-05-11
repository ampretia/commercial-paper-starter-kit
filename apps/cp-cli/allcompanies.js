'use strict';


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



const winston = require('winston');
const Table = require('cli-table-redemption');
const chalk = require('chalk');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const ns = 'org.example.commercialpaper';

winston.loggers.add('app', {
    console: {
        level: 'silly',
        colorize: true,
        label: 'ResourceLoading-App'
    }
});

const LOG = winston.loggers.get('app');

/**
 * Main Function
 * @param {String} userCardName userCardName
 */
async function showCompanies(userCardName){
    try {
        const businessNetworkConnection = new BusinessNetworkConnection();
        LOG.info('> Connecting business network connection');
        LOG.info(`> ${userCardName}`);
        await businessNetworkConnection.connect(userCardName);

        let companiesRegistry = await businessNetworkConnection.getRegistry(`${ns}.Company`);
        let companies = await companiesRegistry.getAll();


        let table = new Table();

        for (const company of companies){
            let did = chalk`{bold Public DID} ${company.publicdid.scheme}:${company.publicdid.method}:${company.publicdid.identifier}`;
            let data = [company.name,company.symbol,did];
            table.push(data);
        }

        console.log(chalk`\n{bold All companies:}`);
        console.log(table.length>0?table.toString():'<none>');

        await businessNetworkConnection.disconnect();
    } catch (error) {
        LOG.error(error);
        throw error;
    }

}

let cardname = process.env.CP_COMPANY;
if (!cardname){
    console.log('need CP_COMPANY set to something');
    process.exit(1);
}
showCompanies(cardname).catch((err)=>{ process.exit(1);});