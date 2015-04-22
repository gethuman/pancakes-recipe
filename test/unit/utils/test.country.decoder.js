/**
 * Author: Jeff Whelpley
 * Date: 2/13/14
 *
 * Unit test the country decoder
 */
var name    = 'utils/country.decoder';
var taste   = require('../../pancakes.taste.js')();
var decoder = taste.flapjack(name);
var _           = require('lodash');

describe('UNIT ' + name, function () {
    it('should make sure the two objects match up', function () {
        _.each(decoder.codeToName, function (val, key) {
            decoder.nameToCode[val].should.equal(key);
        });
    });
});