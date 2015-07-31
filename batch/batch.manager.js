/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 8/18/13
 *
 * This is the entry point for all GetHuman batch programs.
 */
module.exports = function (fs, commander, moment, pancakes, mwServiceInit, log, casing) {

    /* eslint no-process-exit:0 */
    /* eslint no-process-env:0 */

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
                /* eslint no-console:0 */
                console.log(dirs[i]);
            }
        }
    }

    /**
     * Process the command line using commander
     */
    function processCommandLine() {
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
                log.info(commander.app + ' complete (' + diffTime + 's)');
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


