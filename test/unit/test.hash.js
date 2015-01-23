/**
 * Author: Jeff Whelpley
 * Date: 7/14/14
 *
 * Testing hashing functions
 */
var name    = 'utils/hash';
var taste   = require('../pancakes.taste.js');
var hash    = taste.flapjack(name);

describe('UNIT ' + name, function () {
    describe('generateHash()', function () {
        it('should generate something', function (done) {
            var data = 'blah';
            var promise = hash.generateHash(data);
            taste.eventuallyFulfilled(promise, done);
        });
    });

    describe('compare()', function () {
        it('should be able to compare a hashed value', function (done) {
            var data = 'blah';
            hash.generateHash(data)
                .then(function (encryptedData) {
                    var promise = hash.compare(data, encryptedData);
                    taste.eventuallyEqual(promise, true, done);
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});