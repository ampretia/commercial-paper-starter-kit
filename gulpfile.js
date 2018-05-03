

'use strict';

// grab our gulp packages
let gulp  = require('gulp');
let usage = require('gulp-help-doc');
let run = require('gulp-run-command').default;
const path= require('path');
const localScriptDir = path.join(__dirname,'.localtoolchain');
const cyclelocalfabric_sh = path.resolve(localScriptDir,'cycle-local-fabric.sh');

const jsome = require('jsome');

const chalk = require('chalk');


gulp.task('default', function () {

});

const log = (str)=>{
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
 * Invoked directly post 'npm install' so no requirement to call it directly.
 * Can be used though to refresh and loaded specific versions.
 *
 * @task {provision}
 */
gulp.task('provision', ()=>{
    let fn = run([cyclelocalfabric_sh]);
    return fn();
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
        console.log('None specified, will use default of <coming soon>');
    }


    console.log(chalk.green('\nComposer - Loggining configuration'));
    if (nodecfg.composer.log) {
        jsome(nodecfg.composer.log);
    } else {
        console.log('None specified, will use default of <coming soon>');
    }
    console.log('\n');
});
