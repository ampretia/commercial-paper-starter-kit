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
const cmd_re = /([a-zA-Z]+).*/i;
const card_re = /card\s([a-zA-Z0-1@]+)/i;

const company = require('./company');
const issue = require('./issuePaper');
const redeem = require('./redeemPaper');
const trade = require('./tradePaper');
const market = require('./market');
const chalk = require('chalk');
const boxen = require('boxen')

// setup read line and the default prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk`{bold CP>} `
});

// Promisify the question from readline
async function questionFn(qStr) {
    return new Promise((resolve, reject) => {
        rl.question(qStr, (answer) => {
            resolve(answer);
        });
    });
}


async function askQuestions(questions) {

    let result = {};
    // for each question in the array
    for (let q of questions) {
        let qStr = chalk`{green ?} {bold ${q.message}} `;
        result[q.name] = await questionFn(qStr);
    }

    return result;
}

const welcomeMsg=chalk`Use the {bold card <cardname>} command to pick a Composer Network Card to use. There is one card per ogranization.
Use the commands {bold 'issue' 'company' 'market' 'trace' 'redeem'} to interact with the commerical paper markets.
Each command asks questions to guide you. 

To finish 'quit' 'exit' or ctrl-d
`

/**
 *
 */
async function main() {

    console.log(boxen(chalk.blue.bold('Commerical Paper Trading'),{padding:1,margin:1}));
    console.log(welcomeMsg);
    rl.prompt();

    let cardName;

    rl.on('line', async (line) => {
        let trimedLine = line.trim();
        let cmd = line.trim().match(cmd_re);
        if (!cmd) {
            rl.prompt();
            return;
        }
        cmd = cmd[1];
        switch (cmd) {
            case 'card': {
                // simply get the card name that has been entered, and update prompt and store
                let input = trimedLine.match(card_re);
                if (!input || input.length === 0) {
                    console.log('${input} Syntax should be  card <cardname>');
                } else {
                    cardName = input[1];
                    rl.setPrompt(chalk`{bold CP [${cardName}] }> `);
                    console.log(`Using the card ${cardName}`);
                }

                break;
            }
            case 'company': {
                if (!cardName) {
                    console.log('Please use the card command to set the network card to use');
                } else {
                    console.log(`Company listing for ${cardName}`);
                    await company.submit(cardName);
                }
                break;
            }
            case 'market': {
                if (!cardName) {
                    console.log('Please use the card command to set the network card to use');
                } else {
                    let data = await askQuestions(market.questions);
                    await market.submit(cardName, data);
                }
                break;
            }
            case 'issue': {
                if (!cardName) {
                    console.log('Please use the card command to set the network card to use');
                } else {
                    let data = await askQuestions(issue.questions);
                    await issue.submit(cardName, data);
                }

                break;
            }
            case 'trade': {
                if (!cardName) {
                    console.log('Please use the card command to set the network card to use');
                } else {
                    let data = await askQuestions(trade.questions);
                    await trade.submit(cardName, data);
                }

                break;
            }
            case 'redeem': {
                if (!cardName) {
                    console.log('Please use the card command to set the network card to use');
                } else {
                    let data = await askQuestions(redeem.questions);
                    await issue.submit(redeem, data);
                }

                break;
            }
            case 'exit':
            case 'end':
            case 'q':
            case 'x':
            case 'quit': {
                rl.close();
                break;
            }
               
            default:
                console.log(`Say what? I might have heard '${line.trim()}'`);
                break;
        }
        console.log();
        rl.prompt();
    }).on('close', () => {
        console.log(chalk.bold('\nHave a great day!'));
        process.exit(0);
    });
}


main().catch((err) => {
    console.log(err); process.exit(1);
})