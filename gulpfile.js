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


const localScriptDir = path.join(__dirname,'.localtoolchain');
const cyclelocalfabric_sh = path.resolve(localScriptDir,'cycle-local-fabric.sh');
const startnetwork_sh = path.resolve(localScriptDir,'start-network.sh');
const upgradenetwork_sh = path.resolve(localScriptDir,'upgrade-network.sh');
const bootstrap_sh = path.resolve('.','contracts','commercial-paper-network','bootstrap.sh');

const startindy_sh = path.resolve('.','services','identity','startIndy.sh');
const stopindy_sh = path.resolve('.','services','identity','stopIndy_sh');

const tradeapp_sh = path.resolve('.','apps','aai-web','start.sh');
const didmanager_sh = path.resolve('.','apps','did-manager','start.sh');


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
 * @task {provision}
 */
gulp.task('provision', ()=>{
    let fn = run([cyclelocalfabric_sh]);
    return fn();
} );


/**
 * Does the initial installation and start of the business network
 *
 * Invoked directly post 'npm install' so no requirement to call it directly.
 * Can be used though to restart everything
 *
 * Call `gulp bootstrap` after this to create initial resources
 * @task {startnetwork}
 */
gulp.task('startnetwork',['provision'], ()=>{
    let fn = run([startnetwork_sh]);
    return fn().then(()=>{
    	console.log('Next thing to run is gulp bootstrap');
    });
} );

/**
 * Rebuilds and upgrades the deployed network
 *
 * @task {upgradenetwork}
 */
gulp.task('upgradenetwork', ()=>{
    let fn = run([upgradenetwork_sh]);
    return fn().then(()=>{
    	console.log('done...');
    });
} );

/**
 * Calls a standard bootstrap script in the contracts directory
 *
 * @task {bootstrap}
 */
gulp.task('bootstrap', ()=>{
    if(!process.env.NODE_CONFIG){
        console.log('NODE_CONFIG appears to not be set - it should be to use the local cardstore');
    }else {
        let fn = run([bootstrap_sh]);
        return fn();
    }
} );

/**
 * Starts the Indy Identity Network running locally
 * and stands up a simple REST API for querying public DIDs
 *
 * @task {startindy}
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
 */
gulp.task('didmanager', ()=>{
    let fn = run([didmanager_sh]);
    return fn().then(()=>{
    	console.log('>> App running at http://localhost:6002/ ');
    });
} );

/**
 * runs the Trade Application to trade Commercial Paper
 *
 * @task {tradeapp}
 */
gulp.task('tradeapp', ()=>{
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
