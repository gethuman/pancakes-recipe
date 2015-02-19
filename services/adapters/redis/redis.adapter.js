/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/27/15
 *
 * Adapter will communicate with redis to store values. If redis
 * is not configured for whatever reason, however, this adapter will
 * fall back to an in-memory lru-cache
 */
var Q           = require('q');
var _           = require('lodash');
var lruCache    = require('lru-cache');
var redis       = require('redis');

// during init() we will set all the remote caches; local ones added ad hoc in set()
var caches = {};

/**
 * Create a simple wrapper so the remote cache and local cache
 * interfaces are the same
 *
 * @param remoteCache
 * @returns {{get: Function, set: *}}
 */
function wrapRemoteCache(remoteCache) {
    return {
        get: function (key) {
            var deferred = Q.defer();

            remoteCache.get(key, function (err, value) {
                if (err) { deferred.reject(err); }

                if (_.isString(value) && value.charAt(0) === '{') {
                    value = JSON.parse(value);
                }

                deferred.resolve(value);
            });

            return deferred.promise;
        },
        set: function (key, value) {
            value = _.isObject(value) ? JSON.stringify(value) : value;
            remoteCache.set(key, value);
        },
        quit: function () {
            remoteCache.quit();
        },
        flush: function () {
            remoteCache.flushdb();
        }
    };
}

/**
 * Create local cache with same interface as remote
 * @returns {{get: Function, set: *}}
 */
function createLocalCache() {
    var localCache = lruCache({ max: 100, maxAge: 60000 });
    return {
        get: function (key) {
            return new Q(localCache.get(key));
        },
        set: function (key, value) {
            localCache.set(key, value);
        }
    };
}

/**
 * Create a connection to redis and select the appropriate database
 * @param db
 * @param opts
 * @returns {*}
 */
function connectToRedis(db, opts) {

    // get the redis client
    var client = redis.createClient(opts.port, opts.host);

    // log any errors
    client.on('error', function (err) {
        console.log('redis error: ' + err);
    });

    // if there is a password, do auth
    var deferred = Q.defer();
    if (opts.password) {
        client.auth(opts.password, function (authErr) {
            if (authErr) {
                deferred.reject(authErr);
                return;
            }

            client.select(db, function (err) {
                err ? deferred.reject(err): deferred.resolve(client);
            });
        });
    }
    else {
        client.select(db, function (err) {
            err ? deferred.reject(err): deferred.resolve(client);
        });
    }

    return deferred.promise;
}

/**
 * During the initialization of a pancakes app, this will be called
 * and all the redis connections will be established.
 *
 * @param config
 * @returns {*}
 */
function init(config) {
    var promises = [];

    if (config.redis) {
        _.each(config.redis.dbs, function (idx, name) {
            promises.push(
                connectToRedis(idx, config.redis)
                    .then(function (remoteCache) {
                        caches[name] = wrapRemoteCache(remoteCache);
                        return true;
                    })
            );
        });
    }

    // initialization done once all connections established
    return Q.all(promises)
        .then(function () {
            return config;
        });
}

/**
 * Creating a new cache adapter.
 * @constructor
 */
function RedisAdapter(resource) {
    this.name = resource.name;
}

// add static functions to the class
_.extend(RedisAdapter, {
    wrapRemoteCache: wrapRemoteCache,
    connectToRedis: connectToRedis,
    init: init,
    webInit: init,
    caches: caches  // exposing for testing purposes
});

_.extend(RedisAdapter.prototype, {

    /**
     * Get a value from cache
     * @param req
     */
    get: function get(req) {
        var cache = caches[this.name];
        return cache ? cache.get(req.key) : new Q(null);
    },

    /**
     * Set a value in the cache
     * @param req
     */
    set: function set(req) {
        var cache = caches[this.name];
        if (!cache) {
            cache = caches[this.name] = createLocalCache();
        }

        cache.set(req.key, req.value);
    },

    /**
     * Remove all items from this cache
     */
    clear: function clear() {
        var cache = caches[this.name];
        if (cache && cache.flush) {
            cache.flush();
        }
    }

});

// return the class
module.exports = RedisAdapter;
