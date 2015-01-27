/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 9/28/14
 *
 * This job will move data from the primary mongo DB to the archive DB
 */
module.exports = function (Q, _, resources, mongo, config, log) {

    /**
     * Loop through all resources and process each one
     * @returns {*}
     */
    function run(options) {
        var target = options.target;
        var promises = [];

        // get the database connections
        var primary = mongo.connectRaw(config.mongo.url);
        var archive = mongo.connectRaw(config.mongo.archive);

        // if there is a target and it is not all
        if (target && target !== 'all') {
            if (!resources[target]) {
                throw new Error('There is no collection called ' + target);
            }

            promises.push(archiveResource(resources[target], primary, archive));
        }
        // else archive all resources
        else {
            _.each(resources, function (resource) {
                promises.push(archiveResource(resource, primary, archive));
            });
        }

        log.info('starting archive...');
        return Q.all(promises).then(function () {

            log.info('All archiving complete');

            primary.close();
            archive.close();
        });
    }

    /**
     * Archive a particular resource
     * @param resource
     * @param primary
     * @param archive
     */
    function archiveResource(resource, primary, archive) {
        if (!resource.archive) { return true; }

        var name = resource.name;

        primary.bind(name);
        archive.bind(name);

        // get the archive criteria
        var criteria = resource.archive();

        log.info('Getting archive docs for ' + name);

        // find all the documents that match the archive criteria
        return getDocsToArchive(criteria, primary[name])
            .then(function (docs) {

                log.info('Found ' + docs.length + ' ' + name + ' docs to archive');

                // insert all of the documents into the archive database
                var deferred = Q.defer();
                archive[name].insert(docs, function (err, results) {
                    err ? deferred.reject(err) : deferred.resolve(results);
                });
                return deferred.promise;
            })
            .then(function () {

                log.info('Docs inserted into archive DB for ' + name + '. Now deleting docs in main db');

                // delete the data from the primary database
                var deferred = Q.defer();
                primary[name].remove(criteria, function (err, results) {

                    log.info('Deleting docs complete for ' + name);

                    err ? deferred.reject(err) : deferred.resolve(results);
                });
                return deferred.promise;

            });
    }

    /**
     * Get the documents to archive
     * @param criteria
     * @param primaryCollection
     */
    function getDocsToArchive(criteria, primaryCollection) {
        var deferred = Q.defer();

        primaryCollection.find(criteria).toArray(function (err, items) {
            err ? deferred.reject(err) : deferred.resolve(items);
        });

        return deferred.promise;
    }

    // expose functions
    return {
        run: run,
        archiveResource: archiveResource
    };
};