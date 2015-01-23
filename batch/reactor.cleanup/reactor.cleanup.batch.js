/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/27/14
 *
 * In the services, there are reactors which process asychronous events. For most of
 * these, data is manipulated in some way. The idea behind this batch job is to act
 * as a safety net for all reactors such that if any reactor fails to process an event
 * during runtime, this batch will clean up the data as appropriate.
 *
 * Format:
 *      node reactor.batch -a cleanup -t {targetCollection} -s {sourceCollection} -x {reactor} -f {targetField}
 *
 * Examples:
 *      node batch -a reactor.cleanup -t post               // run all cleanup that targets the post collection
 *      node batch -a reactor.cleanup -s post               // run all cleanup for reactors from the post collection
 *      node batch -a reactor.cleanup -x vote               // run all the vote reactor cleanup operations
 *      node batch -a reactor.cleanup -t post -f answers    // specifically target the reactors for the post.answers field
 *
 * NOTE: A start date and run days can also be passed in with -r and -y command line params respectively
 */
module.exports = function (Q, _, pancakes, reactors, resources, log, chainPromises) {

    /**
     * Will either clean up a specific target or all reactors. The format is:
     *
     * @param options
     * @returns {Q}
     */
    function run(options) {

        // do any cleanup prep that is needed
        return cleanupPrep(options)
            .then(function () {

                log.info('cleanupPrep complete');

                // get the cleanup data based on the input options and process it
                var cleanupData = getCleanupData(options);
                return processCleanupData(cleanupData, options);
            });
    }

    /**
     * Loop through reactors and clean them up
     *
     * @param options
     * @returns {*}
     */
    function cleanupPrep(options) {
        var sourceResource = options.source;
        var targetResource = options.target;
        var targetReactor = options.reactor;
        var reactor;

        // if there is a target reactor, just use that cleanupPrep
        if (targetReactor) {
            reactor = reactors[targetReactor];
            if (reactor && reactor.cleanupPrep) {
                log.info('Running cleanupPrep for ' + targetReactor);
                return reactors[targetReactor].cleanupPrep();
            }
        }
        // else if source and target resources don't exist (i.e. we are doing everything) the try to call all
        else if (!sourceResource && !targetResource) {
            return Q.all(reactors.map(function (reactor) {
                log.info('Running cleanupPrep for ' + reactor);
                return reactor.cleanupPrep ? reactor.cleanupPrep() : true;
            }));
        }

        // else just return a resolved promise
        return new Q();
    }

    /**
     * Get the cleanup data based on the batch options
     * @param options
     */
    function getCleanupData(options) {
        var sourceResource = options.source;
        var targetResource = options.target === 'all' ? null : options.target;
        var targetReactor = options.reactor;
        var targetField = options.field;
        var cleanupData = [];

        // if source resource an option, we only use that, else we look at all resources
        var srcs = sourceResource === 'all' ? resources : [resources[sourceResource]];

        // loop through all resources
        _.each(srcs, function (resource) {

            // loop through all reactors in each resource
            _.each(resource.reactors, function (reactData) {

                // apply the options filters to determine if we are adding this resource and reactData
                if ((!targetReactor || reactData.type === targetReactor) &&
                    (!targetResource || reactData.target === targetResource ||
                        reactData.parent === targetResource || reactData.child === targetResource) &&
                    (!targetField || reactData.targetField === targetField)) {

                    cleanupData.push({ resource: resource, reactData: reactData });
                }
            });
        });

        return cleanupData;
    }

    /**
     * Loop through cleanup data (i.e. resources and reactData) and call cleanup
     * on the appropriate reactor for each one.
     *
     * @param cleanupData
     * @param options
     * @returns {*}
     */
    function processCleanupData(cleanupData, options) {
        var fns = [];

        cleanupData.forEach(function (item) {
            var reactData = item.reactData;
            var reactor = reactors[reactData.type + '.reactor'];
            var req = _.extend({ resourceName: item.resource.name, reactData: reactData }, options);

            fns.push(function () {
                log.info('Cleanup source=' + item.resource.name +
                    ' reactor=' + reactData.type +
                    ' target=' + (reactData.target || reactData.parent || reactData.child || ''));

                return reactor && reactor.cleanup ? reactor.cleanup(req) : new Q();
            });
        });

        return chainPromises(fns, {});
    }

    // expose functions
    return {
        run: run,
        cleanupPrep: cleanupPrep,
        getCleanupData: getCleanupData,
        processCleanupData: processCleanupData
    };
};