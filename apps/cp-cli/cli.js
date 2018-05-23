'use strict';
const cmd_re = /([a-zA-Z]+).*/i;
const card_re = /card\s([a-zA-Z0-1@]+)/i;

const company = require('./company');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'CP> '
});

/**
 *
 */
async function main(){

    rl.prompt();

    let cardName;


    rl.on('line', async (line) => {
        let trimedLine = line.trim();
        let cmd = line.trim().match(cmd_re)[1];
        console.log(`${cmd} ...  ${trimedLine}`);
        switch (cmd) {
        case 'card': {
            // simply get the card name that has been entered, and update prompt and store
            let input = trimedLine.match(card_re);
            console.log(input);
            if (!input || input.length === 0) {
                console.log('${input}  Syntax should be  card <cardname>');
            } else {
                cardName = input[1];
                rl.setPrompt(`CP [${cardName}] > `);
                console.log(`Using the card ${cardName}`);
            }

            break;
        }
        case 'company': {
            console.log(`Company listing for ${cardName}`);
            await company(cardName);
            break;
        }
        case 'market': {
            let market = 'US_BLUE_ONE';
            console.log(`Market listing for ${market}`);
            break;
        }
        case 'issue': {
            let market = 'US_BLUE_ONE';
            console.log(`Issuing paper ${market}`);
            break;
        }
        case 'trade': {
            let market = 'US_BLUE_ONE';
            console.log(`Trading paper ${market}`);
            break;
        }
        case 'redeem': {
            let market = 'US_BLUE_ONE';
            console.log(`Redeeming paper ${market}`);
            break;
        }
        default:
            console.log(`Say what? I might have heard '${line.trim()}'`);
            break;
        }
        rl.prompt();
    }).on('close', () => {
        console.log('Have a great day!');
        process.exit(0);
    });
}


main().catch((err)=>{ process.exit(1);});