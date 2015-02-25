/**
 * Author: Jeff Whelpley
 * Date: 2/20/15
 *
 * Simple wrapper around request with promises
 */
module.exports = function (Q, request) {

    /**
     * Make an http request
     * @param opts
     */
    return function makeRequest(opts) {
        var deferred = Q.defer();

        request(opts, function (err, resp, obj) {
            if (err) {
                deferred.reject(err);
            }
            else if (resp.statusCode !== 200) {
                deferred.reject(obj);
            }
            else {
                deferred.resolve(obj);
            }
        });

        return deferred.promise;
    };
};
