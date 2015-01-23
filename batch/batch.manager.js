/**
 * Copyright 2013 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 8/18/13
 *
 * This is the entry point for all GetHuman batch programs.
 */
module.exports = function (fs, commander, moment, pancakes, logReactor, log, mongo, config) {

    /**
     * List out all apps available
     */
    var listApps = function () {
        var dirs = fs.readdirSync(__dirname);
        dirs.sort();
        for (var i = 0; i < dirs.length; i++) {
            if (dirs[i] !== 'batch.manager.js') {
                console.log(dirs[i]);
            }
        }
    };

    /**
     * Initialize the command line values using the commander lib
     */
    var processCommandLine = function () {
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
    };

    /**
     * Run a particular batch program
     */
    var run = function () {
        logReactor.init();      // enable console logging
        processCommandLine();   // initialize the commander program values

        var startTime = (new Date()).getTime();

        try {
            var app = pancakes.cook('batch/' + commander.app + '/' + commander.app + '.batch');
            mongo.connect(config.mongo.url, commander.debug)
                .then(function () {
                    return app.run(commander);
                })
                .then(function () {
                    var endTime = (new Date()).getTime();
                    var diffTime = (endTime - startTime) / 1000;
                    log.info(commander.app + ' complete for ' + config.env + ' (' + diffTime + 's)');
                    process.exit(0);
                })
                .catch(function (err) {
                    log.error(err);
                    process.exit(1);
                });
        }
        catch (ex) {
            log.error(ex);
            process.exit(1);
        }
    };

    // expose function for testing purposes
    return {
        listApps: listApps,
        processCommandLine: processCommandLine,
        run: run
    };
};


