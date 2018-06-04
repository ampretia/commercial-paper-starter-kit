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
const boxen = require('boxen');
const chalk = require('chalk');
const inquirer = require('inquirer');
const uuidv1 = require('uuid/v1');
const AdminConnection = require('composer-admin').AdminConnection;
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


const questions = [

    {
        name: 'marketId',
        type: 'input',
        message: 'Enter ID of the Market to issue this paper into'
    },
    {
        name: 'ticker',
        type: 'input',
        message: 'Enter "ticker" name of the paper to issue'
    },
    {
        name: 'maturity',
        type: 'input',
        message: 'Enter maturity time of this paper (in days)'
    },
    {
        name: 'par',
        type: 'input',
        message: 'Enter par value of this paper '
    },
    {
        name: 'numberToCreate',
        type: 'input',
        message: 'Enter number of copies of this paper to issue'
    },

];

/**
 * Main Function
 * @param {String} cardName userCardName
 */
async function submitTx(userCardName,answers){
    try {

        // first find out who I am
        const adminConnection = new AdminConnection();
        await adminConnection.connect(userCardName);
        let metaData = await adminConnection.ping();
        let participantId = metaData.participant.substr(metaData.participant.indexOf('#')+1);
        await adminConnection.disconnect();

        // let table = new Table();
        const businessNetworkConnection = new BusinessNetworkConnection();
        LOG.info('> Connecting business network connection',userCardName);
        businessNetworkDefinition = await businessNetworkConnection.connect(userCardName);
        serializer = businessNetworkDefinition.getSerializer();

        console.log(chalk.blue.bold('Commerical Paper Trading - Paper Issuing'));

        if (!answers){
            answers = await inquirer.prompt(questions);
        }
        let factory = businessNetworkDefinition.getFactory();


        let createTx = factory.newTransaction(ns,'CreatePaper');
        createTx.ticker = answers.ticker;
        createTx.numberToCreate = parseInt(answers.numberToCreate);
        createTx.maturity = parseInt(answers.maturity);
        createTx.par = parseInt(answers.par);

        createTx.CUSIP = uuidv1();

        LOG.info('> Submitting transaction for new paper');
        await businessNetworkConnection.submitTransaction(createTx);

        let listTx = factory.newTransaction(ns,'ListOnMarket');
        listTx.discount = 3.5;
        listTx.market = factory.newRelationship(ns,'Market',answers.marketId);
        listTx.papersToList = [];
        // need to create the references for the papers created
        for (let i=0; i<answers.numberToCreate;i++){
            listTx.papersToList.push(factory.newRelationship(ns,'PaperOwnership',`${participantId}#${createTx.CUSIP}#${i}`));
        }

        LOG.info('> Listing on market');
        await businessNetworkConnection.submitTransaction(listTx);
        LOG.info(chalk`> Run   {bold CP_COMPANY=${userCardName} node market} to see the listed paper`);
        await businessNetworkConnection.disconnect();
    } catch (error) {
        LOG.error(error);
        throw error;
    }

}

module.exports.submit = submitTx;
module.exports.questions = questions;