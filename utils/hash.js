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
    function compare(data, encrypted) {
        var deferred = Q.defer();

        bcrypt.compare(data, encrypted, function (err, res) {
            err ? deferred.reject(err) : deferred.resolve(res);
        });

        return deferred.promise;
    }

    /**
     * Generate hash off some data
     * @param data
     */
    function generateHash(data) {
        var deferred = Q.defer();

        bcrypt.hash(data, 10, function (err, res) {
            err ? deferred.reject(err) : deferred.resolve(res);
        });

        return deferred.promise;
    }

    //TODO: potentially consolidate generateHash and md5Hash in the future

    /**
     * Used by actionItemService to create hash for action items
     * @param val
     * @returns {*}
     */
    function md5Hash(val) {
        var str = _.isObject(val) ? JSON.stringify(val) : val;
        var md5 = crypto.createHash('md5');
        md5.update(str);
        return md5.digest('hex');
    }

    // expose functions
    return {
        compare: compare,
        generateHash: generateHash,
        md5Hash: md5Hash
    };
};
