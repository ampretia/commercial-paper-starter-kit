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
        LOG.info('> Deployed network - now Connecting business network connection');
        businessNetworkDefinition = await businessNetworkConnection.connect(userCardName);
        serializer = businessNetworkDefinition.getSerializer();


        let answers = await getInput();
        let factory = businessNetworkDefinition.getFactory();


        let createTx = factory.newTransaction(ns,'CreatePaper');
        createTx.ticker = answers.ticker;
        createTx.qty = parseInt(answers.numberToCreate);
        createTx.numberToCreate = parseInt(answers.numberToCreate);
        createTx.maturity = parseInt(answers.maturity);
        createTx.par = parseInt(answers.par);

        createTx.CUSIP = uuidv1();

        console.log('Submitting transaction for new paper');
        await businessNetworkConnection.submitTransaction(createTx);

        let listTx = factory.newTransaction(ns,'ListOnMarket');
        listTx.qty = parseInt(answers.numberToCreate);
        listTx.discount = 3.5;
        listTx.market = factory.newRelationship(ns,'Market',answers.marketId);
        listTx.papersToList = [];
        // need to create the references for the papers created
        for (let i=0; i<answers.numberToCreate;i++){
            listTx.papersToList.push(factory.newRelationship(ns,'CommercialPaper',`${createTx.CUSIP}#${i}`));
        }

        console.log('Listing on market');
        await businessNetworkConnection.submitTransaction(listTx);

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