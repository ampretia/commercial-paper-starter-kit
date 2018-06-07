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


const fs = require('fs');
const path = require('path');
const winston = require('winston');
const Table = require('cli-table-redemption');
const chalk = require('chalk');
const boxen = require('boxen');
const ns = 'org.example.commercialpaper';
// Require the client API
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
let businessNetworkDefinition;

let serializer;

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
 * @param {String} cardName userCardName
 */
async function showMarket(userCardName){
    try {

        console.log(chalk.blue.bold('Commerical Paper Trading - Markets'));

        // let table = new Table();
        const businessNetworkConnection = new BusinessNetworkConnection();
        LOG.info('> Connecting business network connection');
        LOG.info(`> ${userCardName}`);
        businessNetworkDefinition = await businessNetworkConnection.connect(userCardName);
        serializer = businessNetworkDefinition.getSerializer();

        let companiesRegistry = await businessNetworkConnection.getRegistry(`${ns}.Company`);

        let paperRegistry = await businessNetworkConnection.getRegistry(`${ns}.CommercialPaper`);
        let marketRegistry = await businessNetworkConnection.getRegistry(`${ns}.Market`);

        let cs = await marketRegistry.getAll();
        for (const market of cs) {
            let listingsTable = new Table({head:['ID','Discount','Ticker','Par','Maturity','Issuer']});
            console.log(chalk`\n{bold Current listings in} {blue ${market.ID}}`);
            for (const paperListing of market.papersForSale) {
                let paper = await paperRegistry.get(paperListing.paper.getIdentifier());
                let issuer = await companiesRegistry.get(paper.issuer.getIdentifier());
                listingsTable.push([paperListing.ID, paperListing.discount,paper.ticker,paper.par,paper.maturity,issuer.name]);
            }
            console.log(listingsTable.length>0 ? listingsTable.toString() :'<none>');
        }

        await businessNetworkConnection.disconnect();
    } catch (error) {
        LOG.error(error);
        throw error;
    }

}

module.exports.submit = showMarket;
module.exports.questions= [];