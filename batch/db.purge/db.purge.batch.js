/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 9/28/14
 *
 * Delete data from the archive database according to the purge
 * criteria in the resource definition
 */
module.exports = function (Q, log) {
//module.exports = function (Q, resources, mongo, config) {

    /**
     * Run the batch program
     */
    function run() {

        log.info('This is not yet implemented');

        //var target = options.target;
        //var promise;
        //
        //var archive = mongo.connectRaw(config.mongo.archive);
        //
        //if (target) {
        //    promise = purgeResource(resources[target], archive);
        //}
        //else {
        //    promise = Q.all(resources.map(function (resource) {
        //        return purgeResource(resource, archive);
        //    }));
        //}
        //
        //return promise.then(function () {
        //    archive.close();
        //});
    }

    /**
     * Purge one particular resource
     * @param resource
     * @param archive
     */
    function purgeResource(resource, archive) {
        if (!resource.purge) { return true; }

        var criteria = resource.purge();
        var deferred = Q.defer();

        archive.bind(resource.name);
        archive[resource.name].remove(criteria, function (err, results) {
            err ? deferred.reject(err) : deferred.resolve(results);
        });
        return deferred.promise;
    }

    // expose functions
    return {
        run: run,
        purgeResource: purgeResource
    };
};