/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 7/14/14
 *
 * Simple utility that wraps bcrypt to provide a promise-based interface
 */
module.exports = function (Q, bcrypt) {

    /**
     * Compare some data to an encrypted version
     * @param data
     * @param encrypted
     */
    var compare = function (data, encrypted) {
        var deferred = Q.defer();

        bcrypt.compare(data, encrypted, function (err, res) {
            err ? deferred.reject(err) : deferred.resolve(res);
        });

        return deferred.promise;
    };

    /**
     * Generate hash off some data
     * @param data
     */
    var generateHash = function (data) {
        var deferred = Q.defer();

        bcrypt.hash(data, 10, function (err, res) {
            err ? deferred.reject(err) : deferred.resolve(res);
        });

        return deferred.promise;
    };

    // expose functions
    return {
        compare: compare,
        generateHash: generateHash
    };
};
