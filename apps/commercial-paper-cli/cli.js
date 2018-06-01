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

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk`{bold CP>} `
});

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

/**
 *
 */
async function main() {

    console.log(boxen(chalk.blue.bold('Commerical Paper Trading'),{padding:1,margin:1}));

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
                    await company(cardName);
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