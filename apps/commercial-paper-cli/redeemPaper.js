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
const boxen = require('boxen');
const chalk = require('chalk');
const Table = require('cli-table-redemption');
const inquirer = require('inquirer');
const uuidv1 = require('uuid/v1');

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
        name: 'paperId',
        type: 'input',
        message: 'Enter "ID" name of the paper to redeem'
    }

];


/**
 * Main Function
 * @param {String} cardName userCardName
 */
async function submitTx(userCardName,answers){
    try {

        // let table = new Table();
        const businessNetworkConnection = new BusinessNetworkConnection();
        LOG.info('> Connecting business network connection',userCardName);
        businessNetworkDefinition = await businessNetworkConnection.connect(userCardName);
        serializer = businessNetworkDefinition.getSerializer();


        console.log(chalk.blue.bold('Commerical Paper Trading - Paper Redeem'));
        if (!answers){
            answers = await inquirer.prompt(questions);
        }
        let factory = businessNetworkDefinition.getFactory();

        let redeemTx = factory.newTransaction(ns,'RedeemPaper');
        redeemTx.maturedPaper = factory.newRelationship(ns,'CommercialPaper',answers.paperId);

        console.log('Submitting transaction for paper redemption');
        await businessNetworkConnection.submitTransaction(redeemTx);

        await businessNetworkConnection.disconnect();
    } catch (error) {
        LOG.error(error);
        throw error;
    }

}

module.exports.submit = submitTx;
module.exports.questions = questions;
