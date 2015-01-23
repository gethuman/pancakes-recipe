/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 10/6/14
 *
 * This utility is used to split up one very large job into managable chunks that
 * can easily be handled in memory.
 */
module.exports = function (Q, _) {

    /**
     * Split up one service find call into multiple along with subsequent changes
     * and return back one promise;
     */
    return function chunk(req) {
        var skip = req.skip || 0;
        var limit = req.chunkSize || 1000;
        var criteria = req.criteria || {};
        var findReq = { where: criteria, skip: skip, limit: limit };
        var shouldRecurse = false;
        var initialResults;

        if (req.select) {
            findReq.select = req.select;
        }

        if (req.sort) {
            findReq.sort = req.sort;
        }

        return req.service.find(findReq)
            .then(function (items) {
                if (!items || !items.length) { return null; }
                shouldRecurse = items.length === limit;
                return req.then(items);
            })
            .then(function (results) {
                initialResults = results;
                return results && shouldRecurse ?
                    chunk(_.extend({}, req, { skip: skip + limit })) :
                    null;
            })
            .then(function (recurseResults) {
                if (!initialResults) {
                    return recurseResults;
                }
                else if (!recurseResults) {
                    return initialResults;
                }
                else if (_.isArray(initialResults) && !_.isArray(recurseResults)) {
                    initialResults.push(recurseResults);
                    return initialResults;
                }
                else if (!_.isArray(initialResults) && _.isArray(recurseResults)) {
                    recurseResults.push(initialResults);
                    return recurseResults;
                }
                else if (_.isArray(initialResults) && _.isArray(recurseResults)) {
                    initialResults.concat(recurseResults);
                    return initialResults;
                }
                else {
                    return [initialResults, recurseResults];
                }
            });
    };
};
