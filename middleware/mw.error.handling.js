/**
 * Author: Jeff Whelpley
 * Date: 3/27/14
 *
 * Monitoring for errors and adding profiling
 */
module.exports = function (Q, _, Boom, errorDecoder, config, log, eventBus, AppError) {

    /**
     * Configure global error handling which includes Q and catching uncaught exceptions
     */
    function handleGlobalError() {

        // make sure Q provides long stack traces (disabled in prod for performance)
        Q.longStackSupport = config.longStackSupport;

        // hopefully we handle errors before this point, but this will log anything not caught
        process.on('uncaughtException', function (err) {
            log.critical('uncaughtException: ' + err + '\n' + err.stack);

            /* eslint no-process-exit: 0 */
            process.exit(1);
        });
    }

    /**
     * Set up the pre-response error handler
     * @param server
     */
    function handlePreResponseError(server) {
        server.ext('onPreResponse', function (request, reply) {
            var response = request.response;
            var originalResponse = response;
            var msg;

            // No error, keep going with the reply as normal
            if (!response.isBoom) { reply.continue(); return; }

            // we need to convert to AppError if it is not already
            if (!(response instanceof AppError)) {

                // if legit 404 be sure to use that code (happens with not found in /dist on local)
                if (response.message.indexOf('404:') >= 0 ||
                    (response.output && response.output.payload &&
                    response.output.payload.statusCode === 404)) {

                    response = new AppError({
                        code: 'not_found',
                        msg: 'The resource ' + request.url.path + ' was not found'
                    });
                }
                else {
                    msg = response.message || (response + '');
                    if (response.data) { msg += ' : ' + response.data; }

                    log.error(msg);

                    response = new AppError({
                        code: response.code || 'api_error',
                        msg: msg,
                        err: response
                    });
                }
            }

            if (response.code && errorDecoder[response.code]) {
                var err = errorDecoder[response.code];

                if (request.path !== '/favicon.ico' && err.httpErrorCode !== 404) {
                    log.error(request.method + ' ' + request.path + ' (' + err.friendlyMessage + ')',
                        { err: originalResponse }   );
                }

                reply(Boom.create(err.httpErrorCode, err.friendlyMessage));
            }
            else {
                reply.continue();
            }
        });
    }

    /**
     * Start monitoring
     * @param ctx
     */
    function init(ctx) {
        handleGlobalError();
        handlePreResponseError(ctx.server);
        return new Q(ctx);
    }

    // exposing functions
    return {
        handleGlobalError: handleGlobalError,
        handlePreResponseError: handlePreResponseError,
        init: init
    };
};
