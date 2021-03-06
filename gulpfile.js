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

// grab our gulp packages
const gulp  = require('gulp');
const usage = require('gulp-help-doc');
const run = require('gulp-run-command').default;
const path= require('path');
const jsome = require('jsome');
const chalk = require('chalk');
const rp = require('request-promise');
const boxen = require('boxen');

const localScriptDir = path.join(__dirname,'.localtoolchain');

// local fabric start scripts
const card_sh = path.resolve(__dirname,'ledgers','hyperledger-fabric','createPeerAdminCard.sh');
const provisionFabric_sh = path.resolve(__dirname,'ledgers','hyperledger-fabric','startFabric.sh');

const contractdeploy_sh = path.resolve(localScriptDir,'contract-package-deploy.sh');
const bootstrap_sh = path.resolve('.','contracts','commercial-paper-network','bootstrap.sh');

const startindy_sh = path.resolve('.','services','identity','startIndy.sh');
const stopindy_sh = path.resolve('.','services','identity','stopIndy_sh');

const tradeapp_sh = path.resolve('.','apps','paper-trading-webui','start.sh');
const didmanager_sh = path.resolve('.','apps','did-manager','start.sh');

const getCloudCard_sh = path.resolve(__dirname,'.localtoolchain','getCloudCard.sh');

const args = require('yargs').argv;

gulp.task('gendid',()=>{
    let options= {method:'POST',uri:'http://localhost:8888/DID'};
    return rp(options);
});

gulp.task('default', function () {

});

const log = (str)=>{
    // eslint-disable-next-line no-console
    console.log(str);
};

/**
 * This simply defines help task which would produce usage
 * display for this gulpfile. Simple run `gulp help` to see how it works.
 * NOTE: this task will not appear in a usage output as far as it is not
 * marked with the @task tag.
 */
gulp.task('help' , function() {
    return usage(gulp);
});

/**
 * We may also link usage as default gulp task:
 */
gulp.task('default', ['help']);

/**
 * This simply defines help task which would produce usage
 * display for this gulpfile. Simple run `gulp help` to see how it works.
 * NOTE: this task will not appear in a usage output as far as it is not
 * marked with the @task tag.
 */
gulp.task('help' , function() {
    return usage(gulp);
});

/**
 * We may also link usage as default gulp task:
 */
gulp.task('default', ['help']);

/**
 * Starts a local docker-compose based Fabric based on the current set of tools.
 * This will stop and remove any currently running local Fabric configuration.
 *
 *
 * @task {fabric:provision}
 * @group {Operational}
 */
gulp.task('fabric:provision', ()=>{
    // note that this could be run to create a starter plan instance as well.
    let fn = run([provisionFabric_sh]);
    return fn();
});

/**
 * Creates the 'BLOCKCHAIN_NETWORK_CARD'
 *
 *
 * @task {fabric:card}
 * @arg {target} Whether the card should be created for the locally (default) running fabric or one defined in blockchain.json (--target=cloud)
 * @group {Operational}
 */
gulp.task('fabric:card', ()=>{
    let fn;
    // check what the target is for the deployment
    if (args.target === 'cloud'){
        // need to use the blockchain.json file (assuming in the cwd) to get the card
        console.log(chalk`{bold Using a IBP hosted HLF instance using blockchain.json}`);
        fn = run([getCloudCard_sh]);
    }else {
        console.log(chalk`{bold Assuming local docker-compose based HLF instance}`);
        fn = run([card_sh]);
    }
    return fn();
});

/**
 * Calls a standard bootstrap script in the contracts directory. This will bootstrap basic data
 * as required
 *
 *
 * @task {contract:bootstrap}
 * @group {Operational}
 */
gulp.task('contract:bootstrap', ()=>{
    if(!process.env.NODE_CONFIG){
        console.log('NODE_CONFIG appears to not be set');
    }else {
        let fn = run([bootstrap_sh]);
        return fn();
    }
} );

/**
 * This will deploy a network, starting or updating it if required. Also bumps the version number of the network
 *
 *
 * @task {contract:deploy}
 * @group {Operational}
 */
gulp.task('contract:deploy', ()=>{
    if(!process.env.NODE_CONFIG){
        console.log('NODE_CONFIG appears to not be set');
    }else {
        let fn = run([contractdeploy_sh]);
        return fn();
    }
} );

/**
 * Starts the Indy Identity Network running locally
 * and stands up a simple REST API for querying public DIDs
 *
 * @task {startindy}
 * @group {Operational}
 */
gulp.task('startindy', ()=>{
    let fn = run([startindy_sh]);
    return fn().then(()=>{
    	console.log('done...');
    });
} );

/**
 * Stops the Indy Identity Network locally
 *
 * @task {stopindy}
 * @group {Operational}
 */
gulp.task('stopindy', ()=>{
    let fn = run([stopindy_sh]);
    return fn().then(()=>{
    	console.log('done...');
    });
} );

/**
 * runs the DID Manager Web app to associated Composer Participants to PublicDIDs
 *
 * @task {didmanager}
 * @group {Operational}
 */
gulp.task('didmanager', ()=>{
    let fn = run([didmanager_sh]);
    return fn().then(()=>{
    	console.log('>> App running at http://localhost:6002/ ');
    });
} );

/*
 * Stars the Commercial Paper Trading application.
 *
 * @task {tradeapp}
 * @group {UI}
 */
gulp.task('app:trading', ()=>{
    let fn = run([tradeapp_sh]);
    return fn().then(()=>{
        console.log('>>  App running at http://localhost:3000/login ');
    });
} );

/**
 * Outputs the current envionment variables specifically used for Composer/Fabric
 *
 * @task {env}
 */
gulp.task('env', ()=>{
    log(chalk.blue.bold('Environment being used:'));

    let nodecfg = {composer:{
    }
    };
    if (process.env.NODE_CONFIG){
        nodecfg = JSON.parse(process.env.NODE_CONFIG);
    }

    console.log(chalk.green('\nComposer - Wallet configuration'));
    if (nodecfg.composer.wallet){
        jsome(nodecfg.composer.wallet);
    } else {
        console.log('None specified, will use default.');
    }


    console.log(chalk.green('\nComposer - Loggining configuration'));
    if (nodecfg.composer.log) {
        jsome(nodecfg.composer.log);
    } else {
        console.log('None specified, will use default.');
    }
    console.log('\n');
});


gulp.task('app:build',()=>{
    let fn = run(['npm run build --prefix ./apps/paper-trading-webui']);
    return fn().then(()=>{
    	console.log('>>  App running at http://localhost:3000/login ');
    });
});

gulp.task('welcome',['help'],()=>{
    // console.log(process.env);
    console.log(boxen(chalk.blue.bold('Welcome - Commerical Paper Trading'),{padding:1,margin:1}));
});

/**
 *
 *
 *
 */
gulp.task('cardstore:fs',()=>{

    let storePath = path.resolve(__dirname,'_localstore');
    let localstore=`{ "composer": { "wallet": { "type": "composer-wallet-filesystem", "options": { "storePath": "${storePath}" } } } }`;

    console.log(localstore);


});