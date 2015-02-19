/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/27/15
 *
 *
 */
var name        = 'services/adapters/redis/redis.adapter';
var taste       = require('../../../../pancakes.taste.js')();
var _           = require('lodash');
var Adapter     = taste.target(name);
var cacheName   = 'test';
var adapter     = new Adapter({ name: cacheName });

describe('INTEGRATION ' + name, function () {

    after(function () {
        _.each(Adapter.caches, function (cache) {
            if (cache.quit) {
                cache.quit();
            }
        });
    });

    describe('local set()', function () {
        it('should set local value since remote does not exist yet', function () {
            var key = 'somekey';
            var value = 'somevalue';
            adapter.set({ key: key, value: value });
            taste.should.exist(Adapter.caches[cacheName]);
        });

        it('should set an object correctly', function () {
            var key = 'somekey';
            var value = { some: 'foo' };
            adapter.set({ key: key, value: value });
            taste.should.exist(Adapter.caches[cacheName]);
        });
    });

    describe('init()', function () {
        it('should successfully initialize two redis connections', function (done) {
            var redisConfig = taste.config.redis || {};

            var config = {
                redis: {
                    host:       redisConfig.host || 'localhost',
                    port:       redisConfig.port || 6379,
                    password:   redisConfig.password,
                    dbs: {
                        test:   14,
                        choo:   15
                    }
                }
            };

            Adapter.init(config)
                .then(function () {
                    Object.keys(Adapter.caches).length.should.equal(2);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('remote get()', function () {
        it('should get a remote value from redis', function (done) {
            var key = 'loo';
            var value = { moo: 'choo' };
            adapter.set({ key: key, value: value });
            adapter.get({ key: key })
                .then(function (actual) {
                    actual.should.deep.equal(value);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});