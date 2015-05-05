/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 2/18/14
 *
 * Listens for log events and propagates them appropriately
 */
var _       = require('lodash');
var raven   = require('raven');

require('colors');

var errorClient = null;

/**
 * Error handler
 * @param event
 * @param logData
 */
function errorHandler(event, logData) {
    if (!errorClient) { return; }

    var err = logData.err;
    delete logData.err;

    err ?
        errorClient.captureError(err) :
        _.isString(logData) ?
            errorClient.captureMessage(logData) :
            errorClient.captureMessage(logData.msg, { extra: logData });
}

/**
 * Add the event handlers to the event bus
 */
function init(opts) {
    var config = opts.config;
    var pancakes = opts.pancakes;
    var eventBus = pancakes.cook('eventBus');
    var handlers = ['log.critical'];
    var loggingConfig = config.logging || {};
    var level = loggingConfig.level || 'debug';
    var transport = loggingConfig.transport || ['console'];
    var colorMap = {
        debug: 'grey',
        info: 'green',
        error: 'red',
        critical: 'red'
    };
    var logRemote = transport.indexOf('remote') >= 0;

    errorClient = loggingConfig.errorServerUrl && logRemote ?
        new raven.Client(loggingConfig.errorServerUrl) : null;

    if (level === 'error') {
        handlers = handlers.concat(['log.error']);
    }
    else if (level === 'info') {
        handlers = handlers.concat(['log.error', 'log.info']);
    }
    else if (level === 'debug') {
        handlers = handlers.concat(['log.error', 'log.info', 'log.debug']);
    }

    /* jshint newcap:false */
    if (transport.indexOf('console') >= 0) {
        eventBus.addHandlers(handlers, function (logData) {
            var len = 10;
            var pad = ' ';
            var standardFields = ['msg', 'level', 'source', 'stack', 'inner'];
            var color = colorMap[logData.level] || 'grey';
            var msg = logData.msg && logData.msg[color];

            console.log('----');
            console.log('message:' + Array(len - 8).join(pad) + msg);
            console.log('level:' + Array(len - 6).join(pad) + logData.level);
            console.log('source:' + Array(len - 7).join(pad) + logData.source);

            _.each(logData, function (val, key) {
                if (standardFields.indexOf(key) < 0) {  // if not a standard field
                    console.log(key + ':' + Array(len - 1 - key.length).join(pad) + val);
                }
            });

            if (logData.stack) {
                console.log('stack:' + Array(len - 6).join(pad) + logData.stack);
            }

            if (logData.inner) {
                console.log('inner:' + Array(len - 6).join(pad) + logData.inner);
            }

            console.log('----');

        });
    }

    // if remote transport, then set up the logger to Logentries
    if (errorClient) {
        eventBus.on('log.error', errorHandler);
        eventBus.on('log.critical', errorHandler);
    }
}

// expose functions
module.exports =  {
    errorHandler: errorHandler,
    init: init
};