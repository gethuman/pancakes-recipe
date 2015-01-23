/**
 * Author: Jeff Whelpley
 * Date: 2/13/14
 *
 * Testing the API error decoder
 */
var name        = 'utils/error.decoder';
var taste       = require('../pancakes.taste.js');
var apiErrors   = taste.flapjack(name);
var _           = require('lodash');

describe('UNIT ' + name, function () {
    it('should all the errors have a code and message', function () {
        _.each(apiErrors, function (apiError) {
            taste.should.exist(apiError);
            taste.should.exist(apiError.httpErrorCode);
            taste.should.exist(apiError.friendlyMessage);
        });
    });
});