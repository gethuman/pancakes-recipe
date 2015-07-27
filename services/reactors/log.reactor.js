/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 2/18/14
 *
 * Listens for log events and propagates them appropriately
 */
var _       = require('lodash');
var raven   = require('raven');
var cls     = require('continuation-local-storage');

require('colors');

var errorClient = null;
/* eslint no-console:0 */

var ignoreErrs = [
    'Cannot read property \'session\' of null',
    'Invalid cookie header',
    'App was rejected',
    'Missing custom request token cookie',
    'Bad Request'
];

/**
 * Error handler
 * @param logData
 */
function errorHandler(logData) {
    logData = logData || {};
    var err = logData.err;
    delete logData.err;

    var session = cls.getNamespace('appSession');
    if (session && session.active) {
        var caller = session.get('caller');
        if (caller && caller.user) {
            logData.userId = caller.user._id;
            logData.username = caller.user.username;
        }

        logData.app = session.get('app');
        logData.lang = session.get('lang');
        logData.url = session.get('url');
        logData.visitorId = session.get('visitorId');
    }

    // if there is a msg, ignore these errors and just return
    var msg = logData.msg;
    if (msg) {
        for (var i = 0; i < ignoreErrs.length; i++) {
            if (msg.indexOf(ignoreErrs[i]) >= 0) {
                return;
            }
        }
    }

    if (!(err instanceof Error)) {
        logData.msg = JSON.stringify(err);
        err = null;
    }

    // sanity check since sometimes data not displayed in sentry for some reason
    logData.yoyo = 'Err is ' + err;

    err ?
        errorClient.captureError(err, { extra: logData }) :
        _.isString(logData) ?
            errorClient.captureMessage(logData, { extra: logData }) :
            logData.msg ?
                errorClient.captureMessage(logData.msg, { extra: logData }) :
                errorClient.captureMessage(JSON.stringify(logData), { extra: logData });
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
            var now = new Date();

            console.log('----');
            console.log('date: ' + (now.getMonth() + 1) + '/' + now.getDate() + '/' +
                now.getFullYear() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' +
                now.getSeconds() + ':' + now.getMilliseconds());
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
