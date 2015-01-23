/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 9/30/14
 *
 * Do a map reduce
 */
module.exports = function (Q) {
    return function mapReduce(options) {
        var deferred = Q.defer();

        var model = options.model;
        delete options.model;

        options.verbose = false;

        model.mapReduce(options, function handleResults(err, results) {
            if (err) { deferred.reject(err); return; }

            options.oneResult && results && results.length === 1 ?
                deferred.resolve(results[0].value) :
                deferred.resolve(results);
        });

        return deferred.promise;
    };
};