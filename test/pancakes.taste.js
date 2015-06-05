/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 1/20/15
 *
 * This is a wrapper for all libs needed for testing
 */
var _       = require('lodash');
var mongo   = require('pancakes-mongo');
var path    = require('path');
var delim   = path.normalize('/');
var adminId = mongo.newObjectId(null);
var pancakesTaste;

// test code in client project would reference this by doing:
// var taste = require('pancakes-recipe').taste(require);
module.exports = function (loadModule) {
    loadModule = loadModule || require;

    // we are doing a singleton, so if already exists, just return it
    if (pancakesTaste) {
        return pancakesTaste;
    }

    // load pancakes from the client project
    var configDir = process.cwd() + delim + 'config';
    var pancakes = loadModule('pancakes');
    var pancakesConfig = loadModule(configDir + delim + 'pancakes.config');
    pancakesConfig.prod = false;
    pancakesConfig.debug = false;
    pancakes.init(pancakesConfig);

    // make sure errors printed to console since we aren't using the log reactor
    var config = loadModule(configDir);
    config.logging = config.logging || {};
    config.logging.level = 'error';
    var eventBus = pancakes.cook('eventBus', null);
    eventBus.on('log.error', function (logData) {
        _.isObject(logData) ? console.log(JSON.stringify(logData)) : console.log(logData);
    });

    // extend taste from the calling project
    var taste = loadModule('taste');
    pancakesTaste = _.extend({}, taste, {

        init: function init() {
            pancakes.init(pancakesConfig);
        },

        initContainer: function initContainer(container) {
            pancakes.initContainer(container);
        },

        flapjack: function flapjack(modulePath) {
            return pancakes.cook(modulePath, { test: true });
        },

        inject: function inject(uninjectedModule, dependencies) {
            return pancakes.cook(uninjectedModule, {
                dependencies:   dependencies,
                test:           true
            });
        },

        clearCache: function clearCache(done) {
            pancakes.clearCache();
            done();
        },

        caller: {
            admin: {
                _id:    adminId,
                name:   'TestUser',
                role:   'admin',
                type:   'user'
            }
        },

        newObjectId: mongo.newObjectId,
        config: config,
        getService: pancakes.getService,
        bus: eventBus
    });

    return pancakesTaste;
};
