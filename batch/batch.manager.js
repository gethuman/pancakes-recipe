/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 8/18/13
 *
 * This is the entry point for all GetHuman batch programs.
 */
module.exports = function (fs, commander, moment, pancakes, mwServiceInit, log, casing) {

    /**
     * List out all apps available
     */
    function listApps() {

        // combine directories from pancakes-recipe with dirs from source project
        var dirs = [].concat(fs.readdirSync(__dirname), fs.readdirSync(process.cwd() + '/batch'));

        // list them out in sorted order
        dirs.sort();
        for (var i = 0; i < dirs.length; i++) {
            if (dirs[i] !== 'batch.manager.js') {
                console.log(dirs[i]);
            }
        }
    }

    /**
     * Process the command line using commander
     */
    function processCommandLine() {
        commander
            .version('0.0.3')
            .option('-a, --app [appName]', 'Name of app to run (required)')
            .option('-b, --debug', 'Use [dev] environment')
            .option('-d, --delete', 'Delete data before processing job (data.load only)')
            .option('-e, --environment [dev|ci|prod]', 'Use [dev] environment', 'dev')
            .option('-l, --list', 'List available apps')
            .option('-r, --runDate [MM/DD/YYYY]', 'Run date (only rollup apps, default now)')
            .option('-y, --runDays [days]', 'Number of days in run (only rollup apps, default 1)', 1)
            .option('-s, --source [source]', 'Source of data for this batch job', 'all')
            .option('-t, --target [name]', 'Target for batch job', 'all')
            .option('-f, --field [field]', 'Fields to be used for this batch')
            .option('-x, --reactor [reactor]', 'The reactor to use for the batch (reactor.cleanup only)')
            .parse(process.argv);
        process.env.NODE_ENV = commander.environment;

        if (commander.list) {
            listApps();
            process.exit(0);
        }

        if (!commander.app) {
            commander.help();
        }

        commander.endDate = commander.runDate ? moment(commander.runDate, 'MM/DD/YYYY').toDate() : new Date();
        commander.startDate = moment(commander.endDate).subtract(commander.runDays, 'days').toDate();
        commander.startDate.setHours(0, 0, 0, 0);
    }

    /**
     * Run a particular batch program
     */
    function run() {
        var startTime = (new Date()).getTime();

        // parse the command line using the commander object
        processCommandLine();

        // leverage the middleware to initialize all our services, adapters, etc. (i.e. connect to mongo, etc.)
        mwServiceInit.init({ container: 'batch' })
            .then(function () {
                var app = pancakes.cook(casing.camelCase(commander.app) + 'Batch');
                return app.run(commander);
            })
            .then(function () {
                var endTime = (new Date()).getTime();
                var diffTime = (endTime - startTime) / 1000;
                log.info(commander.app + ' complete for ' + process.env.NODE_ENV + ' (' + diffTime + 's)');
                process.exit(0);
            })
            .catch(function (err) {
                log.error(err);
                process.exit(1);
            });
    }

    // expose function for testing purposes
    return {
        listApps: listApps,
        processCommandLine: processCommandLine,
        run: run
    };
};


