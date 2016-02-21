/**
 * Author: Jeff Whelpley
 * Date: 1/20/15
 *
 * Only used for testing purposes
 */
var _ = require('lodash');

module.exports = _.extend({
    translator: {
        apiKey: 'testonly'  //TODO: find good way to test w/o exposing api key
    }
}, require('./env'));