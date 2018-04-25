

'use strict';

// grab our gulp packages
let gulp  = require('gulp');
let usage = require('gulp-help-doc');
let run = require('gulp-run-command').default;
const path= require('path');
const localScriptDir = path.join(__dirname,'.localtoolchain');
const startFabric_sh = path.resolve(localScriptDir,'startFabric.sh');
const createPeerAdminCard = path.resolve(localScriptDir,'createPeerAdminCard.sh');
const wget = require('node-wget-promise');
const jsome = require('jsome');
var gunzip = require('gulp-gunzip')
var untar = require('gulp-untar')
const chalk = require('chalk')
var mkdirp = require('mkdirp');
 
gulp.task('default', function () {

});

const log = (str)=>{
    console.log(str);
}

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
 * Post install task to get the latest tools for a local fabric dev server
 * 
 * @task {postinstall}
 */
gulp.task('postinstall',async () => {

    mkdirp.sync(localScriptDir)
   
    let src = 'https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz';
    let options = {
       output: path.resolve(localScriptDir,'fabric-dev-servers.tar.gz')
    };
    let metadata = await wget(src, options)

    return gulp.src(options.output)
    .pipe(gunzip())
    .pipe(untar())
    .pipe(gulp.dest(localScriptDir))
});


gulp.task('default', function () {

})



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
 * Post install task to get the latest tools for a local fabric dev server
 * 
 * @task {postinstall}
 */
gulp.task('postinstall',async () => {

    mkdirp.sync(localScriptDir)
   
    let src = 'https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz';
    let options = {
       output: path.resolve(localScriptDir,'fabric-dev-servers.tar.gz')
    };
    let metadata = await wget(src, options)

    return gulp.src(options.output)
    .pipe(gunzip())
    .pipe(untar())
    .pipe(gulp.dest(localScriptDir))
});

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
	console.log(startFabric_sh);
  let fn = run([startFabric_sh,createPeerAdminCard]);
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
    }
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
    console.log('\n')
});
