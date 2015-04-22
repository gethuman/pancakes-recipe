/**
 * Author: Jeff Whelpley
 * Date: 3/5/14
 *
 * Prepare log data and put it on the bus
 */
module.exports = function (_, eventBus) {
    // @module({ "client": true })

    /**
     * Get the source from the error stack trace
     * @returns {*}
     */
    function getSource() {
        var origPrepareStackTrace = Error.prepareStackTrace;  // Save original Error.prepareStackTrace
        Error.prepareStackTrace = function (_, stack) {  // Override with function that just returns `stack`
            return stack;
        };

        var err = new Error();  // Create a new `Error`, which automatically gets `stack`
        var stack = err.stack;  // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
        Error.prepareStackTrace = origPrepareStackTrace;  // Restore original `Error.prepareStackTrace`
        stack.shift(); // Remove superfluous function calls on stack
        stack.shift();

        // Return caller's caller
        return (stack + '').split(',')[0];
    }

    /**
     * Debug statements in development
     * @param msg
     * @param logData
     */
    function debug(msg, logData) {
        logData = logData || {};
        logData.msg = msg;
        logData.level = 'debug';
        logData.source = getSource();
        eventBus.emit('log.debug', logData);
    }

    /**
     * info statements
     * @param msg
     * @param logData
     */
    function info(msg, logData) {
        logData = logData || {};
        logData.msg = msg;
        logData.level = 'info';
        logData.source = getSource();
        eventBus.emit('log.info', logData);
    }

    /**
     * Errors
     * @param msg
     * @param logData
     */
    function error(msg, logData) {
        logData = logData || {};
        var err;

        if (msg instanceof Error) {
            err = msg;
            logData.msg = logData.msg || msg.message;
            logData.stack = msg.stack;

            if (msg.code) { logData.code = msg.code; }
            if (msg.err) { logData.inner = msg.err.stack || msg.err.message; }
        }

        if (_.isObject(msg)) {
            msg = JSON.stringify(msg);
        }

        if (logData.err && logData.err instanceof Error) {
            err = logData.err;
            logData.msg = logData.msg || logData.err.message;
            logData.stack = logData.err.stack;
        }

        if (err) {
            logData.err = err;
        }

        logData.msg = (logData.msg || '') + ' ' + (msg || '');
        logData.level = 'error';
        logData.source = getSource();
        eventBus.emit('log.error', logData);
    }

    /**
     * Critical issues that we need to address immediately
     * @param msg
     * @param logData
     */
    function critical(msg, logData) {
        logData = logData || {};
        var err;

        if (msg instanceof Error) {
            err = msg;
            logData.msg = logData.msg || msg.message;
            logData.stack = msg.stack;

            if (msg.code) { logData.code = msg.code; }
            if (msg.err) { logData.inner = msg.err.stack || msg.err.message; }
        }

        if (_.isObject(msg)) {
            msg = JSON.stringify(msg);
        }

        if (logData.err && logData.err instanceof Error) {
            err = logData.err;
            logData.msg = logData.msg || logData.err.message;
            logData.stack = logData.err.stack;
        }

        if (err) {
            logData.err = err;
        }

        logData.msg = (logData.msg || '') + ' ' + (msg || '');
        logData.level = 'critical';
        logData.source = getSource();
        eventBus.emit('log.critical', logData);
    }

    /**
     * This is used at times in the catch of a promise chain. It
     * allows errors to be recorded in production while still getting
     * the error back for testing purposes (mostly for async operations
     * like the reactors)
     * @param err
     */
    function andThrow(err) {
        error(err);
        throw err;
    }

    // function to expose for this module
    return {
        debug: debug,
        info: info,
        error: error,
        critical: critical,
        andThrow: andThrow
    };
};