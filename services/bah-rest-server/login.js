'use strict';
const Composer = require('./composer');

const fs = require('fs');
const path = require('path');
const jsome = require('jsome');
/**
 *
 */
async function main(){

    let composer = new Composer();
    let data = {
        'username': 'alice',
        'password': 'al1ceRuleZ'
    };

    let result = await composer.request('POST', 'http://localhost:3000/auth/ldap', JSON.stringify(data));
    console.log(result.code);


    const options = {
        formData: {}
    };

    const fileContents = fs.readFileSync('bah.card');
    options.formData.card = {
        value: fileContents,
        options: {
            filename: path.basename('bah.card')
        }
    };

    result = await composer.request('POST', 'http://localhost:3000/api/wallet/import', null, options);
    console.log(result.code);


    result = await composer.request('GET', 'http://localhost:3000/api/PaperListing');
    console.log(jsome.getColoredString(JSON.parse(result.response)));
}


main().catch((er)=>{console.log(er);});