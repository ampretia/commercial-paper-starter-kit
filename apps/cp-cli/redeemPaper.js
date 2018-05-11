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

/**
 *
 */
async function getInput(){


    let questions = [
        {
            name: 'accountId',
            type: 'input',
            message: 'Enter ID of the account this paper is held in'
        },
        {
            name: 'paperId',
            type: 'input',
            message: 'Enter "ID" name of the paper to redeem'
        }

    ];
    let answers = await inquirer.prompt(questions);
    return answers;

}

/**
 * Main Function
 * @param {String} cardName userCardName
 */
async function submitTx(userCardName){
    try {

        // let table = new Table();
        const businessNetworkConnection = new BusinessNetworkConnection();
        LOG.info('> Connecting business network connection',userCardName);
        businessNetworkDefinition = await businessNetworkConnection.connect(userCardName);
        serializer = businessNetworkDefinition.getSerializer();


        console.log(boxen(chalk.blue.bold('Commerical Paper Trading - Paper Redeem'),{padding:1,margin:1}));
        let answers = await getInput();
        let factory = businessNetworkDefinition.getFactory();

        let accountRegistry = await businessNetworkConnection.getRegistry(`${ns}.Account`);
        let paperOwnershipRegistry = await businessNetworkConnection.getRegistry(`${ns}.PaperOwnership`);

        let account = await accountRegistry.get(answers.accountId);
        // console.log(account.assets);
        let paperOwnership = account.assets.filter(async (e)=>{

            let ownerhsip = await paperOwnershipRegistry.get(e.getIdentifier());
            return ownerhsip.paper.getIdentifier() === answers.paperId;
        });

        console.log(paperOwnership);
        let redeemTx = factory.newTransaction(ns,'RedeemPaper');
        redeemTx.maturedPaper = paperOwnership[0];//factory.newRelationship(ns,'PaperOwnership',paperOwnership.getIdentifier());


        console.log('Submitting transaction for paper redemption');
        await businessNetworkConnection.submitTransaction(redeemTx);

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





submitTx(cardname).catch((err)=>{console.log(err); process.exit(1);});