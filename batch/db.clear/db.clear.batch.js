/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/27/14
 *
 * This is used to literally purge a database and remove everything. Use with care!
 */
module.exports = function (Q, _, resources, pancakes, prompt, config, log) {

    /**
     * Run the job
     * @returns {Q}
     */
    function run() {
        return confirmClear()
            .then(function (confirm) {
                return confirm ? clearDatabase() : true;
            })
            .then(function () {
                return true;
            });
    }

    /**
     * Purge everything in the database
     */
    function clearDatabase() {
        var promises = [];

        _.each(resources, function (resource) {
            var service = pancakes.getService(resource.name);
            if (service.removePermanently) {
                log.info('purging ' + resource.name);
                promises.push(service.removePermanently({ where: {}, multi: true }));
            }
        });

        return Q.all(promises);
    }

    /**
     * Confirm with the user that they definitately want to purge
     * @returns {*}
     */
    function confirmClear() {
        var promptSchema = {
            properties: {
                confirm: {
                    description: 'Delete everything in the ' + config.env.toUpperCase() + ' database? (y or n) ',
                    pattern: /^[yn]$/,
                    message: 'Please respond with y or n. ',
                    required: true
                }
            }
        };

        // for safety reasons, we can't use this in production
        if (config.env === 'production') {
            return Q.reject('purging is NOT available for prod.');
        }

        // prompt the user to confirm they are deleting everything in the database
        var deferred = Q.defer();
        prompt.start();
        prompt.get(promptSchema, function (err, result) {
            if (err) {
                deferred.reject(err);
            }
            else if (result.confirm !== 'y') {
                log.info('purge cancelled');
                deferred.resolve(false);
            }
            // else user confirmed deletion so do it
            else {
                deferred.resolve(true);
            }
        });

        return deferred.promise;
    }

    // expose functions for testing
    return {
        run: run,
        clearDatabase: clearDatabase,
        confirmClear: confirmClear
    };
};