/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/20/15
 *
 * This is a wrapper for all libs needed for testing
 */
var _               = require('lodash');
var taste           = require('taste');
var pancakes        = require('pancakes');
var path            = require('path');

// configure pancakes for use with the unit tests
pancakes.init({
    debug:      false,
    preload:    ['utils', 'middleware'],
    rootDir:    path.join(__dirname, '/..'),
    require:    require
});

// extend taste
var commonTaste = _.extend({}, taste, {
    flapjack: function flapjack(modulePath) {
        return pancakes.cook(modulePath, { test: true });
    },
    inject: function inject(uninjectedModule, dependencies) {
        return pancakes.cook(uninjectedModule, { dependencies: dependencies, test: true });
    }
});

module.exports = commonTaste;


